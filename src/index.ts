import { runHarness } from "./harness.js";

const goalFromArgs = process.argv.slice(2).join(" ").trim();

if (!goalFromArgs) {
  console.error("Usage: npm run start -- \"<goal>\"");
  process.exit(1);
}

runHarness(goalFromArgs).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Harness failed:", message);
  process.exit(1);
});
