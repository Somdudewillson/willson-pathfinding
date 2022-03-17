/**
 * A Map implementation, backed directly with a lua table for increased performance.
 * Does not support `undefined` values.
 */
export class FastMap<T, T2> {
  private readonly dataTable: LuaTable<T, T2>;

  public constructor() {
    this.dataTable = new LuaTable<T, T2>();
  }

  public set(key: T, value: T2): void {
    this.dataTable.set(key, value);
  }

  public get(key: T): T2 {
    return this.dataTable.get(key);
  }

  public has(key: T): boolean {
    return this.dataTable.get(key) !== undefined;
  }

  public delete(key: T): void {
    this.dataTable.delete(key);
  }
}
