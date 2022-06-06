import { EntityGridCollisionClass } from "isaac-typescript-definitions";
import { game } from "isaacscript-common";
import { DroneVariant } from "../enums/DroneVariant";
import { Pathfinder } from "../pathfinding/pathfinder";

const pather = new Pathfinder(EntityGridCollisionClass.GROUND);

// ModCallbacks.MC_PRE_NPC_UPDATE (69)
export function testDronePreNPCUpdate(self: EntityNPC): boolean | void {
  if (self.Variant !== DroneVariant.TEST) {
    return undefined;
  }

  const data = self.GetData();
  let currentPath = data["path"] as Vector[] | undefined;
  if (currentPath === undefined) {
    const room = game.GetRoom();
    const randomPosition = Isaac.GetRandomPosition();
    const goal = room.FindFreePickupSpawnPosition(randomPosition);
    if (goal.DistanceSquared(self.Position) < 1) {
      return true;
    }

    const startTime = Isaac.GetTime();
    if (pather.pathfind(self.Position, goal)) {
      currentPath = pather.getPath();
      data["path"] = currentPath;
    } else {
      return true;
    }

    print(`${Isaac.GetTime() - startTime} ms`);
  }

  const nextPosition = currentPath[0];

  if (
    nextPosition == undefined ||
    self.Position.DistanceSquared(nextPosition) < 5
  ) {
    currentPath.shift();
    if (currentPath.length === 0) {
      data["path"] = undefined;
    }
    return true;
  }

  const desiredVelocity = nextPosition.sub(self.Position).Resized(2);
  self.AddVelocity(desiredVelocity.sub(self.Velocity));

  return true;
}
