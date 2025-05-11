#!/usr/bin/env node
import { Command } from "commander";
import { readFile, writeFile } from "fs/promises";
import chalk from "chalk";
import * as dotenv from "dotenv";
import { strategies } from "./strategies/index.ts";
import type { StrategyName, TemplateOptions } from "./types.ts";
import { execSync } from "child_process";
import { inspect } from "util";
import { getOpenAiClient } from "./utils/openai.ts";
import type { ResponseUsage } from "openai/resources/responses/responses.mjs";
import { calculateUsagePrice } from "./utils/costs.ts";

main().catch((err) => {
  console.error(chalk.red("Error:"), err);
  process.exit(1);
});

export type Args = {
  prompt: string;
  file: string;
  out: string;
  strategy: StrategyName;
  model: string;
};

async function main() {
  dotenv.config();

  const prog = new Command();
  prog
    .name("llm-edit")
    .requiredOption("-p, --prompt <p>", "Edit instruction")
    .requiredOption("-f, --file <f>", "Path to file")
    .requiredOption("-o, --out <f>", "Path to output file")
    .option("-s, --strategy <s>", "Update strategy", "naive")
    .option("-m, --model <m>", "Model to use", "gpt-4.1")
    .parse(process.argv);
  const opts = prog.opts<Args>();

  const original = await readFile(opts.file, "utf8");
  const strategy = strategies.find((s) => s.name === opts.strategy)!;
  const templateOptions: TemplateOptions = {
    file: opts.file,
    original,
    instruction: opts.prompt,
    language: opts.file.split(".").at(-1) ?? "text",
  };
  const prompt = strategy.template(templateOptions);

  const openai = getOpenAiClient();

  console.log(chalk.bold.cyan("\n=== LLM Request ==="));
  logWithHighlighting(prompt, "markdown");

  console.log(chalk.bold.cyan("\n=== LLM Response ==="));

  // Use streaming for the UI feedback
  const reponseStart = Date.now();
  const stream = openai.responses.stream({
    model: opts.model,
    input: prompt,
    stream: true,
  });
  let responseStats: any | undefined;
  let response = "";
  console.log(chalk.grey("."));
  for await (const event of stream) {
    if (event.type === "response.output_text.delta") {
      const delta = event.delta;
      response += delta;
    } else if (event.type === "response.completed") {
      responseStats = event.response.usage;
    }
    const reponseLines = response.split("\n").length;
    clearLogLine();
    console.log(chalk.grey(".".repeat(1 + reponseLines)));
  }
  const responseTimeMs = Date.now() - reponseStart;
  if (responseStats) {
    responseStats.tokens_per_second =
      responseStats.total_tokens / (responseTimeMs / 1000);
  }
  clearLogLine();
  logWithHighlighting(response, "markdown");

  console.log(chalk.bold.cyan("\n\n=== Applying Strategy ==="));
  const { result: updated, stats: applyStats = {} } = await strategy.apply({
    ...templateOptions,
    response,
  });

  const updatedFile = opts.out;
  await writeFile(updatedFile, updated, "utf8");

  console.log(chalk.bold.cyan("\n=== Diff ==="));
  logDiff(opts.file, updatedFile);

  console.log(chalk.bold.cyan("\n=== Stats ==="));
  console.log(chalk.magenta("\n--- Response ---"));
  logStats({
    ...responseStats,
    price: responseStats
      ? calculateUsagePrice(responseStats, opts.model)
      : undefined,
    time: `${responseTimeMs / 1000}s`,
  });
  if (applyStats) {
    console.log(chalk.magenta("\n--- Apply ---"));
    logStats(applyStats);
  }
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
