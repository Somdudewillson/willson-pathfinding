import { EntityTypeCustom } from "./enums/EntityTypeCustom";
import { Pathfinder } from "./pathfinding/pathfinder";
import { testDronePreNPCUpdate } from "./testEntity/testDrone";
import {
  worstCaseDronePostNPCInit,
  worstCaseDronePreNPCUpdate,
} from "./testEntity/worstCaseDrone";

const MOD_NAME = "willson-pathfinding";

export function main(): void {
  const mod = RegisterMod(MOD_NAME, 1);

  mod.AddCallback(ModCallbacks.MC_POST_UPDATE, Pathfinder.updateRoom); // 1
  mod.AddCallback(ModCallbacks.MC_POST_RENDER, Pathfinder.debugDisplayGrid); // 2
  mod.AddCallback(ModCallbacks.MC_POST_NEW_ROOM, Pathfinder.rebuildRoom); // 19

  mod.AddCallback(
    ModCallbacks.MC_POST_NPC_INIT,
    worstCaseDronePostNPCInit,
    EntityTypeCustom.DRONE,
  ); // 27
  mod.AddCallback(
    ModCallbacks.MC_PRE_NPC_UPDATE,
    testDronePreNPCUpdate,
    EntityTypeCustom.DRONE,
  ); // 69
  mod.AddCallback(
    ModCallbacks.MC_PRE_NPC_UPDATE,
    worstCaseDronePreNPCUpdate,
    EntityTypeCustom.DRONE,
  ); // 69

  Isaac.DebugString(`${MOD_NAME} initialized.`);
}
