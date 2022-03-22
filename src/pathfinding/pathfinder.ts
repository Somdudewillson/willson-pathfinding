import { FlatGridVector, shiftFlat } from "../utils/flatGridVector";
import { gridToWorldPos, worldToGridPos } from "../utils/utils";
import { findAStarPath, manhattanDist } from "./aStar";
import { RoomData } from "./roomData";

export class Pathfinder {
  private static idState = 0;
  private static currentRoom: RoomData;

  private readonly id: number;

  private collisionClass: EntityGridCollisionClass;
  private currentPath: Vector[] = [];

  public constructor(collisionClass: EntityGridCollisionClass) {
    this.id = Pathfinder.idState++;

    this.collisionClass = collisionClass;
  }

  public static updateRoom(): void {
    Pathfinder.currentRoom = new RoomData(Game().GetRoom());
  }

  public pathfind(startVec: Vector, goalVec: Vector): boolean {
    return this.gridPathfind(worldToGridPos(startVec), worldToGridPos(goalVec));
  }

  public gridPathfind(startVec: Vector, goalVec: Vector): boolean {
    const foundPath = findAStarPath(
      startVec,
      goalVec,
      manhattanDist,
      this.getNeighbors.bind(this),
    );

    if (foundPath !== false) {
      this.currentPath = foundPath;
      return true;
    }
    return false;
  }

  public hasPath(): boolean {
    return this.currentPath.length > 0;
  }

  /**
   * @returns the next position along the path.
   */
  public peekPath(): Vector | undefined {
    return this.hasPath() ? this.currentPath[0] : undefined;
  }

  /**
   * @returns and removes the next position along the path.
   */
  public pollPath(): Vector | undefined {
    return this.hasPath() ? this.currentPath[0] : undefined;
  }

  public getRawPath(): Vector[] {
    return this.currentPath;
  }

  public getPath(): Vector[] {
    const convertedPath: Vector[] = [];

    for (const entry of this.currentPath) {
      convertedPath.unshift(gridToWorldPos(entry));
    }

    return convertedPath;
  }

  getNeighbors(
    current: FlatGridVector,
    goal: FlatGridVector,
    _path: Vector[],
  ): FlatGridVector[] {
    const possibleNeighbors = [
      shiftFlat(current, 1, 0),
      shiftFlat(current, 0, 1),
      shiftFlat(current, -1, 0),
      shiftFlat(current, 0, -1),
    ];

    const neighbors: FlatGridVector[] = [];
    for (const possibleNeighbor of possibleNeighbors) {
      if (
        possibleNeighbor === goal ||
        Pathfinder.currentRoom.isPosPassable(
          possibleNeighbor,
          this.collisionClass,
        )
      ) {
        neighbors.push(possibleNeighbor);
      }
    }

    return neighbors;
  }
}