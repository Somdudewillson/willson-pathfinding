// ModCallbacks.MC_EXECUTE_CMD(22);
export function testExecuteCmd(cmd: string, _params: string): void {
  if (cmd === "test") {
    test();
  }
}

function test() {
  // Insert benchmarking code here.
}
