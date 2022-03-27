import { log } from "isaacscript-common";
import { EntityTypeCustom } from "./enums/EntityTypeCustom";
import { Pathfinder } from "./pathfinding/pathfinder";
import { testDronePreNPCUpdate } from "./testEntity/testDrone";
import {
  worstCaseDronePostNPCInit,
  worstCaseDronePreNPCUpdate,
} from "./testEntity/worstCaseDrone";

const MOD_NAME = "willson-pathfinding";

main();

function main() {
  const mod = RegisterMod(MOD_NAME, 1);
  registerCallbacks(mod);
  log(`${MOD_NAME} initialized.`);
}

function registerCallbacks(mod: Mod) {
  mod.AddCallback(ModCallbacks.MC_POST_UPDATE, Pathfinder.postUpdate); // 1
  mod.AddCallback(ModCallbacks.MC_POST_RENDER, Pathfinder.postRender); // 2
  mod.AddCallback(ModCallbacks.MC_POST_NEW_ROOM, Pathfinder.postNewRoom); // 19

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
}
