import { ModCallback } from "isaac-typescript-definitions";
import { log } from "isaacscript-common";
import { DRONE_TYPE } from "./enums/EntityTypeCustom";
import { Pathfinder } from "./pathfinding/pathfinder";
import { testExecuteCmd } from "./test";
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
  mod.AddCallback(ModCallback.POST_UPDATE, Pathfinder.postUpdate); // 1
  mod.AddCallback(ModCallback.POST_RENDER, Pathfinder.postRender); // 2
  mod.AddCallback(ModCallback.POST_NEW_ROOM, Pathfinder.postNewRoom); // 19
  mod.AddCallback(ModCallback.EXECUTE_CMD, testExecuteCmd); // 19

  mod.AddCallback(
    ModCallback.POST_NPC_INIT,
    worstCaseDronePostNPCInit,
    DRONE_TYPE,
  ); // 27
  mod.AddCallback(
    ModCallback.PRE_NPC_UPDATE,
    testDronePreNPCUpdate,
    DRONE_TYPE,
  ); // 69
  mod.AddCallback(
    ModCallback.PRE_NPC_UPDATE,
    worstCaseDronePreNPCUpdate,
    DRONE_TYPE,
  ); // 69
}
