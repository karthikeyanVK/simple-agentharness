import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { AgentState } from "./state.js";
import type { AgentSession } from "./session.js";
import type { ToolRegistry } from "./toolRegistry.js";
import { callResponsesApi } from "./llm.js";

export type PlannerDecision = {
  thought: string;
  action: string;
  arguments: Record<string, unknown>;
  done: boolean;
};

const validateDecision = (raw: unknown): PlannerDecision => {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Planner response must be a JSON object.");
  }
  const decision = raw as Record<string, unknown>;
  if (typeof decision.thought !== "string") {
    throw new Error('Planner response missing string field "thought".');
  }
  if (typeof decision.action !== "string") {
    throw new Error('Planner response missing string field "action".');
  }
  if (typeof decision.done !== "boolean") {
    throw new Error('Planner response missing boolean field "done".');
  }
  if (
    typeof decision.arguments !== "object" ||
    decision.arguments === null ||
    Array.isArray(decision.arguments)
  ) {
    throw new Error('Planner response field "arguments" must be an object.');
  }
  return {
    thought: decision.thought,
    action: decision.action,
    arguments: decision.arguments as Record<string, unknown>,
    done: decision.done
  };
};

export const plan = async (
  goal: string,
  state: AgentState,
  session: AgentSession,
  registry: ToolRegistry
): Promise<PlannerDecision> => {
  const promptPath = join(process.cwd(), "src", "prompts", "planner.md");
  const plannerPrompt = await readFile(promptPath, "utf-8");
  const tools = registry
    .list()
    .map((t) => `- ${t.name}: ${t.description}`)
    .join("\n");

  const userPrompt = [
    `Goal: ${goal}`,
    "",
    `Current state JSON:`,
    JSON.stringify(state, null, 2),
    "",
    `Conversation transcript:`,
    session.conversation.join("\n"),
    "",
    `Available tools:`,
    tools
  ].join("\n");

  const raw = await callResponsesApi(plannerPrompt, userPrompt);
  return validateDecision(raw);
};
