import chalk from "chalk";
import { execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

export interface ScreenshotOptions {
  linenumbers?: boolean;
}

export async function generateScreenshot(
  path: string,
  options: ScreenshotOptions = {},
): Promise<void> {
  try {
    const filename = path.split(/[\\/]/).pop() ?? path;
    const outputScreenshot = `screenshots/${filename}.png`;
    const linenumbersFlag =
      options.linenumbers === false ? "--no-line-number" : "";
    execSync(
      `silicon --background "#FFFFFF00" "${path}" --output "${outputScreenshot}" ${linenumbersFlag}`.trim(),
      { stdio: "inherit" },
    );
    console.log(chalk.green(`Screenshot saved to ${outputScreenshot}`));
  } catch (err) {
    console.error(chalk.red("Failed to generate screenshot:"), err);
  }
}

export async function generateScreenshotFromCodeSnippet(
  code: string,
  filename: string,
  options: ScreenshotOptions = {},
): Promise<void> {
  const tmpDir = os.tmpdir();
  const tmpFile = path.join(tmpDir, filename);

  try {
    // Write code to temporary file
    await fs.promises.writeFile(tmpFile, code, "utf8");
    await generateScreenshot(tmpFile, options);
  } finally {
    // Clean up temporary file
    try {
      await fs.promises.unlink(tmpFile);
    } catch {
      // Ignore cleanup errors
    }
  }
}
