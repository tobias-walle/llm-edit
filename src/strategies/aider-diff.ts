import type { Strategy } from "../types.ts";
import { extractCodeBlocks } from "../utils/markdown.ts";

export const aiderDiffStrategy: Strategy = {
  name: "aider-diff",
  template: ({ original, instruction, language }) =>
    `
You are given a file below. Apply the following instruction and return ONLY the changes in the following format.

\`\`\`
<<<<<<< ORIGINAL
<original-code>
=======
<code-to-replace-original-code>
>>>>>>> UPDATED
\`\`\`

You can combine multiple replacements
\`\`\`
<<<<<<< ORIGINAL
<original-code-1>
=======
<code-to-replace-original-code-1>
>>>>>>> UPDATED
<<<<<<< ORIGINAL
<original-code-2>
=======
<code-to-replace-original-code-2>
>>>>>>> UPDATED
<<<<<<< ORIGINAL
<original-code-3>
=======
<code-to-replace-original-code-3>
>>>>>>> UPDATED
\`\`\`

Always wrap your replace in a code block with the language marker "${language}"!

Instruction:
${instruction}

File content:
\`\`\`${language}
${original}
\`\`\`
`.trim(),
  apply: async ({ original, response }) => {
    let result = original;
    for (const block of extractCodeBlocks(response)) {
      for (const patch of parseDiff(block)) {
        result = result.replaceAll(patch.original, patch.updated);
      }
    }
    return result;
  },
};

type Patch = { original: string; updated: string };

function parseDiff(diffBlock: string): Patch[] {
  const patchRegex =
    /<<<<<<< ORIGINAL\s*([\s\S]*?)=======\s*([\s\S]*?)>>>>>>> UPDATED/g;
  const patches: Patch[] = [];
  let match: RegExpExecArray | null;

  while ((match = patchRegex.exec(diffBlock)) !== null) {
    patches.push({
      original: match[1].trim(),
      updated: match[2].trim(),
    });
  }

  return patches;
}
