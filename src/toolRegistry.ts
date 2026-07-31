export type ToolContext = {
  cwd: string;
};

export type ToolFunction = (
  args: Record<string, unknown>,
  context: ToolContext
) => Promise<unknown>;

export type ToolDefinition = {
  name: string;
  description: string;
  run: ToolFunction;
};

export type ToolRegistry = {
  register: (tool: ToolDefinition) => void;
  get: (name: string) => ToolDefinition | undefined;
  list: () => ToolDefinition[];
};

export const createToolRegistry = (): ToolRegistry => {
  const tools = new Map<string, ToolDefinition>();

  return {
    register: (tool) => {
      tools.set(tool.name, tool);
    },
    get: (name) => tools.get(name),
    list: () => Array.from(tools.values())
  };
};

export const executeTool = async (
  registry: ToolRegistry,
  action: string,
  args: Record<string, unknown>,
  context: ToolContext
): Promise<unknown> => {
  const tool = registry.get(action);
  if (!tool) {
    throw new Error(
      `Unknown tool "${action}". Registered tools: ${registry
        .list()
        .map((t) => t.name)
        .join(", ")}`
    );
  }
  return tool.run(args, context);
};
