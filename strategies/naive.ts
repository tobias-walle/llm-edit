import { Strategy } from "../types.js";

export const naiveStrategy: Strategy = {
  name: "naive",
  template: ({ original, instruction }) =>
    `
You are given a file below. Apply the following instruction and return the complete updated file, nothing else.

Instruction:
${instruction}

File content:
\`\`\`python
${original}
\`\`\`
`.trim(),
  apply: async ({ response }) => {
    let codeLines = [];
    let started = false;
    for (const line of response.split("\n")) {
      if (line.startsWith("```")) {
        if (started) {
          return codeLines.join("\n") + "\n";
        } else {
          started = true;
        }
      } else {
        codeLines.push(line);
      }
    }
    return response;
  },
};
