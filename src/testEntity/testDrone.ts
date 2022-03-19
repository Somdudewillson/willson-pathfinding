/* eslint-disable consistent-return */
import { Pathfinder } from "../pathfinding/pathfinder";

export const TESTDRONE_ENTITYTYPE = 18;
export const TESTDRONE_ENTITYVARIANT = 245;

const pather = new Pathfinder(EntityGridCollisionClass.GRIDCOLL_GROUND);

export function testDroneUpdate(self: EntityNPC): boolean | void {
  if (self.Variant !== TESTDRONE_ENTITYVARIANT) {
    self.Kill();
    return;
  }

  const data = self.GetData();
  let currentPath = data.path as Vector[] | undefined;
  if (currentPath === undefined) {
    const goal = Game()
      .GetRoom()
      .FindFreePickupSpawnPosition(Isaac.GetRandomPosition());
    if (goal.DistanceSquared(self.Position) < 1) {
      return true;
    }

    if (pather.pathfind(self.Position, goal)) {
      currentPath = pather.getPath();
      data.path = currentPath;
    } else {
      return true;
    }
  }

  const nextPos = currentPath[0];

  if (self.Position.DistanceSquared(nextPos) < 5) {
    currentPath.shift();
    if (currentPath.length === 0) {
      data.path = undefined;
    }
    return true;
  }

  self.Velocity = nextPos.sub(self.Position).Resized(2);

  return true;
}
