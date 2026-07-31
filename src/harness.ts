import { addMessage, createSession } from "./session.js";
import { createInitialState, updateStateAfterTool } from "./state.js";
import { createMemory, saveMemory } from "./memory.js";
import { plan } from "./planner.js";
import {
  createToolRegistry,
  executeTool,
  type ToolContext,
  type ToolRegistry
} from "./toolRegistry.js";
import { echoTool } from "./tools/echo.js";
import { calculatorTool } from "./tools/calculator.js";
import { readFileTool } from "./tools/readFile.js";
import { writeFileTool } from "./tools/writeFile.js";

export type HarnessOptions = {
  maxIterations?: number;
};

const registerTools = (registry: ToolRegistry): void => {
  registry.register(echoTool);
  registry.register(calculatorTool);
  registry.register(readFileTool);
  registry.register(writeFileTool);
};

const printBlock = (label: string, value: string): void => {
  console.log(label);
  console.log(value);
  console.log("");
};

export const runHarness = async (
  goal: string,
  options: HarnessOptions = {}
): Promise<void> => {
  const maxIterations = options.maxIterations ?? 12;
  const registry = createToolRegistry();
  registerTools(registry);

  let state = createInitialState(goal);
  let session = createSession(goal);
  const memory = createMemory();
  const context: ToolContext = { cwd: process.cwd() };

  let iteration = 0;
  let done = false;

  while (!done && iteration < maxIterations) {
    iteration += 1;
    console.log("==================================");
    console.log(`Iteration ${iteration}`);
    console.log("==================================");
    console.log("");

    const decision = await plan(goal, state, session, registry);
    session = addMessage(session, "planner", JSON.stringify(decision));
    printBlock("Planner Thought", decision.thought);
    printBlock("Selected Tool", `${decision.action}()`);
    printBlock("Arguments", JSON.stringify(decision.arguments, null, 2));

    if (decision.done) {
      done = true;
      state = {
        ...state,
        currentStep: decision.thought,
        completedSteps: [...state.completedSteps, decision.thought]
      };
      printBlock("Tool Output", "Planner marked work as complete.");
    } else {
      const toolOutput = await executeTool(
        registry,
        decision.action,
        decision.arguments,
        context
      );
      session = addMessage(
        session,
        "tool",
        JSON.stringify({ tool: decision.action, output: toolOutput })
      );
      state = updateStateAfterTool(state, decision.thought, decision.action, toolOutput);
      printBlock("Tool Output", JSON.stringify(toolOutput, null, 2));
    }

    printBlock("Updated State", JSON.stringify(state, null, 2));

    await saveMemory(memory, session, {
      iteration,
      planner: decision,
      toolOutput: state.toolOutputs[decision.action] ?? null,
      state,
      timestamp: new Date().toISOString()
    });
  }

  if (!done) {
    throw new Error(
      `Harness reached max iterations (${maxIterations}) before planner returned done=true.`
    );
  }

  console.log("Harness completed successfully.");
  console.log(`Session ID: ${session.sessionId}`);
};
