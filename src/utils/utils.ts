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

/** Get the grid position of a `DoorSlot` in a room of the given `RoomShape` */
export function getSlotGridPos(slot: DoorSlot, shape: RoomShape): Vector {
  switch (shape) {
    default:
    case RoomShape.ROOMSHAPE_1x1:
      switch (slot) {
        case DoorSlot.LEFT0:
          return Vector(-1, 3);
        case DoorSlot.UP0:
          return Vector(6, -1);
        case DoorSlot.RIGHT0:
          return Vector(13, 3);
        case DoorSlot.DOWN0:
          return Vector(6, 7);
        case DoorSlot.LEFT1:
          return Vector(-1, 10);
        case DoorSlot.UP1:
          return Vector(4, 0);
        case DoorSlot.RIGHT1:
          return Vector(13, 10);
        case DoorSlot.DOWN1:
          return Vector(4, 8);

        default:
          Isaac.DebugString(`Invalid DoorSlot [${slot}]!`);
          return Vector.Zero;
      }
    case RoomShape.ROOMSHAPE_IH:
      switch (slot) {
        case DoorSlot.LEFT0:
          return Vector(-1, 3);
        case DoorSlot.UP0:
          return Vector(6, 2);
        case DoorSlot.RIGHT0:
          return Vector(13, 3);
        case DoorSlot.DOWN0:
          return Vector(6, 4);
        case DoorSlot.LEFT1:
          return Vector(-1, 10);
        case DoorSlot.UP1:
          return Vector(4, 3);
        case DoorSlot.RIGHT1:
          return Vector(13, 10);
        case DoorSlot.DOWN1:
          return Vector(4, 5);

        default:
          Isaac.DebugString(`Invalid DoorSlot [${slot}]!`);
          return Vector.Zero;
      }
    case RoomShape.ROOMSHAPE_IV:
      switch (slot) {
        case DoorSlot.LEFT0:
          return Vector(3, 3);
        case DoorSlot.UP0:
          return Vector(6, -1);
        case DoorSlot.RIGHT0:
          return Vector(9, 3);
        case DoorSlot.DOWN0:
          return Vector(6, 7);
        case DoorSlot.LEFT1:
          return Vector(3, 10);
        case DoorSlot.UP1:
          return Vector(4, 0);
        case DoorSlot.RIGHT1:
          return Vector(9, 10);
        case DoorSlot.DOWN1:
          return Vector(4, 8);

        default:
          Isaac.DebugString(`Invalid DoorSlot [${slot}]!`);
          return Vector.Zero;
      }
    case RoomShape.ROOMSHAPE_1x2:
      switch (slot) {
        case DoorSlot.LEFT0:
          return Vector(-1, 3);
        case DoorSlot.UP0:
          return Vector(6, -1);
        case DoorSlot.RIGHT0:
          return Vector(13, 3);
        case DoorSlot.DOWN0:
          return Vector(6, 14);
        case DoorSlot.LEFT1:
          return Vector(-1, 10);
        case DoorSlot.UP1:
          return Vector(4, 0);
        case DoorSlot.RIGHT1:
          return Vector(13, 10);
        case DoorSlot.DOWN1:
          return Vector(4, 15);

        default:
          Isaac.DebugString(`Invalid DoorSlot [${slot}]!`);
          return Vector.Zero;
      }
    case RoomShape.ROOMSHAPE_IIV:
      switch (slot) {
        case DoorSlot.LEFT0:
          return Vector(3, 3);
        case DoorSlot.UP0:
          return Vector(6, -1);
        case DoorSlot.RIGHT0:
          return Vector(9, 3);
        case DoorSlot.DOWN0:
          return Vector(6, 14);
        case DoorSlot.LEFT1:
          return Vector(3, 10);
        case DoorSlot.UP1:
          return Vector(4, 0);
        case DoorSlot.RIGHT1:
          return Vector(9, 10);
        case DoorSlot.DOWN1:
          return Vector(4, 15);

        default:
          Isaac.DebugString(`Invalid DoorSlot [${slot}]!`);
          return Vector.Zero;
      }
    case RoomShape.ROOMSHAPE_2x1:
      switch (slot) {
        case DoorSlot.LEFT0:
          return Vector(-1, 3);
        case DoorSlot.UP0:
          return Vector(6, -1);
        case DoorSlot.RIGHT0:
          return Vector(26, 3);
        case DoorSlot.DOWN0:
          return Vector(6, 7);
        case DoorSlot.LEFT1:
          return Vector(-1, 10);
        case DoorSlot.UP1:
          return Vector(19, -1);
        case DoorSlot.RIGHT1:
          return Vector(26, 10);
        case DoorSlot.DOWN1:
          return Vector(19, 7);

        default:
          Isaac.DebugString(`Invalid DoorSlot [${slot}]!`);
          return Vector.Zero;
      }
    case RoomShape.ROOMSHAPE_IIH:
      switch (slot) {
        case DoorSlot.LEFT0:
          return Vector(-1, 3);
        case DoorSlot.UP0:
          return Vector(6, 2);
        case DoorSlot.RIGHT0:
          return Vector(26, 3);
        case DoorSlot.DOWN0:
          return Vector(6, 4);
        case DoorSlot.LEFT1:
          return Vector(-1, 10);
        case DoorSlot.UP1:
          return Vector(19, 2);
        case DoorSlot.RIGHT1:
          return Vector(26, 10);
        case DoorSlot.DOWN1:
          return Vector(19, 4);

        default:
          Isaac.DebugString(`Invalid DoorSlot [${slot}]!`);
          return Vector.Zero;
      }
    case RoomShape.ROOMSHAPE_2x2:
      switch (slot) {
        case DoorSlot.LEFT0:
          return Vector(-1, 3);
        case DoorSlot.UP0:
          return Vector(6, -1);
        case DoorSlot.RIGHT0:
          return Vector(26, 3);
        case DoorSlot.DOWN0:
          return Vector(6, 14);
        case DoorSlot.LEFT1:
          return Vector(-1, 10);
        case DoorSlot.UP1:
          return Vector(19, -1);
        case DoorSlot.RIGHT1:
          return Vector(26, 10);
        case DoorSlot.DOWN1:
          return Vector(19, 14);

        default:
          Isaac.DebugString(`Invalid DoorSlot [${slot}]!`);
          return Vector.Zero;
      }
    case RoomShape.ROOMSHAPE_LTL:
      switch (slot) {
        case DoorSlot.LEFT0:
          return Vector(12, 3);
        case DoorSlot.UP0:
          return Vector(6, 6);
        case DoorSlot.RIGHT0:
          return Vector(26, 3);
        case DoorSlot.DOWN0:
          return Vector(6, 14);
        case DoorSlot.LEFT1:
          return Vector(-1, 10);
        case DoorSlot.UP1:
          return Vector(19, -1);
        case DoorSlot.RIGHT1:
          return Vector(26, 10);
        case DoorSlot.DOWN1:
          return Vector(19, 14);

        default:
          Isaac.DebugString(`Invalid DoorSlot [${slot}]!`);
          return Vector.Zero;
      }
    case RoomShape.ROOMSHAPE_LTR:
      switch (slot) {
        case DoorSlot.LEFT0:
          return Vector(-1, 3);
        case DoorSlot.UP0:
          return Vector(6, -1);
        case DoorSlot.RIGHT0:
          return Vector(13, 3);
        case DoorSlot.DOWN0:
          return Vector(6, 14);
        case DoorSlot.LEFT1:
          return Vector(-1, 10);
        case DoorSlot.UP1:
          return Vector(19, 6);
        case DoorSlot.RIGHT1:
          return Vector(26, 10);
        case DoorSlot.DOWN1:
          return Vector(19, 14);

        default:
          Isaac.DebugString(`Invalid DoorSlot [${slot}]!`);
          return Vector.Zero;
      }
    case RoomShape.ROOMSHAPE_LBL:
      switch (slot) {
        case DoorSlot.LEFT0:
          return Vector(-1, 3);
        case DoorSlot.UP0:
          return Vector(6, -1);
        case DoorSlot.RIGHT0:
          return Vector(26, 3);
        case DoorSlot.DOWN0:
          return Vector(6, 7);
        case DoorSlot.LEFT1:
          return Vector(12, 10);
        case DoorSlot.UP1:
          return Vector(19, -1);
        case DoorSlot.RIGHT1:
          return Vector(26, 10);
        case DoorSlot.DOWN1:
          return Vector(19, 14);

        default:
          Isaac.DebugString(`Invalid DoorSlot [${slot}]!`);
          return Vector.Zero;
      }
    case RoomShape.ROOMSHAPE_LBR:
      switch (slot) {
        case DoorSlot.LEFT0:
          return Vector(-1, 3);
        case DoorSlot.UP0:
          return Vector(6, -1);
        case DoorSlot.RIGHT0:
          return Vector(26, 3);
        case DoorSlot.DOWN0:
          return Vector(6, 14);
        case DoorSlot.LEFT1:
          return Vector(-1, 10);
        case DoorSlot.UP1:
          return Vector(19, -1);
        case DoorSlot.RIGHT1:
          return Vector(13, 10);
        case DoorSlot.DOWN1:
          return Vector(19, 7);

        default:
          Isaac.DebugString(`Invalid DoorSlot [${slot}]!`);
          return Vector.Zero;
      }
  }
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
