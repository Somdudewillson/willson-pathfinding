import { GridEntityType } from "isaac-typescript-definitions";

export class GridEntityData {
  readonly type: GridEntityType;
  readonly variant: int;
  readonly state: int;

  public constructor(source: GridEntity | undefined) {
    if (source === undefined) {
      this.type = GridEntityType.NULL;
      this.variant = -1;
      this.state = -1;
    } else {
      this.type = source.GetType();
      this.variant = source.GetVariant();
      this.state = source.State;
    }
  }

  public isUndefined(): boolean {
    return (
      this.type === GridEntityType.NULL &&
      this.variant === -1 &&
      this.state === -1
    );
  }

  public toString(): string {
    return `${this.type}.${this.variant}:${this.state}`;
  }

  public equals(other: GridEntityData): boolean {
    return (
      this.type === other.type &&
      this.variant === other.variant &&
      this.state === other.state
    );
  }
}
