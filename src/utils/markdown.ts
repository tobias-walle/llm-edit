export function extractCodeBlocks(text: string): string[] {
  const blocks: string[] = [];
  let codeLines: string[] = [];
  let insideBlock = false;
  for (const line of text.split("\n")) {
    if (line.startsWith("```")) {
      if (insideBlock) {
        blocks.push(codeLines.join("\n") + "\n");
        codeLines = [];
        insideBlock = false;
      } else {
        insideBlock = true;
      }
    } else if (insideBlock) {
      codeLines.push(line);
    }
  }
  return blocks;
}
