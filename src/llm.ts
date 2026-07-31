import { AzureOpenAI } from "openai";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const extractJsonObject = (text: string): string => {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error(`Planner did not return JSON. Raw output: ${trimmed}`);
  }
  return match[0];
};

export const callResponsesApi = async (
  systemPrompt: string,
  userPrompt: string
): Promise<unknown> => {
  const configPath = join(process.cwd(), "agent.config.json");
  const rawConfig = await readFile(configPath, "utf-8").catch(() => {
    throw new Error(
      'Missing agent.config.json. Copy agent.config.example.json to agent.config.json and set azure.apiKey.'
    );
  });
  const parsedConfig = JSON.parse(rawConfig) as unknown;
  if (typeof parsedConfig !== "object" || parsedConfig === null) {
    throw new Error("agent.config.json must contain a JSON object.");
  }

  const azureConfig = (parsedConfig as { azure?: unknown }).azure;
  if (typeof azureConfig !== "object" || azureConfig === null) {
    throw new Error('agent.config.json must include "azure" object.');
  }

  const { apiKey, endpoint, deployment, apiVersion } = azureConfig as Record<string, unknown>;
  if (typeof apiKey !== "string" || !apiKey.trim()) {
    throw new Error('agent.config.json must include non-empty "azure.apiKey".');
  }
  if (typeof endpoint !== "string" || !endpoint.trim()) {
    throw new Error('agent.config.json must include non-empty "azure.endpoint".');
  }
  if (typeof deployment !== "string" || !deployment.trim()) {
    throw new Error('agent.config.json must include non-empty "azure.deployment".');
  }
  if (typeof apiVersion !== "string" || !apiVersion.trim()) {
    throw new Error('agent.config.json must include non-empty "azure.apiVersion".');
  }

  const client = new AzureOpenAI({ apiKey, endpoint, deployment, apiVersion });
  const response = await client.responses.create({
    model: deployment,
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0
  });

  const rawText = response.output_text ?? "";
  const jsonText = extractJsonObject(rawText);
  return JSON.parse(jsonText) as unknown;
};
