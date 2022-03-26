export enum SymmetryType {
  NONE,

  /** Mirrored over a horizontal line. */
  HORIZONTAL,

  /** Mirrored over a vertical line. */
  VERTICAL,

  /** Both vertical and horizontal symmetry. */
  QUAD,

  /** Diagonal top-left to bottom-right. */
  DIAGONAL_TL_TO_BR,

  /** Diagonal top-right to bottom-left. */
  DIAGONAL_TR_TO_BL,
}
