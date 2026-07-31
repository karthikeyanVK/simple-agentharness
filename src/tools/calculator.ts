import type { ToolDefinition } from "../toolRegistry.js";

const isSafeExpression = (expression: string): boolean =>
  /^[\d+\-*/().\s]+$/.test(expression);

export const calculatorTool: ToolDefinition = {
  name: "calculator",
  description:
    "Evaluate arithmetic expressions like 2+2, (10/2)+7, or 3*4-1.",
  run: async (args) => {
    const expression = String(args.expression ?? "");
    if (!expression) {
      throw new Error('calculator requires argument: "expression".');
    }
    if (!isSafeExpression(expression)) {
      throw new Error("Expression contains unsupported characters.");
    }
    const value = Function(`"use strict"; return (${expression});`)() as number;
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new Error("Expression did not evaluate to a valid number.");
    }
    return { ok: true, expression, result: value, variables: { lastResult: value } };
  }
};
