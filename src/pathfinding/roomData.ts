import {
  expandVector,
  FlatGridVector,
  shiftFlat,
} from "../utils/flatGridVector";
import { gridToWorldPos, isValidFlatGridPos } from "../utils/utils";

export const enum Accessibility {
  NONE = 0,
  FLIGHT = 1,
  GROUND = 2,
}

export class RoomData {
  readonly shape: RoomShape;
  readonly sourceRoom: Room;
  groundObstacles = new Set<FlatGridVector>();
  flyingObstacles = new Set<FlatGridVector>();

  constructor(sourceRoom: Room) {
    this.sourceRoom = sourceRoom;
    this.shape = sourceRoom.GetRoomShape();
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
      // Falls through.
      case EntityGridCollisionClass.GRIDCOLL_NOPITS:
        if (gridType === GridEntityType.GRID_PIT) {
          break;
        }
        return false;
      case EntityGridCollisionClass.GRIDCOLL_PITSONLY:
        return gridType === GridEntityType.GRID_PIT;
    }

    return true;
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
