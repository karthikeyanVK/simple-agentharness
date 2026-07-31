import { readFile } from "node:fs/promises";
import { resolve, isAbsolute } from "node:path";
import type { ToolDefinition } from "../toolRegistry.js";

export const readFileTool: ToolDefinition = {
  name: "readFile",
  description: "Read text content from a file path.",
  run: async (args, context) => {
    const target = String(args.filename ?? args.path ?? "");
    if (!target) {
      throw new Error('readFile requires argument: "filename".');
    }
    const absolutePath = isAbsolute(target) ? target : resolve(context.cwd, target);
    const content = await readFile(absolutePath, "utf-8");
    return { ok: true, filename: absolutePath, content };
  }
};
