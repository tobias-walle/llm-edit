import type { Strategy } from "../types.ts";
import { naiveStrategy } from "./naive.ts";
import { aiderDiffStrategy } from "./aider-diff.ts";

export const strategies: Strategy[] = [naiveStrategy, aiderDiffStrategy];
