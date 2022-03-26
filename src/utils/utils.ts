import { expandVector, FlatGridVector } from "./flatGridVector";

/** Convert world position `Vector` to grid position. */
export function worldToGridPos(worldPos: Vector): Vector {
  return Vector(
    Math.round(worldPos.X / 40 - 2),
    Math.round(worldPos.Y / 40 - 4),
  );
}

/** Convert world position `Vector` to grid position. */
export function fastWorldToGridPos(worldPos: Vector): Vector {
  return Vector(worldPos.X / 40 - 2, worldPos.Y / 40 - 4);
}

/** Convert grid position `Vector` to world position. */
export function gridToWorldPos(gridPos: Vector): Vector {
  return Vector((gridPos.X + 2) * 40, (gridPos.Y + 4) * 40);
}

/** Test if a grid position is actually in the given `RoomShape` */
export function isValidGridPos(pos: Vector, shape: RoomShape): boolean {
  if (pos.X < 0 || pos.Y < 0) {
    return false;
  }

  switch (shape) {
    default:
    case RoomShape.ROOMSHAPE_1x1:
      if (pos.X >= 13 || pos.Y >= 7) {
        return false;
      }
      break;
    case RoomShape.ROOMSHAPE_IH:
      if (pos.X >= 13 || pos.Y <= 2 || pos.Y >= 4) {
        return false;
      }
      break;
    case RoomShape.ROOMSHAPE_IV:
      if (pos.X <= 3 || pos.X >= 9 || pos.Y >= 7) {
        return false;
      }
      break;
    case RoomShape.ROOMSHAPE_1x2:
      if (pos.X >= 13 || pos.Y >= 14) {
        return false;
      }
      break;
    case RoomShape.ROOMSHAPE_IIV:
      if (pos.X <= 3 || pos.X >= 9 || pos.Y >= 14) {
        return false;
      }
      break;
    case RoomShape.ROOMSHAPE_2x1:
      if (pos.X >= 26 || pos.Y >= 7) {
        return false;
      }
      break;
    case RoomShape.ROOMSHAPE_IIH:
      if (pos.X >= 26 || pos.Y <= 2 || pos.Y >= 4) {
        return false;
      }
      break;
    case RoomShape.ROOMSHAPE_2x2:
      if (pos.X >= 26 || pos.Y >= 14) {
        return false;
      }
      break;
    case RoomShape.ROOMSHAPE_LTL:
      if (pos.X >= 26 || pos.Y >= 14) {
        return false;
      }
      if (pos.X <= 12 && pos.Y <= 6) {
        return false;
      }
      break;
    case RoomShape.ROOMSHAPE_LTR:
      if (pos.X >= 26 || pos.Y >= 14) {
        return false;
      }
      if (pos.X >= 13 && pos.Y <= 6) {
        return false;
      }
      break;
    case RoomShape.ROOMSHAPE_LBL:
      if (pos.X >= 26 || pos.Y >= 14) {
        return false;
      }
      if (pos.X <= 12 && pos.Y >= 7) {
        return false;
      }
      break;
    case RoomShape.ROOMSHAPE_LBR:
      if (pos.X >= 26 || pos.Y >= 14) {
        return false;
      }
      if (pos.X >= 13 && pos.Y >= 7) {
        return false;
      }
      break;
  }

  return true;
}

/** Test if a flattened grid position is actually in the given `RoomShape` */
export function isValidFlatGridPos(
  pos: FlatGridVector,
  shape: RoomShape,
): boolean {
  return isValidGridPos(expandVector(pos), shape);
}
