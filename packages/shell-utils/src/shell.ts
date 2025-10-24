import type { SpawnOptions } from "node:child_process";
import { spawn } from "node:child_process";

export type ShellReturn = {
  stdout: string;
  stderr: string;
  stdall: string;
};
type ShellErrorData = {
  code: number;
  stdout: string;
  stderr: string;
  stdall: string;
};
export class ShellError extends Error {
  name: string = "ShellError";
  code: number;
  stdall: string;
  stdout: string;
  stderr: string;
  constructor(message: string, data: ShellErrorData) {
    super(message);
    this.message = message;
    this.code = data.code;
    this.stdout = data.stdout;
    this.stdall = data.stdall;
    this.stderr = data.stderr;
  }
}
export async function shell(
  cmd: string,
  options?: SpawnOptions,
): Promise<ShellReturn> {
  const child = spawn(cmd, {
    shell: "/bin/zsh",
    ...options,
  });
  let stdall = "";
  let stdout = "";
  child.stdout?.on("data", (data) => {
    stdout += data;
    stdall += data;
  });
  let stderr = "";
  child.stderr?.on("data", (data) => {
    stderr += data;
    stdall += data;
  });

  const exitCode: number = await new Promise((resolve) => {
    child.on("close", resolve);
  });

  if (exitCode) {
    console.error(stderr.slice(-1000));
    throw new ShellError(`[code: ${exitCode}] "${cmd}"`, {
      code: exitCode,
      stdout,
      stdall,
      stderr,
    });
  }
  return { stdall, stdout, stderr };
}
