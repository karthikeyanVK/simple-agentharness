export type SessionMessage = {
  role: "user" | "planner" | "tool" | "system";
  content: string;
};

export type AgentSession = {
  sessionId: string;
  conversation: string[];
  messages: SessionMessage[];
};

export const createSession = (goal: string): AgentSession => {
  const sessionId =
    "session-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 8);

  return {
    sessionId,
    conversation: [`User goal: ${goal}`],
    messages: [{ role: "user", content: goal }]
  };
};

export const addMessage = (
  session: AgentSession,
  role: SessionMessage["role"],
  content: string
): AgentSession => ({
  ...session,
  conversation: [...session.conversation, `${role}: ${content}`],
  messages: [...session.messages, { role, content }]
});
