import { Command } from "commander";
import { readFile, writeFile } from "fs/promises";
import chalk from "chalk";
import OpenAI from "openai";
import * as dotenv from "dotenv";
import { strategies } from "./strategies/index.js";
import { StrategyName, TemplateOptions } from "./types.js";
import { execSync } from "child_process";
import { inspect } from "util";

dotenv.config();

export type Args = {
  prompt: string;
  file: string;
  out: string;
  strategy: StrategyName;
};

// ----- Main -----
async function main() {
  const prog = new Command();
  prog
    .requiredOption("--prompt <p>", "Edit instruction")
    .requiredOption("--file <f>", "Path to file")
    .requiredOption("--out <f>", "Path to output file")
    .option("--strategy <s>", "Update strategy", "naive")
    .parse(process.argv);
  const opts = prog.opts<Args>();

  const original = await readFile(opts.file, "utf8");
  const strategy = strategies.find((s) => s.name === opts.strategy)!;
  const templateOptions: TemplateOptions = {
    file: opts.file,
    original,
    instruction: opts.prompt,
  };
  const prompt = strategy.template(templateOptions);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  });

  console.log(chalk.bold.cyan("\n=== LLM Request ==="));
  logWithHighlighting(prompt, "markdown");

  console.log(chalk.bold.cyan("\n=== LLM Response (streaming) ==="));

  // Use streaming for the UI feedback
  const reponseStart = Date.now();
  const stream = openai.responses.stream({
    model: "gpt-4.1",
    input: prompt,
    stream: true,
  });
  let responseUsage;
  let response = "";
  console.log(chalk.grey("."));
  for await (const event of stream) {
    if (event.type === "response.output_text.delta") {
      const delta = event.delta;
      response += delta;
    } else if (event.type === "response.completed") {
      responseUsage = event.response.usage;
    }
    const reponseLines = response.split("\n").length;
    clearLogLine();
    console.log(chalk.grey(".".repeat(1 + reponseLines)));
  }
  const responseTimeMs = Date.now() - reponseStart;
  clearLogLine();
  logWithHighlighting(response, "markdown");
  logStats({
    time: `${responseTimeMs / 1000}s`,
    ...responseUsage,
  });

  console.log(chalk.bold.cyan("\n\n=== Applying Strategy ==="));
  const applyStart = Date.now();
  const updated = await strategy.apply({
    ...templateOptions,
    response,
  });
  const applyTimeMs = Date.now() - applyStart;
  logStats({ time: `${applyTimeMs}s` });

  const updatedFile = opts.out;
  await writeFile(updatedFile, updated, "utf8");

  console.log(chalk.bold.cyan("\n=== Diff ==="));
  logDiff(opts.file, updatedFile);
}

function logStats(stats: Record<string, unknown>) {
  console.log(
    Object.entries(stats)
      .map((v) => `${chalk.blue(v[0])}=${inspect(v[1], { colors: true })}`)
      .join("\n"),
  );
}

function clearLogLine(): void {
  process.stdout.moveCursor(0, -1);
  process.stdout.clearLine(1);
}

async function logWithHighlighting(
  log: string,
  language: string,
): Promise<void> {
  execSync(
    `bat --style=plain --color=always --language=${language} --paging=never`,
    {
      input: log + "\n",
      stdio: ["pipe", "inherit", "inherit"],
    },
  );
}

async function logDiff(file1: string, file2: string): Promise<void> {
  try {
    execSync(
      `delta --true-color=always --paging=never --hunk-header-style=omit --file-style=omit "${file1}" "${file2}"`,
      {
        stdio: ["inherit", "inherit", "inherit"],
      },
    );
  } catch {
    // ignore
  }
}

main().catch((err) => {
  console.error(chalk.red("Error:"), err);
  process.exit(1);
});
