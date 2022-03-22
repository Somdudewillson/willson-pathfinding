import { FastMap } from "../utils/fastMap";
import { FastSet } from "../utils/fastSet";
import {
  expandVector,
  FlatGridVector,
  flattenVector,
  shiftFlat,
} from "../utils/flatGridVector";
import {
  getBottomRightPos,
  getTopLeftPos,
  gridToWorldPos,
  isValidFlatGridPos,
  isValidGridPos,
} from "../utils/utils";

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
  private roomTiles = new Map<FlatGridVector, GridEntity | undefined>();

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

    const collisionTypes = [
      EntityGridCollisionClass.GRIDCOLL_WALLS,
      EntityGridCollisionClass.GRIDCOLL_NOPITS,
      EntityGridCollisionClass.GRIDCOLL_GROUND,
      EntityGridCollisionClass.GRIDCOLL_PITSONLY,
    ];
    const areaMaps = [
      this.wallBlockedAreas,
      this.pitBlockedAreas,
      this.groundBlockedAreas,
      this.pitAreas,
    ];
    const nextAreaIndex = [1, 1, 1, 1];

    this.roomTiles = new Map<FlatGridVector, GridEntity | undefined>();
    const start = getTopLeftPos(this.shape);
    const end = getBottomRightPos(this.shape);
    const cursor = getTopLeftPos(this.shape);
    do {
      const flatCursor = flattenVector(cursor);
      const cursorEntity = room.GetGridEntityFromPos(gridToWorldPos(cursor));
      this.roomTiles.set(flatCursor, cursorEntity);

      // Update cursor position
      cursor.X += 1;
      if (!isValidGridPos(cursor, this.shape)) {
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
        const testCollision = collisionTypes[i];
        if (areaMaps[i].has(tileEntry[0])) {
          continue;
        }
        if (!RoomData.isGridEntityPassable(tileEntry[1], testCollision)) {
          areaMaps[i].set(tileEntry[0], -1);
          continue;
        }

        const areaIndex = nextAreaIndex[i]++;
        const unexplored: FlatGridVector[] = [tileEntry[0]];
        const unexploredSet = new FastSet<FlatGridVector>();
        unexploredSet.add(tileEntry[0]);
        while (unexplored.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const toExplore = unexplored.pop()!;
          unexploredSet.delete(toExplore);
          const gridEntExplored = this.roomTiles.get(toExplore);

          if (RoomData.isGridEntityPassable(gridEntExplored, testCollision)) {
            areaMaps[i].set(toExplore, areaIndex);
            for (const adjPos of RoomData.getCardinalNeighbors(toExplore)) {
              if (!isValidFlatGridPos(adjPos, this.shape)) {
                continue;
              }
              if (!unexploredSet.has(adjPos) && !areaMaps[i].has(adjPos)) {
                unexplored.push(adjPos);
                unexploredSet.add(adjPos);
              }
            }
          } else {
            areaMaps[i].set(toExplore, -1);
          }
        }
      }
    }
  }

  public renderDebugDisplayGrid(): void {
    for (const tilePos of this.roomTiles.keys()) {
      const textPos = Isaac.WorldToScreen(
        gridToWorldPos(expandVector(tilePos)),
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

  getGridEntity(pos: FlatGridVector): GridEntity | undefined {
    if (!isValidFlatGridPos(pos, this.shape)) {
      return undefined;
    }

    return this.sourceRoom.GetGridEntityFromPos(
      gridToWorldPos(expandVector(pos)),
    );
  }

  /**
   * Checks if a given position can be passed with an entity with a given `EntityGridCollisionClass`.
   *
   * @param pos The pos to check.
   * @param collisionClass The `EntityGridCollisionClass` to check against.
   * Does not currently fully support `GRIDCOLL_WALLS_X`, `GRIDCOLL_WALLS_Y`, or `GRIDCOLL_BULLET`.
   * @returns If the provided position is passable for the given `EntityGridCollisionClass`.
   */
  isPosPassable(
    pos: FlatGridVector,
    collisionClass: EntityGridCollisionClass,
  ): boolean {
    if (
      collisionClass === undefined ||
      collisionClass === EntityGridCollisionClass.GRIDCOLL_NONE
    ) {
      return true;
    }
    if (!isValidFlatGridPos(pos, this.shape)) {
      return false;
    }

    const gridEntity = this.getGridEntity(pos);
    return RoomData.isGridEntityPassable(gridEntity, collisionClass);
  }

  private static isGridEntityPassable(
    gridEntity: GridEntity | undefined,
    collisionClass: EntityGridCollisionClass,
  ): boolean {
    if (gridEntity === undefined) {
      return collisionClass !== EntityGridCollisionClass.GRIDCOLL_PITSONLY;
    }
    const gridType = gridEntity.GetType();

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
      // Falls through.
      case EntityGridCollisionClass.GRIDCOLL_BULLET:
      case EntityGridCollisionClass.GRIDCOLL_GROUND:
        if (
          gridType === GridEntityType.GRID_DECORATION ||
          gridType === GridEntityType.GRID_GRAVITY ||
          gridType === GridEntityType.GRID_PRESSURE_PLATE ||
          gridType === GridEntityType.GRID_SPIDERWEB
        ) {
          break;
        }
        return false;
      case EntityGridCollisionClass.GRIDCOLL_PITSONLY:
        return gridType === GridEntityType.GRID_PIT;
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

  private static getCardinalNeighbors(pos: FlatGridVector): FlatGridVector[] {
    return [
      shiftFlat(pos, -1, 0),
      shiftFlat(pos, 1, 0),
      shiftFlat(pos, 0, -1),
      shiftFlat(pos, 0, 1),
    ];
  }

  private static getChessboardNeighbors(pos: FlatGridVector): FlatGridVector[] {
    return [
      shiftFlat(pos, -1, 0),
      shiftFlat(pos, 1, 0),
      shiftFlat(pos, 0, -1),
      shiftFlat(pos, 0, 1),
      shiftFlat(pos, -1, -1),
      shiftFlat(pos, -1, 1),
      shiftFlat(pos, 1, -1),
      shiftFlat(pos, 1, 1),
    ];
  }
}
