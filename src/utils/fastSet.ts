/**
 * A Set implementation, backed directly with a lua table for increased performance.
 */
export class FastSet<T> {
  private readonly dataTable: LuaTable<T, boolean>;

  public constructor() {
    this.dataTable = new LuaTable<T, boolean>();
  }

  public add(newEntry: T): void {
    this.dataTable.set(newEntry, true);
  }

  public has(key: T): boolean {
    return this.dataTable.get(key);
  }

  public delete(key: T): void {
    this.dataTable.delete(key);
  }
}
