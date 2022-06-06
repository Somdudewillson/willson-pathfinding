import { EntityGridCollisionClass } from "isaac-typescript-definitions";
import {
  game,
  gridPositionToWorldPosition,
  worldPositionToGridPosition,
} from "isaacscript-common";
import { FlatGridVector, shiftFlat } from "../utils/flatGridVector";
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

  // ModCallbacks.MC_POST_UPDATE (1)
  public static postUpdate(): void {
    Pathfinder.currentRoom.incrementalUpdateAreas();
  }

  // ModCallbacks.MC_POST_RENDER (2)
  public static postRender(): void {
    if (Pathfinder.currentRoom === undefined) {
      return;
    }

    Pathfinder.currentRoom.renderDebugDisplayGrid();
  }

  // ModCallbacks.MC_POST_NEW_ROOM (19)
  public static postNewRoom(): void {
    const room = game.GetRoom();
    Pathfinder.currentRoom = new RoomData(room);
  }

  public pathfind(startVec: Vector, goalVec: Vector): boolean {
    const startGridPosition = worldPositionToGridPosition(startVec);
    const goalGridPosition = worldPositionToGridPosition(goalVec);
    return this.gridPathfind(startGridPosition, goalGridPosition);
  }

  public gridPathfind(
    startGridPosition: Vector,
    goalGridPosition: Vector,
  ): boolean {
    if (
      !Pathfinder.currentRoom.isPathPossible(
        startGridPosition,
        goalGridPosition,
        this.collisionClass,
      )
    ) {
      return false;
    }

    const foundPath = findAStarPath(
      startGridPosition,
      goalGridPosition,
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
      const worldPosition = gridPositionToWorldPosition(entry);
      convertedPath.unshift(worldPosition);
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
        Pathfinder.currentRoom.isPositionPassable(
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
