import { game } from "isaacscript-common";

// ModCallbacks.MC_EXECUTE_CMD(22);
export function testExecuteCmd(cmd: string, _params: string): void {
  if (cmd === "test") {
    test();
  }
}

function test() {
  // Insert benchmarking code here
}

/**
 * Helper function to convert a grid index to a grid position.
 *
 * For example, grid index 16 is equal to "Vector(0, 0)".
 */
export function gridIndexToGridPosition(gridIndex: int): Vector {
  const room = game.GetRoom();
  const gridWidth = room.GetGridWidth();

  const x = (gridIndex % gridWidth) - 1;
  const y = Math.floor(gridIndex / gridWidth) - 1;
  return Vector(x, y);
}
