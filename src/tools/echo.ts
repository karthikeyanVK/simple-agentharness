import type { ToolDefinition } from "../toolRegistry.js";

export const echoTool: ToolDefinition = {
  name: "echo",
  description: "Return the input text exactly as provided.",
  run: async (args) => {
    const text =
      typeof args.text === "string"
        ? args.text
        : typeof args.message === "string"
          ? args.message
          : "";
    return { ok: true, echoed: text };
  }
};
