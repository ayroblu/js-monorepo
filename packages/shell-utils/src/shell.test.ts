import { expect, test } from "vitest";
import { shell } from "./shell.ts";

test("How ShellError looks like", async () => {
  await expect(shell("ls nonexistent")).rejects.toThrowError(
    '[code: 1] "ls nonexistent"',
  );
});
