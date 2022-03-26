/* eslint-disable consistent-return */
import { DroneVariant } from "../enums/DroneVariant";
import { Pathfinder } from "../pathfinding/pathfinder";

const pather = new Pathfinder(EntityGridCollisionClass.GRIDCOLL_GROUND);

export function testDroneUpdate(self: EntityNPC): boolean | void {
  if (self.Variant !== DroneVariant.TEST) {
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

    const startTime = Isaac.GetTime();
    if (pather.pathfind(self.Position, goal)) {
      currentPath = pather.getPath();
      data.path = currentPath;
    } else {
      return true;
    }
    print(`${Isaac.GetTime() - startTime} ms`);
  }

  const nextPos = currentPath[0];

  if (self.Position.DistanceSquared(nextPos) < 5) {
    currentPath.shift();
    if (currentPath.length === 0) {
      data.path = undefined;
    }
    return true;
  }

  const desiredVelocity = nextPos.sub(self.Position).Resized(2);
  self.AddVelocity(desiredVelocity.sub(self.Velocity));

  return true;
}
