import { isValidGridPosition } from "./utils";

const MIN_VALUE = -2;
const MAX_VALUE = 29;
const SHIFT = MAX_VALUE - MIN_VALUE + 1;

export type FlatGridVector = number;

export function expandVector(inVec: FlatGridVector): Vector {
  const Y = math.floor(inVec / SHIFT);
  const X = math.floor(inVec - Y * SHIFT);

  return Vector(X + MIN_VALUE, Y + MIN_VALUE);
}

export function flattenVector(inVec: Vector): FlatGridVector {
  return (
    Math.round(inVec.X - MIN_VALUE) + Math.round(inVec.Y - MIN_VALUE) * SHIFT
  );
}

/** Test if a flattened grid position is actually in the given `RoomShape`. */
export function isValidFlatGridPosition(
  position: FlatGridVector,
  shape: RoomShape,
): boolean {
  const gridPosition = expandVector(position);
  return isValidGridPosition(gridPosition, shape);
}

export function shiftFlat(
  inVec: FlatGridVector,
  deltaX: int,
  deltaY: int,
): FlatGridVector {
  return inVec + Math.round(deltaX) + Math.round(deltaY * SHIFT);
}
