/** Test if a grid position is actually in the given `RoomShape` */
export function isValidGridPosition(
  position: Vector,
  shape: RoomShape,
): boolean {
  if (position.X < 0 || position.Y < 0) {
    return false;
  }

  switch (shape) {
    default:
    case RoomShape.ROOMSHAPE_1x1:
      if (position.X >= 13 || position.Y >= 7) {
        return false;
      }
      break;
    case RoomShape.ROOMSHAPE_IH:
      if (position.X >= 13 || position.Y <= 2 || position.Y >= 4) {
        return false;
      }
      break;
    case RoomShape.ROOMSHAPE_IV:
      if (position.X <= 3 || position.X >= 9 || position.Y >= 7) {
        return false;
      }
      break;
    case RoomShape.ROOMSHAPE_1x2:
      if (position.X >= 13 || position.Y >= 14) {
        return false;
      }
      break;
    case RoomShape.ROOMSHAPE_IIV:
      if (position.X <= 3 || position.X >= 9 || position.Y >= 14) {
        return false;
      }
      break;
    case RoomShape.ROOMSHAPE_2x1:
      if (position.X >= 26 || position.Y >= 7) {
        return false;
      }
      break;
    case RoomShape.ROOMSHAPE_IIH:
      if (position.X >= 26 || position.Y <= 2 || position.Y >= 4) {
        return false;
      }
      break;
    case RoomShape.ROOMSHAPE_2x2:
      if (position.X >= 26 || position.Y >= 14) {
        return false;
      }
      break;
    case RoomShape.ROOMSHAPE_LTL:
      if (position.X >= 26 || position.Y >= 14) {
        return false;
      }
      if (position.X <= 12 && position.Y <= 6) {
        return false;
      }
      break;
    case RoomShape.ROOMSHAPE_LTR:
      if (position.X >= 26 || position.Y >= 14) {
        return false;
      }
      if (position.X >= 13 && position.Y <= 6) {
        return false;
      }
      break;
    case RoomShape.ROOMSHAPE_LBL:
      if (position.X >= 26 || position.Y >= 14) {
        return false;
      }
      if (position.X <= 12 && position.Y >= 7) {
        return false;
      }
      break;
    case RoomShape.ROOMSHAPE_LBR:
      if (position.X >= 26 || position.Y >= 14) {
        return false;
      }
      if (position.X >= 13 && position.Y >= 7) {
        return false;
      }
      break;
  }

  return true;
}
