import type { Strategy } from "../types.ts";
import { naiveStrategy } from "./naive.ts";
import { aiderDiffStrategy } from "./aider-diff.ts";
import { fastApplyStrategy } from "./fast-apply.ts";

export const strategies: Strategy[] = [
  naiveStrategy,
  aiderDiffStrategy,
  fastApplyStrategy,
];
