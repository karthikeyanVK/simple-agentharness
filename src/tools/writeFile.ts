import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve, isAbsolute } from "node:path";
import type { ToolDefinition } from "../toolRegistry.js";

export const writeFileTool: ToolDefinition = {
  name: "writeFile",
  description: "Write text content into a file path.",
  run: async (args, context) => {
    const target = String(args.filename ?? args.path ?? "");
    const content = String(args.content ?? "");
    if (!target) {
      throw new Error('writeFile requires argument: "filename".');
    }
    const absolutePath = isAbsolute(target) ? target : resolve(context.cwd, target);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, content, "utf-8");
    return { ok: true, filename: absolutePath, bytesWritten: Buffer.byteLength(content) };
  }
};
