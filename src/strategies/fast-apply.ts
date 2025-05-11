import type { Strategy } from "../types.ts";
import { calculateUsagePrice } from "../utils/costs.ts";
import { extractCodeBlocks } from "../utils/markdown.ts";
import { getOpenAiClient } from "../utils/openai.ts";

export const fastApplyStrategy: Strategy = {
  name: "fast-apply",
  template: ({ original, instruction, language }) =>
    `
You are given a file below. Apply the following instruction and return the changes.
Use comments with '… Unchanged …' to mark unchanged code.
USE THE '… Unchanged …' TO REPLY WITH THE MINIMAL AMOUNT OF CODE!

For example:
\`\`\`ts
// … Unchanged …
export type OnEnter = (event: KeyboardEvent) => void;

export function whenEnter(
  event: KeyboardEvent,
  onEnter: EnterEventHandler,
): OnEnter {
  // … Unchanged …
      onEnter(event);
  // … Unchanged …
}
// … Unchanged …
\`\`\`

Instruction:
${instruction}

File content:
\`\`\`${language}
${original}
\`\`\`
`.trim(),
  apply: async ({ original, language, response }) => {
    const applyStart = Date.now();
    const patch = extractCodeBlocks(response).at(-1) ?? response;
    const openai = getOpenAiClient();
    const model = "gpt-4.1-nano";
    const fastApplyResponse = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: getFastEditSystemPrompt() },
        {
          role: "user",
          content: getFastEditPrompt({
            language,
            originalContent: original,
            patchContent: patch,
          }),
        },
      ],
      prediction: {
        type: "content",
        content: `\`\`\`${language}\n${original}\n\`\`\``,
      },
    });
    const fastApplyResponseContent =
      fastApplyResponse.choices[0]?.message.content ?? "";
    if (!fastApplyResponseContent) {
      throw new Error("No Reponse Provided");
    }
    const result =
      extractCodeBlocks(fastApplyResponseContent).at(-1) ??
      fastApplyResponseContent;
    const applyTimeMs = Date.now() - applyStart;
    const applyTimeS = applyTimeMs / 1000;
    const stats: any = { ...fastApplyResponse.usage };
    if (fastApplyResponse.usage) {
      stats.tokens_per_second =
        fastApplyResponse.usage.total_tokens / applyTimeS;
      stats.price = calculateUsagePrice(fastApplyResponse.usage, model);
    }
    stats.time = `${applyTimeS}s`;
    return {
      result,
      stats: stats,
    };
  },
};

function getFastEditSystemPrompt(): string {
  return `
Act as a very detail oriented text & code editor.

You are getting a patch and the original code and are outputting the FULL code with changes applied.

- ONLY apply the specified changes
- Replace ALL occurences of \`… Unchanged …\` with the original code. NEVER include \`… Unchanged …\` comments in your output.
- Always output the FULL UPDATED FILE. DO NOT remove anything if not otherwise specified!
- ALWAYS REPLACE ALL \`… Unchanged …\` comments with the original code!

--- EXAMPLE ---
# User
<original>
\`\`\`typescript
export type EnterEventHandler = (event: KeyboardEvent) => void;

export function whenEnter(
  event: KeyboardEvent,
  handler: EnterEventHandler,
): EnterEventHandler {
  return (event) => {
    if (event.key === 'Enter') {
      handler(event);
    }
  };
}
\`\`\`
</original>

<patch>
\`\`\`typescript
// … Unchanged …
export type OnEnter = (event: KeyboardEvent) => void;

export function whenEnter(
  event: KeyboardEvent,
  onEnter: EnterEventHandler,
): OnEnter {
  // … Unchanged …
      onEnter(event);
  // … Unchanged …
}

// … Unchanged …
\`\`\`
<patch>

# Assistant
\`\`\`typescript
import { KeyboardEvent } from 'events';

export type OnEnter = (event: KeyboardEvent) => void;

export function whenEnter(
  event: KeyboardEvent,
  onEnter: OnEnter,
): OnEnter {
  return (event) => {
    if (event.key === 'Enter') {
      onEnter(event);
    }
  };
}

export function whenLeave(
  event: KeyboardEvent,
  onLeave: OnEnter,
): OnEnter {
  return (event) => {
    if (event.key === 'Leave') {
      onLeave(event);
    }
  };
}
\`\`\`
`;
}

type FastEditPromptParams = {
  language: string;
  originalContent: string;
  patchContent: string;
};

function getFastEditPrompt({
  language,
  originalContent,
  patchContent,
}: FastEditPromptParams): string {
  return `
<original>
\`\`\`${language}
${originalContent}
\`\`\`
</original>

<patch>
\`\`\`${language}
${patchContent}
\`\`\`
</patch>
`;
}
