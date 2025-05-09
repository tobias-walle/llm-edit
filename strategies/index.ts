import { Strategy } from "../types.js";
import { naiveStrategy } from "./naive.js";
import { searchAndReplaceStrategy } from "./search-and-replace.js";

export const strategies: Strategy[] = [naiveStrategy, searchAndReplaceStrategy];
