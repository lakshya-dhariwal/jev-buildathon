#!/usr/bin/env node
// MCP server "support": the Kettle & Co support desk, for the Pip agent.
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "../../env/mcp.mjs";
import { tools } from "./tools.mjs";
import { createWorld, NOW } from "./world.mjs";

serve({
  name: "support",
  version: "1.0.0",
  agentDir: dirname(fileURLToPath(import.meta.url)),
  createWorld,
  tools,
  instructions: `Kettle & Co customer support tools. The current time is ${NOW}.`,
});
