import type { Strategy } from "../types.ts";
import { extractCodeBlocks } from "../utils/markdown.ts";

export const naiveStrategy: Strategy = {
  name: "naive",
  template: ({ original, instruction, language }) =>
    `
You are given a file below. Apply the following instruction and return the complete updated file, nothing else.

Instruction:
${instruction}

File content:
\`\`\`${language}
${original}
\`\`\`
`.trim(),
  apply: async ({ response }) => {
    return extractCodeBlocks(response).at(-1) ?? response;
  },
};
