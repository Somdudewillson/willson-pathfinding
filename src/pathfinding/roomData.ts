import {
  EntityGridCollisionClass,
  GridEntityType,
  PoopState,
  RockState,
  RoomShape,
  TNTState,
} from "isaac-typescript-definitions";
import {
  copyVector,
  getRoomShapeBottomRightPosition,
  getRoomShapeTopLeftPosition,
  gridPositionToWorldPosition,
  isValidGridPosition,
} from "isaacscript-common";
import {
  expandVector,
  FlatGridVector,
  flattenVector,
  isValidFlatGridPosition,
  shiftFlat,
} from "../utils/flatGridVector";
import { GridEntityData } from "../utils/gridEntityData";

export const enum Accessibility {
  NONE = 0,
  FLIGHT = 1,
  GROUND = 2,
}

export class RoomData {
  readonly shape: RoomShape;
  readonly sourceRoom: Room;

  private wallBlockedAreas = new LuaTable<FlatGridVector, number>();
  private pitBlockedAreas = new LuaTable<FlatGridVector, number>();
  private groundBlockedAreas = new LuaTable<FlatGridVector, number>();
  private pitAreas = new LuaTable<FlatGridVector, number>();

  private roomTiles = new Map<FlatGridVector, GridEntityData>();

  private static readonly collisionTypes = [
    EntityGridCollisionClass.WALLS,
    EntityGridCollisionClass.NO_PITS,
    EntityGridCollisionClass.GROUND,
    EntityGridCollisionClass.PITS_ONLY,
  ];

  private areaMaps = [
    this.wallBlockedAreas,
    this.pitBlockedAreas,
    this.groundBlockedAreas,
    this.pitAreas,
  ];

  private readonly nextAreaIndex = [1, 1, 1, 1];

  constructor(sourceRoom: Room) {
    this.sourceRoom = sourceRoom;
    this.shape = sourceRoom.GetRoomShape();

    this.fullUpdateAreas(sourceRoom);
  }

  private fullUpdateAreas(room: Room): void {
    this.wallBlockedAreas = new LuaTable<FlatGridVector, number>();
    this.pitBlockedAreas = new LuaTable<FlatGridVector, number>();
    this.groundBlockedAreas = new LuaTable<FlatGridVector, number>();
    this.pitAreas = new LuaTable<FlatGridVector, number>();

    this.areaMaps = [
      this.wallBlockedAreas,
      this.pitBlockedAreas,
      this.groundBlockedAreas,
      this.pitAreas,
    ];

    this.roomTiles = new Map<FlatGridVector, GridEntityData>();
    const start = getRoomShapeTopLeftPosition(this.shape);
    const end = getRoomShapeBottomRightPosition(this.shape);
    const cursor = copyVector(start);
    do {
      const flatCursor = flattenVector(cursor);
      const worldPosition = gridPositionToWorldPosition(cursor);
      const cursorEntity = room.GetGridEntityFromPos(worldPosition);
      this.roomTiles.set(flatCursor, new GridEntityData(cursorEntity));

      // Update cursor position
      cursor.X += 1;
      if (!isValidGridPosition(cursor, this.shape)) {
        cursor.Y += 1;

        if (this.shape === RoomShape.LTL && cursor.Y >= 7) {
          cursor.X = 0;
        } else if (this.shape === RoomShape.LBL && cursor.Y >= 7) {
          cursor.X = 13;
        } else {
          cursor.X = start.X;
        }
      }
    } while (cursor.Y <= end.Y);

    // Flood fill everything
    for (const i of $range(0, 3)) {
      for (const tileEntry of this.roomTiles.entries()) {
        const testCollision = RoomData.collisionTypes[i]!;
        if (this.areaMaps[i]!.has(tileEntry[0])) {
          continue;
        }
        if (!RoomData.isGridDataPassable(tileEntry[1], testCollision)) {
          this.areaMaps[i]!.set(tileEntry[0], -1);
          continue;
        }

        const areaIndex = this.nextAreaIndex[i]++;
        this.floodFillArea(
          this.areaMaps[i]!,
          tileEntry[0],
          testCollision,
          areaIndex,
        );
      }
    }
  }

  private floodFillArea(
    areaMap: LuaTable<FlatGridVector, number>,
    startPosition: FlatGridVector,
    testCollision: EntityGridCollisionClass,
    indexToFill: int,
    useCached = true,
  ) {
    const unexplored: FlatGridVector[] = [startPosition];
    const unexploredSet = new LuaTable<FlatGridVector, boolean>();
    unexploredSet.set(startPosition, true);
    while (unexplored.length > 0) {
      const toExplore = unexplored.pop()!;
      unexploredSet.delete(toExplore);

      let gridEntExplored: GridEntityData | undefined;
      if (useCached) {
        gridEntExplored = this.roomTiles.get(toExplore);
      } else {
        gridEntExplored = new GridEntityData(
          this.sourceRoom.GetGridEntityFromPos(
            gridPositionToWorldPosition(expandVector(toExplore)),
          ),
        );
      }

      if (RoomData.isGridDataPassable(gridEntExplored, testCollision)) {
        areaMap.set(toExplore, indexToFill);
        for (const adjacentPosition of RoomData.getCardinalNeighbors(
          toExplore,
        )) {
          if (!isValidFlatGridPosition(adjacentPosition, this.shape)) {
            continue;
          }
          if (
            !unexploredSet.has(adjacentPosition) &&
            areaMap.get(adjacentPosition) !== indexToFill
          ) {
            unexplored.push(adjacentPosition);
            unexploredSet.set(adjacentPosition, true);
          }
        }
      } else {
        areaMap.set(toExplore, -1);
      }
    }
  }

  public renderDebugDisplayGrid(): void {
    for (const tilePosition of this.roomTiles.keys()) {
      const textPosition = Isaac.WorldToScreen(
        gridPositionToWorldPosition(expandVector(tilePosition)),
      );
      const area = this.groundBlockedAreas.get(tilePosition);
      Isaac.RenderText(
        area.toString(),
        textPosition.X,
        textPosition.Y,
        1,
        1,
        1,
        area === -1 ? 0 : 1,
      );
    }
  }

  public incrementalUpdateAreas(): void {
    for (const testTile of this.roomTiles.entries()) {
      const cachedEntity = testTile[1];
      const actualEntity = new GridEntityData(
        this.sourceRoom.GetGridEntityFromPos(
          gridPositionToWorldPosition(expandVector(testTile[0])),
        ),
      );

      if (cachedEntity.equals(actualEntity)) {
        continue;
      }

      for (const i of $range(0, 3)) {
        const testCollision = RoomData.collisionTypes[i]!;
        const isNowPassable = RoomData.isGridDataPassable(
          actualEntity,
          testCollision,
        );
        if (
          RoomData.isGridDataPassable(testTile[1], testCollision) ===
          isNowPassable
        ) {
          continue;
        }

        if (isNowPassable) {
          this.addPassableTile(i, testTile[0]);
        } else {
          this.removePassableTile(i, testTile[0]);
        }
      }

      this.roomTiles.set(testTile[0], actualEntity);
    }
  }

  addPassableTile(areaMapIndex: int, tilePosition: FlatGridVector): void {
    const testCollision = RoomData.collisionTypes[areaMapIndex]!;
    const areaMap = this.areaMaps[areaMapIndex]!;

    if (areaMap.get(tilePosition) !== -1) {
      return;
    }

    for (const adjacentPosition of RoomData.getCardinalNeighbors(
      tilePosition,
    )) {
      if (!isValidFlatGridPosition(adjacentPosition, this.shape)) {
        continue;
      }
      const areaAtPosition = areaMap.get(adjacentPosition);
      if (areaAtPosition === undefined || areaAtPosition === -1) {
        continue;
      }

      this.floodFillArea(
        areaMap,
        tilePosition,
        testCollision,
        areaAtPosition,
        false,
      );
      areaMap.set(tilePosition, areaAtPosition);
      return;
    }

    areaMap.set(tilePosition, this.nextAreaIndex[areaMapIndex]++);
  }

  removePassableTile(areaMapIndex: int, tilePosition: FlatGridVector): void {
    const testCollision = RoomData.collisionTypes[areaMapIndex]!;
    const areaMap = this.areaMaps[areaMapIndex]!;

    if (areaMap.get(tilePosition) === -1) {
      return;
    }

    const adjacentAreas: int[] = [];
    for (const adjacentPosition of RoomData.getCardinalNeighbors(
      tilePosition,
    )) {
      if (!isValidFlatGridPosition(adjacentPosition, this.shape)) {
        continue;
      }
      const areaAtPosition = areaMap.get(adjacentPosition);
      if (areaAtPosition === undefined || areaAtPosition === -1) {
        continue;
      }
      adjacentAreas.push(adjacentPosition);
    }

    if (adjacentAreas.length > 1) {
      const filledAreas = new LuaTable<int, boolean>();

      for (const adjacentPosition of adjacentAreas) {
        const areaAtPosition = areaMap.get(adjacentPosition);
        if (filledAreas.has(areaAtPosition)) {
          continue;
        }

        const fillArea = this.nextAreaIndex[areaMapIndex]++;
        this.floodFillArea(
          areaMap,
          adjacentPosition,
          testCollision,
          fillArea,
          false,
        );
        filledAreas.set(fillArea, true);
      }
    }

    areaMap.set(tilePosition, -1);
  }

  getGridEntity(position: FlatGridVector): GridEntity | undefined {
    if (!isValidFlatGridPosition(position, this.shape)) {
      return undefined;
    }

    return this.sourceRoom.GetGridEntityFromPos(
      gridPositionToWorldPosition(expandVector(position)),
    );
  }

  /**
   * Checks if a given position can be passed with an entity with a given
   * `EntityGridCollisionClass`.
   *
   * @param position The position to check.
   * @param collisionClass The `EntityGridCollisionClass` to check against. Does not currently fully
   *                       support `GRIDCOLL_WALLS_X`, `GRIDCOLL_WALLS_Y`, or `GRIDCOLL_BULLET`.
   * @returns If the provided position is passable for the given `EntityGridCollisionClass`.
   */
  isPositionPassable(
    position: FlatGridVector,
    collisionClass: EntityGridCollisionClass,
  ): boolean {
    if (
      collisionClass === undefined ||
      collisionClass === EntityGridCollisionClass.NONE
    ) {
      return true;
    }
    if (!isValidFlatGridPosition(position, this.shape)) {
      return false;
    }

    const gridEntity = this.getGridEntity(position);
    return RoomData.isGridEntityPassable(gridEntity, collisionClass);
  }

  private static isGridEntityPassable(
    gridEntity: GridEntity | undefined,
    collisionClass: EntityGridCollisionClass,
  ): boolean {
    return RoomData.isGridDataPassable(
      new GridEntityData(gridEntity),
      collisionClass,
    );
  }

  private static isGridDataPassable(
    gridEntity: GridEntityData | undefined,
    collisionClass: EntityGridCollisionClass,
  ): boolean {
    if (gridEntity === undefined || gridEntity.isUndefined()) {
      return collisionClass !== EntityGridCollisionClass.PITS_ONLY;
    }
    const gridType = gridEntity.type;

    switch (collisionClass) {
      default:
      case EntityGridCollisionClass.WALLS_X:
      case EntityGridCollisionClass.WALLS_Y:
      case EntityGridCollisionClass.WALLS:
        if (
          gridType === GridEntityType.WALL ||
          gridType === GridEntityType.PILLAR ||
          gridType === GridEntityType.DOOR
        ) {
          return false;
        }
        break;
      case EntityGridCollisionClass.NO_PITS:
        if (gridType === GridEntityType.PIT) {
          break;
        }
      // Falls through
      case EntityGridCollisionClass.BULLET:
      case EntityGridCollisionClass.GROUND:
        if (
          gridType === GridEntityType.DECORATION ||
          gridType === GridEntityType.GRAVITY ||
          gridType === GridEntityType.PRESSURE_PLATE ||
          gridType === GridEntityType.SPIDER_WEB ||
          gridType === GridEntityType.TRAPDOOR ||
          ((gridType === GridEntityType.ROCK ||
            gridType === GridEntityType.ROCK_ALT ||
            gridType === GridEntityType.ROCK_ALT_2 ||
            gridType === GridEntityType.ROCK_SPIKED ||
            gridType === GridEntityType.ROCK_SUPER_SPECIAL ||
            gridType === GridEntityType.ROCK_TINTED ||
            gridType === GridEntityType.ROCK_BOMB) &&
            gridEntity.state !== RockState.UNBROKEN) ||
          (gridType === GridEntityType.POOP &&
            gridEntity.state === PoopState.COMPLETELY_DESTROYED) ||
          (gridType === GridEntityType.PIT && gridEntity.state === 1) ||
          (gridType === GridEntityType.TNT &&
            gridEntity.state === TNTState.EXPLODED)
        ) {
          break;
        }
        return false;
      case EntityGridCollisionClass.PITS_ONLY:
        return gridType === GridEntityType.PIT && gridEntity.state === 0;
    }

    return true;
  }

  public isPathPossible(
    startPosition: Vector,
    endPosition: Vector,
    collisionClass: EntityGridCollisionClass,
  ): boolean {
    let groupMap: LuaTable<FlatGridVector, number>;
    switch (collisionClass) {
      default:
      case EntityGridCollisionClass.WALLS_X:
      case EntityGridCollisionClass.WALLS_Y:
      case EntityGridCollisionClass.WALLS:
        groupMap = this.wallBlockedAreas;
        break;
      case EntityGridCollisionClass.NO_PITS:
        groupMap = this.pitBlockedAreas;
        break;
      case EntityGridCollisionClass.BULLET:
      case EntityGridCollisionClass.GROUND:
        groupMap = this.groundBlockedAreas;
        break;
      case EntityGridCollisionClass.PITS_ONLY:
        groupMap = this.pitAreas;
        break;
    }

    const startGroup = groupMap.get(flattenVector(startPosition));
    const endGroup = groupMap.get(flattenVector(endPosition));
    return startGroup === endGroup && startGroup !== -1;
  }

  private static getCardinalNeighbors(
    position: FlatGridVector,
  ): FlatGridVector[] {
    return [
      shiftFlat(position, -1, 0),
      shiftFlat(position, 1, 0),
      shiftFlat(position, 0, -1),
      shiftFlat(position, 0, 1),
    ];
  }

  private static getChessboardNeighbors(
    position: FlatGridVector,
  ): FlatGridVector[] {
    return [
      shiftFlat(position, -1, 0),
      shiftFlat(position, 1, 0),
      shiftFlat(position, 0, -1),
      shiftFlat(position, 0, 1),
      shiftFlat(position, -1, -1),
      shiftFlat(position, -1, 1),
      shiftFlat(position, 1, -1),
      shiftFlat(position, 1, 1),
    ];
  }
}
