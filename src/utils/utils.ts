import { expandVector, FlatGridVector } from "./flatGridVector";

export function hasFlag(flags: int, testFlag: int): boolean {
  return (flags & testFlag) === testFlag;
}

export function rotateDirection(
  dir: Direction,
  rotateDir: Direction,
): Direction {
  if (dir === Direction.NO_DIRECTION) {
    return Direction.NO_DIRECTION;
  }

  let shift = 0;
  switch (rotateDir) {
    default:
    case Direction.NO_DIRECTION:
    case Direction.UP:
      return dir;
    case Direction.LEFT:
      shift = -1;
      break;
    case Direction.RIGHT:
      shift = 1;
      break;
    case Direction.DOWN:
      shift = -2;
      break;
  }

  let newDir = dir + shift;
  if (newDir < 0) {
    newDir += 4;
  } else if (newDir > 3) {
    newDir -= 4;
  }

  return newDir;
}

export function checkLine(
  room: Room,
  position1: Vector,
  position2: Vector,
  lineCheckMode: LineCheckMode,
  gridPathThreshold?: number | undefined,
  ignoreWalls?: boolean | undefined,
  ignoreCrushable?: boolean | undefined,
): { clear: boolean; collidePos: Vector } {
  const [isClear, endPos] = room.CheckLine(
    position1,
    position2,
    lineCheckMode,
    gridPathThreshold,
    ignoreWalls,
    ignoreCrushable,
  );

  return { clear: isClear, collidePos: endPos };
}

export const enum SymmetryType {
  NONE,
  /** Mirrored over a horizontal line */
  HORIZONTAL,
  /** Mirrored over a vertical line */
  VERTICAL,
  /** Both vertical and horizontal symmetry */
  QUAD,
  /** Diagonal top-left to bottom-right */
  DIAGONAl_LR,
  /** Diagonal top-right to bottom-left */
  DIAGONAl_RL,
}

export function getMirroredPos(
  shape: RoomShape,
  symmetry: SymmetryType,
  pos: Vector,
  includeInitial = false,
): Vector[] {
  const mirrorPos = [Vector(pos.X, pos.Y)];
  let start = 0;
  if (includeInitial) {
    start = 1;
  }

  switch (symmetry) {
    default:
    case SymmetryType.NONE:
      return mirrorPos;
    case SymmetryType.HORIZONTAL:
      switch (shape) {
        default:
        case RoomShape.ROOMSHAPE_1x1:
        case RoomShape.ROOMSHAPE_IH:
        case RoomShape.ROOMSHAPE_IV:
        case RoomShape.ROOMSHAPE_2x1:
        case RoomShape.ROOMSHAPE_IIH:
          mirrorPos[start] = mirrorHorizontal(pos, 3);
          break;
        case RoomShape.ROOMSHAPE_1x2:
        case RoomShape.ROOMSHAPE_IIV:
        case RoomShape.ROOMSHAPE_2x2:
        case RoomShape.ROOMSHAPE_LTL:
        case RoomShape.ROOMSHAPE_LTR:
        case RoomShape.ROOMSHAPE_LBL:
        case RoomShape.ROOMSHAPE_LBR:
          mirrorPos[start] = mirrorHorizontal(pos, 6.5);
          break;
      }
      break;
    case SymmetryType.VERTICAL:
      switch (shape) {
        default:
        case RoomShape.ROOMSHAPE_1x1:
        case RoomShape.ROOMSHAPE_IH:
        case RoomShape.ROOMSHAPE_IV:
        case RoomShape.ROOMSHAPE_1x2:
        case RoomShape.ROOMSHAPE_IIV:
          mirrorPos[start] = mirrorVertical(pos, 6);
          break;
        case RoomShape.ROOMSHAPE_2x1:
        case RoomShape.ROOMSHAPE_IIH:
        case RoomShape.ROOMSHAPE_2x2:
        case RoomShape.ROOMSHAPE_LTL:
        case RoomShape.ROOMSHAPE_LTR:
        case RoomShape.ROOMSHAPE_LBL:
        case RoomShape.ROOMSHAPE_LBR:
          mirrorPos[start] = mirrorVertical(pos, 12.5);
          break;
      }
      break;
    case SymmetryType.QUAD:
      switch (shape) {
        default:
        case RoomShape.ROOMSHAPE_1x1:
        case RoomShape.ROOMSHAPE_IH:
        case RoomShape.ROOMSHAPE_IV:
          mirrorPos[start] = mirrorHorizontal(pos, 3);
          mirrorPos[start + 1] = mirrorVertical(mirrorPos[start], 6);
          mirrorPos[start + 2] = mirrorVertical(pos, 6);
          break;
        case RoomShape.ROOMSHAPE_2x1:
        case RoomShape.ROOMSHAPE_IIH:
          mirrorPos[start] = mirrorHorizontal(pos, 3);
          mirrorPos[start + 1] = mirrorVertical(mirrorPos[start], 12.5);
          mirrorPos[start + 2] = mirrorVertical(pos, 12.5);
          break;
        case RoomShape.ROOMSHAPE_1x2:
        case RoomShape.ROOMSHAPE_IIV:
          mirrorPos[start] = mirrorHorizontal(pos, 6.5);
          mirrorPos[start + 1] = mirrorVertical(mirrorPos[start], 6);
          mirrorPos[start + 2] = mirrorVertical(pos, 6);
          break;
        case RoomShape.ROOMSHAPE_2x2:
        case RoomShape.ROOMSHAPE_LTL:
        case RoomShape.ROOMSHAPE_LTR:
        case RoomShape.ROOMSHAPE_LBL:
        case RoomShape.ROOMSHAPE_LBR:
          mirrorPos[start] = mirrorHorizontal(pos, 6.5);
          mirrorPos[start + 1] = mirrorVertical(mirrorPos[start], 12.5);
          mirrorPos[start + 2] = mirrorVertical(pos, 12.5);
          break;
      }
      break;
  }

  return mirrorPos;
}
/** Mirror a `Vector` over a horizontal line */
export function mirrorHorizontal(origin: Vector, lineY: float): Vector {
  return Vector(origin.X, -(origin.Y - lineY) + lineY);
}
/** Mirror a `Vector` over a vertical line */
export function mirrorVertical(origin: Vector, lineX: float): Vector {
  return Vector(-(origin.X - lineX) + lineX, origin.Y);
}
/** Mirror a `Vector` over both a horizontal and a vertical line */
export function mirrorQuad(origin: Vector, lineX: float, lineY: float): Vector {
  return Vector(-(origin.X - lineX) + lineX, -(origin.Y - lineY) + lineY);
}

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
/** Get a `RoomShape`'s layout size. This is **NOT** the size of the `RoomShape`'s actual contents! */
export function getRoomShapeSize(shape: RoomShape): Vector {
  switch (shape) {
    default:
    case RoomShape.ROOMSHAPE_1x1:
    case RoomShape.ROOMSHAPE_IH:
    case RoomShape.ROOMSHAPE_IV:
      return Vector(13, 7);
    case RoomShape.ROOMSHAPE_1x2:
    case RoomShape.ROOMSHAPE_IIV:
      return Vector(13, 14);
    case RoomShape.ROOMSHAPE_2x1:
    case RoomShape.ROOMSHAPE_IIH:
      return Vector(26, 7);
    case RoomShape.ROOMSHAPE_2x2:
    case RoomShape.ROOMSHAPE_LTL:
    case RoomShape.ROOMSHAPE_LTR:
    case RoomShape.ROOMSHAPE_LBL:
    case RoomShape.ROOMSHAPE_LBR:
      return Vector(26, 14);
  }
}
/** Get the size of a `RoomShape`'s internal space.  Note that this is a bounding box. */
export function getRoomShapeBounds(shape: RoomShape): Vector {
  switch (shape) {
    default:
    case RoomShape.ROOMSHAPE_1x1:
      return Vector(13, 7);
    case RoomShape.ROOMSHAPE_IH:
      return Vector(13, 3);
    case RoomShape.ROOMSHAPE_IV:
      return Vector(5, 7);
    case RoomShape.ROOMSHAPE_1x2:
      return Vector(13, 14);
    case RoomShape.ROOMSHAPE_IIV:
      return Vector(5, 14);
    case RoomShape.ROOMSHAPE_2x1:
      return Vector(26, 7);
    case RoomShape.ROOMSHAPE_IIH:
      return Vector(26, 3);
    case RoomShape.ROOMSHAPE_2x2:
    case RoomShape.ROOMSHAPE_LTL:
    case RoomShape.ROOMSHAPE_LTR:
    case RoomShape.ROOMSHAPE_LBL:
    case RoomShape.ROOMSHAPE_LBR:
      return Vector(26, 14);
  }
}
/** Get the volume of a `RoomShape`'s internal space. */
export function getRoomShapeVolume(shape: RoomShape): int {
  switch (shape) {
    default:
    case RoomShape.ROOMSHAPE_1x1:
      return 13 * 7;
    case RoomShape.ROOMSHAPE_IH:
      return 13 * 3;
    case RoomShape.ROOMSHAPE_IV:
      return 5 * 7;
    case RoomShape.ROOMSHAPE_1x2:
      return 13 * 14;
    case RoomShape.ROOMSHAPE_IIV:
      return 5 * 14;
    case RoomShape.ROOMSHAPE_2x1:
      return 26 * 7;
    case RoomShape.ROOMSHAPE_IIH:
      return 26 * 3;
    case RoomShape.ROOMSHAPE_2x2:
      return 26 * 14;
    case RoomShape.ROOMSHAPE_LTL:
    case RoomShape.ROOMSHAPE_LTR:
    case RoomShape.ROOMSHAPE_LBL:
    case RoomShape.ROOMSHAPE_LBR:
      return 26 * 7 + 13 * 7;
  }
}
/** Get the top left pos of a given `RoomShape`. */
export function getTopLeftPos(shape: RoomShape): Vector {
  switch (shape) {
    default:
    case RoomShape.ROOMSHAPE_1x1:
    case RoomShape.ROOMSHAPE_1x2:
    case RoomShape.ROOMSHAPE_2x1:
    case RoomShape.ROOMSHAPE_2x2:
    case RoomShape.ROOMSHAPE_LTR:
    case RoomShape.ROOMSHAPE_LBL:
    case RoomShape.ROOMSHAPE_LBR:
      return Vector(0, 0);
    case RoomShape.ROOMSHAPE_IH:
    case RoomShape.ROOMSHAPE_IIH:
      return Vector(0, 2);
    case RoomShape.ROOMSHAPE_IIV:
    case RoomShape.ROOMSHAPE_IV:
      return Vector(4, 0);
    case RoomShape.ROOMSHAPE_LTL:
      return Vector(13, 0);
  }
}
/** Get the bottom right pos of a given `RoomShape`. */
export function getBottomRightPos(shape: RoomShape): Vector {
  switch (shape) {
    default:
    case RoomShape.ROOMSHAPE_1x1:
      return Vector(12, 6);
    case RoomShape.ROOMSHAPE_1x2:
      return Vector(12, 13);
    case RoomShape.ROOMSHAPE_2x1:
      return Vector(25, 6);
    case RoomShape.ROOMSHAPE_2x2:
    case RoomShape.ROOMSHAPE_LTL:
    case RoomShape.ROOMSHAPE_LTR:
    case RoomShape.ROOMSHAPE_LBL:
      return Vector(25, 13);
    case RoomShape.ROOMSHAPE_LBR:
      return Vector(12, 13);
    case RoomShape.ROOMSHAPE_IH:
      return Vector(12, 4);
    case RoomShape.ROOMSHAPE_IIH:
      return Vector(25, 4);
    case RoomShape.ROOMSHAPE_IIV:
      return Vector(8, 13);
    case RoomShape.ROOMSHAPE_IV:
      return Vector(8, 6);
  }
}
