import { Pathfinder } from "./pathfinding/pathfinder";
import {
  testDroneUpdate,
  TEST_DRONE_ENTITY_TYPE,
} from "./testEntity/testDrone";
import {
  worstCaseDroneInit,
  worstCaseDroneUpdate,
} from "./testEntity/worstCaseDrone";

const MOD_NAME = "willson-pathfinding";

export function main(): void {
  const mod = RegisterMod(MOD_NAME, 1);

  mod.AddCallback(ModCallbacks.MC_POST_NEW_ROOM, Pathfinder.rebuildRoom);
  mod.AddCallback(ModCallbacks.MC_POST_UPDATE, Pathfinder.updateRoom);
  mod.AddCallback(ModCallbacks.MC_POST_RENDER, Pathfinder.debugDisplayGrid);

  mod.AddCallback(
    ModCallbacks.MC_PRE_NPC_UPDATE,
    testDroneUpdate,
    TEST_DRONE_ENTITY_TYPE,
  );
  mod.AddCallback(
    ModCallbacks.MC_POST_NPC_INIT,
    worstCaseDroneInit,
    TEST_DRONE_ENTITY_TYPE,
  );
  mod.AddCallback(
    ModCallbacks.MC_PRE_NPC_UPDATE,
    worstCaseDroneUpdate,
    TEST_DRONE_ENTITY_TYPE,
  );

  Isaac.DebugString(`${MOD_NAME} initialized.`);
}
