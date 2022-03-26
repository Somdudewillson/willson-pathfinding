import { EntityTypeCustom } from "./enums/EntityTypeCustom";
import { Pathfinder } from "./pathfinding/pathfinder";
import { testDroneUpdate } from "./testEntity/testDrone";
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
    EntityTypeCustom.DRONE,
  );
  mod.AddCallback(
    ModCallbacks.MC_POST_NPC_INIT,
    worstCaseDroneInit,
    EntityTypeCustom.DRONE,
  );
  mod.AddCallback(
    ModCallbacks.MC_PRE_NPC_UPDATE,
    worstCaseDroneUpdate,
    EntityTypeCustom.DRONE,
  );

  Isaac.DebugString(`${MOD_NAME} initialized.`);
}
