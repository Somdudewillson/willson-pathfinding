import {
  copyVector,
  getRoomShapeBottomRightPosition,
  getRoomShapeTopLeftPosition,
  gridPositionToWorldPosition,
} from "isaacscript-common";
import { FastMap } from "../utils/fastMap";
import { FastSet } from "../utils/fastSet";
import {
  expandVector,
  FlatGridVector,
  flattenVector,
  shiftFlat,
} from "../utils/flatGridVector";
import { GridEntityData } from "../utils/gridEntityData";
import { isValidFlatGridPosition, isValidGridPosition } from "../utils/utils";

export const enum Accessibility {
  NONE = 0,
  FLIGHT = 1,
  GROUND = 2,
}

export class RoomData {
  readonly shape: RoomShape;
  readonly sourceRoom: Room;

  private wallBlockedAreas = new FastMap<FlatGridVector, number>();
  private pitBlockedAreas = new FastMap<FlatGridVector, number>();
  private groundBlockedAreas = new FastMap<FlatGridVector, number>();
  private pitAreas = new FastMap<FlatGridVector, number>();

  private roomTiles = new Map<FlatGridVector, GridEntityData>();

  private static readonly collisionTypes = [
    EntityGridCollisionClass.GRIDCOLL_WALLS,
    EntityGridCollisionClass.GRIDCOLL_NOPITS,
    EntityGridCollisionClass.GRIDCOLL_GROUND,
    EntityGridCollisionClass.GRIDCOLL_PITSONLY,
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
    this.wallBlockedAreas = new FastMap<FlatGridVector, number>();
    this.pitBlockedAreas = new FastMap<FlatGridVector, number>();
    this.groundBlockedAreas = new FastMap<FlatGridVector, number>();
    this.pitAreas = new FastMap<FlatGridVector, number>();

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
      const cursorEntity = room.GetGridEntityFromPos(
        gridPositionToWorldPosition(cursor),
      );
      this.roomTiles.set(flatCursor, new GridEntityData(cursorEntity));

      // Update cursor position
      cursor.X += 1;
      if (!isValidGridPosition(cursor, this.shape)) {
        cursor.Y += 1;

        if (this.shape === RoomShape.ROOMSHAPE_LTL && cursor.Y >= 7) {
          cursor.X = 0;
        } else if (this.shape === RoomShape.ROOMSHAPE_LBL && cursor.Y >= 7) {
          cursor.X = 13;
        } else {
          cursor.X = start.X;
        }
      }
    } while (cursor.Y <= end.Y);

    // Flood fill everything
    for (const i of $range(0, 3)) {
      for (const tileEntry of this.roomTiles.entries()) {
        const testCollision = RoomData.collisionTypes[i];
        if (this.areaMaps[i].has(tileEntry[0])) {
          continue;
        }
        if (!RoomData.isGridDataPassable(tileEntry[1], testCollision)) {
          this.areaMaps[i].set(tileEntry[0], -1);
          continue;
        }

        const areaIndex = this.nextAreaIndex[i]++;
        this.floodFillArea(
          this.areaMaps[i],
          tileEntry[0],
          testCollision,
          areaIndex,
        );
      }
    }
  }

  private floodFillArea(
    areaMap: FastMap<FlatGridVector, number>,
    startPos: FlatGridVector,
    testCollision: EntityGridCollisionClass,
    indexToFill: int,
    useCached = true,
  ) {
    const unexplored: FlatGridVector[] = [startPos];
    const unexploredSet = new FastSet<FlatGridVector>();
    unexploredSet.add(startPos);
    while (unexplored.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
        for (const adjPos of RoomData.getCardinalNeighbors(toExplore)) {
          if (!isValidFlatGridPosition(adjPos, this.shape)) {
            continue;
          }
          if (
            !unexploredSet.has(adjPos) &&
            areaMap.get(adjPos) !== indexToFill
          ) {
            unexplored.push(adjPos);
            unexploredSet.add(adjPos);
          }
        }
      } else {
        areaMap.set(toExplore, -1);
      }
    }
  }

  public renderDebugDisplayGrid(): void {
    for (const tilePos of this.roomTiles.keys()) {
      const textPos = Isaac.WorldToScreen(
        gridPositionToWorldPosition(expandVector(tilePos)),
      );
      const area = this.groundBlockedAreas.get(tilePos);
      Isaac.RenderText(
        area.toString(),
        textPos.X,
        textPos.Y,
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

      if (cachedEntity.sameAs(actualEntity)) {
        continue;
      }

      for (const i of $range(0, 3)) {
        const testCollision = RoomData.collisionTypes[i];
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

  addPassableTile(areaMapIndex: int, tilePos: FlatGridVector): void {
    const testCollision = RoomData.collisionTypes[areaMapIndex];
    const areaMap = this.areaMaps[areaMapIndex];

    if (areaMap.get(tilePos) !== -1) {
      return;
    }

    for (const adjPos of RoomData.getCardinalNeighbors(tilePos)) {
      if (!isValidFlatGridPosition(adjPos, this.shape)) {
        continue;
      }
      const areaAtPos = areaMap.get(adjPos);
      if (areaAtPos === undefined || areaAtPos === -1) {
        continue;
      }

      this.floodFillArea(areaMap, tilePos, testCollision, areaAtPos, false);
      areaMap.set(tilePos, areaAtPos);
      return;
    }

    areaMap.set(tilePos, this.nextAreaIndex[areaMapIndex]++);
  }

  removePassableTile(areaMapIndex: int, tilePos: FlatGridVector): void {
    const testCollision = RoomData.collisionTypes[areaMapIndex];
    const areaMap = this.areaMaps[areaMapIndex];

    if (areaMap.get(tilePos) === -1) {
      return;
    }

    const adjAreas = [];
    for (const adjPos of RoomData.getCardinalNeighbors(tilePos)) {
      if (!isValidFlatGridPosition(adjPos, this.shape)) {
        continue;
      }
      const areaAtPos = areaMap.get(adjPos);
      if (areaAtPos === undefined || areaAtPos === -1) {
        continue;
      }
      adjAreas.push(adjPos);
    }

    if (adjAreas.length > 1) {
      const filledAreas = new FastSet<int>();

      for (const adjPos of adjAreas) {
        const areaAtPos = areaMap.get(adjPos);
        if (filledAreas.has(areaAtPos)) {
          continue;
        }

        const fillArea = this.nextAreaIndex[areaMapIndex]++;
        this.floodFillArea(areaMap, adjPos, testCollision, fillArea, false);
        filledAreas.add(fillArea);
      }
    }

    areaMap.set(tilePos, -1);
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
   * Checks if a given position can be passed with an entity with a given `EntityGridCollisionClass`.
   *
   * @param position The position to check.
   * @param collisionClass The `EntityGridCollisionClass` to check against.
   * Does not currently fully support `GRIDCOLL_WALLS_X`, `GRIDCOLL_WALLS_Y`, or `GRIDCOLL_BULLET`.
   * @returns If the provided position is passable for the given `EntityGridCollisionClass`.
   */
  isPositionPassable(
    position: FlatGridVector,
    collisionClass: EntityGridCollisionClass,
  ): boolean {
    if (
      collisionClass === undefined ||
      collisionClass === EntityGridCollisionClass.GRIDCOLL_NONE
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
      return collisionClass !== EntityGridCollisionClass.GRIDCOLL_PITSONLY;
    }
    const gridType = gridEntity.type;

    switch (collisionClass) {
      default:
      case EntityGridCollisionClass.GRIDCOLL_WALLS_X:
      case EntityGridCollisionClass.GRIDCOLL_WALLS_Y:
      case EntityGridCollisionClass.GRIDCOLL_WALLS:
        if (
          gridType === GridEntityType.GRID_WALL ||
          gridType === GridEntityType.GRID_PILLAR ||
          gridType === GridEntityType.GRID_DOOR
        ) {
          return false;
        }
        break;
      case EntityGridCollisionClass.GRIDCOLL_NOPITS:
        if (gridType === GridEntityType.GRID_PIT) {
          break;
        }
      // Falls through
      case EntityGridCollisionClass.GRIDCOLL_BULLET:
      case EntityGridCollisionClass.GRIDCOLL_GROUND:
        if (
          gridType === GridEntityType.GRID_DECORATION ||
          gridType === GridEntityType.GRID_GRAVITY ||
          gridType === GridEntityType.GRID_PRESSURE_PLATE ||
          gridType === GridEntityType.GRID_SPIDERWEB ||
          gridType === GridEntityType.GRID_TRAPDOOR ||
          ((gridType === GridEntityType.GRID_ROCK ||
            gridType === GridEntityType.GRID_ROCK_ALT ||
            gridType === GridEntityType.GRID_ROCK_ALT2 ||
            gridType === GridEntityType.GRID_ROCK_SPIKED ||
            gridType === GridEntityType.GRID_ROCK_SS ||
            gridType === GridEntityType.GRID_ROCKT ||
            gridType === GridEntityType.GRID_ROCK_BOMB) &&
            gridEntity.state !== RockState.UNBROKEN) ||
          (gridType === GridEntityType.GRID_POOP &&
            gridEntity.state === PoopState.COMPLETELY_DESTROYED) ||
          (gridType === GridEntityType.GRID_PIT && gridEntity.state === 1) ||
          (gridType === GridEntityType.GRID_TNT &&
            gridEntity.state === TNTState.EXPLODED)
        ) {
          break;
        }
        return false;
      case EntityGridCollisionClass.GRIDCOLL_PITSONLY:
        return gridType === GridEntityType.GRID_PIT && gridEntity.state === 0;
    }

    return true;
  }

  public isPathPossible(
    startPos: Vector,
    endPos: Vector,
    collisionClass: EntityGridCollisionClass,
  ): boolean {
    let groupMap: FastMap<FlatGridVector, number>;
    switch (collisionClass) {
      default:
      case EntityGridCollisionClass.GRIDCOLL_WALLS_X:
      case EntityGridCollisionClass.GRIDCOLL_WALLS_Y:
      case EntityGridCollisionClass.GRIDCOLL_WALLS:
        groupMap = this.wallBlockedAreas;
        break;
      case EntityGridCollisionClass.GRIDCOLL_NOPITS:
        groupMap = this.pitBlockedAreas;
        break;
      case EntityGridCollisionClass.GRIDCOLL_BULLET:
      case EntityGridCollisionClass.GRIDCOLL_GROUND:
        groupMap = this.groundBlockedAreas;
        break;
      case EntityGridCollisionClass.GRIDCOLL_PITSONLY:
        groupMap = this.pitAreas;
        break;
    }

    const startGroup = groupMap.get(flattenVector(startPos));
    const endGroup = groupMap.get(flattenVector(endPos));
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
