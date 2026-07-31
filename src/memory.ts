import { mkdir, appendFile } from "node:fs/promises";
import { join } from "node:path";
import type { AgentState } from "./state.js";
import type { AgentSession } from "./session.js";
import type { PlannerDecision } from "./planner.js";

export type MemoryEntry = {
  iteration: number;
  planner: PlannerDecision;
  toolOutput: unknown;
  state: AgentState;
  timestamp: string;
};

export type AgentMemory = {
  entries: MemoryEntry[];
};

export const createMemory = (): AgentMemory => ({ entries: [] });

// Persisting each iteration makes the loop inspectable after runtime.
export const saveMemory = async (
  memory: AgentMemory,
  session: AgentSession,
  entry: MemoryEntry
): Promise<void> => {
  memory.entries.push(entry);
  const dir = join(process.cwd(), ".agent-memory");
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, `${session.sessionId}.jsonl`);
  await appendFile(filePath, JSON.stringify(entry) + "\n", "utf-8");
};
