import { writeFile } from "fs/promises";
import { Strategy } from "../types.js";

export const searchAndReplaceStrategy: Strategy = {
  name: "naive",
  template: ({ original, instruction }) =>
    `
You are given a TypeScript file below. Apply the following instruction and return the complete updated file, nothing else.

Instruction:
${instruction}

File content:
\`\`\`ts
${original}
\`\`\`
`.trim(),
  apply: async ({ file, response }) => {
    await writeFile(file, response, "utf8");
  },
};
