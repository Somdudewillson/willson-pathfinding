import { Pathfinder } from "./pathfinding/pathfinder";
import { testDroneUpdate, TESTDRONE_ENTITYTYPE } from "./testEntity/testDrone";

const MOD_NAME = "willson-pathfinding";

export function main(): void {
  // Instantiate a new mod object, which grants the ability to add callback functions that
  // correspond to in-game events
  const mod = RegisterMod(MOD_NAME, 1);

  // Set a callback function that corresponds to when a new run is started
  mod.AddCallback(ModCallbacks.MC_POST_NEW_ROOM, Pathfinder.updateRoom);
  mod.AddCallback(
    ModCallbacks.MC_PRE_NPC_UPDATE,
    testDroneUpdate,
    TESTDRONE_ENTITYTYPE,
  );

  // Print an initialization message to the "log.txt" file
  Isaac.DebugString(`${MOD_NAME} initialized.`);
}
