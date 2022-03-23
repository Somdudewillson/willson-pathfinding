export class GridEntityData {
  readonly type: int;
  readonly variant: int;
  readonly state: int;

  public constructor(source: GridEntity | undefined) {
    if (source === undefined) {
      this.type = -1;
      this.variant = -1;
      this.state = -1;
    } else {
      this.type = source.GetType();
      this.variant = source.GetVariant();
      this.state = source.State;
    }
  }

  public isUndefined(): boolean {
    return this.type === -1 && this.variant === -1 && this.state === -1;
  }

  public toString(): string {
    return `${this.type}.${this.variant}:${this.state}`;
  }

  public static areIdentical(a: GridEntityData, b: GridEntityData): boolean {
    return a.type === b.type && a.variant === b.variant && a.state === b.state;
  }

  public sameAs(other: GridEntityData): boolean {
    return GridEntityData.areIdentical(this, other);
  }
}
