# Simple Agent Harness (Node.js + TypeScript)

This project is a tiny, transparent AI agent runtime meant for teaching how modern agent systems work internally.

It intentionally avoids orchestration frameworks so every moving part is visible.

## What is an Agent Harness?

An **agent harness** is the runtime loop that repeatedly:

1. reads a goal and current state,
2. asks a planner model what to do next,
3. executes one tool,
4. updates state/memory,
5. repeats until done.

## Requirements

- Node.js 22+
- TypeScript
- OpenAI Responses API

## Install

```bash
npm install
```

Create config from the template:

```bash
copy agent.config.example.json agent.config.json
```

Then edit `agent.config.json` and set:

```json
{
  "azure": {
    "endpoint": "https://your-resource.openai.azure.com/",
    "apiKey": "your_azure_openai_key",
    "deployment": "your-deployment-name",
    "apiVersion": "2025-03-01-preview"
  }
}
```

## Run

```bash
npm run start -- "Create a file named hello.txt with text Hello Agent"
```

## Architecture

```text
User Request
    |
    v
 Planner (OpenAI Responses API)
    |
    v
Tool Selection
    |
    v
Tool Execution
    |
    v
State Update + Session Update + Memory Save
    |
    v
Repeat until done=true
```

## Core Components

### Planner (`src/planner.ts`)
- Combines goal + state + conversation + available tools.
- Calls OpenAI Responses API.
- Enforces JSON-only planner output.

### State (`src/state.ts`)
Tracks:
- `goal`
- `currentStep`
- `completedSteps`
- `toolOutputs`
- `variables`

### Session (`src/session.ts`)
Tracks:
- `sessionId`
- `conversation`
- `messages`

### Memory (`src/memory.ts`)
- Captures each iteration snapshot.
- Persists to `.agent-memory/<sessionId>.jsonl`.

### Tool Registry (`src/toolRegistry.ts`)
- Registers tools independently.
- Looks up by tool name.
- Executes the selected tool.

### Tools (`src/tools/*`)
- `echo()`
- `calculator()`
- `readFile()`
- `writeFile()`

## Lifecycle Loop

The harness loop in `src/harness.ts`:

```ts
while (!done) {
  plan();
  executeTool();
  updateState();
  saveMemory();
}
```

Detailed lifecycle:

```text
Iteration N
----------------------------------
Planner Thought
Selected Tool
Arguments
Tool Output
Updated State
----------------------------------
```

This mirrors miniature versions of tools like Claude Code / Codex where planner, tools, state, and loop are explicit.
# simple-agentharness
