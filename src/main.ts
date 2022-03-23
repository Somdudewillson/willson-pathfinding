import { Pathfinder } from "./pathfinding/pathfinder";
import { testDroneUpdate, TESTDRONE_ENTITYTYPE } from "./testEntity/testDrone";
import {
  worstCaseDroneInit,
  worstCaseDroneUpdate,
} from "./testEntity/worstCaseDrone";

const MOD_NAME = "willson-pathfinding";

export function main(): void {
  // Instantiate a new mod object, which grants the ability to add callback functions that
  // correspond to in-game events
  const mod = RegisterMod(MOD_NAME, 1);

  // Set a callback function that corresponds to when a new run is started
  mod.AddCallback(ModCallbacks.MC_POST_NEW_ROOM, Pathfinder.rebuildRoom);
  mod.AddCallback(ModCallbacks.MC_POST_UPDATE, Pathfinder.updateRoom);
  mod.AddCallback(ModCallbacks.MC_POST_RENDER, Pathfinder.debugDisplayGrid);

  mod.AddCallback(
    ModCallbacks.MC_PRE_NPC_UPDATE,
    testDroneUpdate,
    TESTDRONE_ENTITYTYPE,
  );
  mod.AddCallback(
    ModCallbacks.MC_POST_NPC_INIT,
    worstCaseDroneInit,
    TESTDRONE_ENTITYTYPE,
  );
  mod.AddCallback(
    ModCallbacks.MC_PRE_NPC_UPDATE,
    worstCaseDroneUpdate,
    TESTDRONE_ENTITYTYPE,
  );

  // Print an initialization message to the "log.txt" file
  Isaac.DebugString(`${MOD_NAME} initialized.`);
}
