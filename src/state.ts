export type AgentState = {
  goal: string;
  currentStep: string;
  completedSteps: string[];
  toolOutputs: Record<string, unknown>;
  variables: Record<string, unknown>;
};

export const createInitialState = (goal: string): AgentState => ({
  goal,
  currentStep: "Waiting for planner",
  completedSteps: [],
  toolOutputs: {},
  variables: {}
});

// Keep state updates centralized so learners can see exactly how memory evolves.
export const updateStateAfterTool = (
  state: AgentState,
  step: string,
  toolName: string,
  toolOutput: unknown
): AgentState => {
  const nextCompleted = [...state.completedSteps, step];
  const nextOutputs = { ...state.toolOutputs, [toolName]: toolOutput };
  const variablePatch =
    typeof toolOutput === "object" &&
    toolOutput !== null &&
    "variables" in toolOutput &&
    typeof (toolOutput as { variables?: unknown }).variables === "object" &&
    (toolOutput as { variables?: unknown }).variables !== null
      ? ((toolOutput as { variables: Record<string, unknown> }).variables)
      : {};

  return {
    ...state,
    currentStep: step,
    completedSteps: nextCompleted,
    toolOutputs: nextOutputs,
    variables: { ...state.variables, ...variablePatch }
  };
};
