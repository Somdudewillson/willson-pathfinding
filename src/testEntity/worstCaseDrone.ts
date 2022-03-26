/* eslint-disable consistent-return */
import { DroneVariant } from "../enums/DroneVariant";
import { Pathfinder } from "../pathfinding/pathfinder";

const pather = new Pathfinder(EntityGridCollisionClass.GRIDCOLL_GROUND);

export function worstCaseDroneInit(self: EntityNPC): boolean | void {
  if (self.Variant !== DroneVariant.WORST_CASE) {
    return;
  }

  const room = Game().GetRoom();
  room.SpawnGridEntity(17, GridEntityType.GRID_ROCK, 0, room.GetSpawnSeed(), 0);
  room.SpawnGridEntity(31, GridEntityType.GRID_ROCK, 0, room.GetSpawnSeed(), 0);

  self.Position = room.GetGridPosition(118);
}

export function worstCaseDroneUpdate(self: EntityNPC): boolean | void {
  if (self.Variant !== DroneVariant.WORST_CASE) {
    return;
  }

  const goal = Game().GetRoom().GetGridPosition(16);

  const startTime = Isaac.GetTime();
  pather.pathfind(self.Position, goal);
  print(`${Isaac.GetTime() - startTime} ms`);

  return true;
}
