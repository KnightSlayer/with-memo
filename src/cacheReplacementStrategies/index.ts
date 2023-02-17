import type { CacheReplacementStrategy } from "../types";
import { lru } from "./lru";
import { mru } from "./mru";


const allStrategies: Record<string, CacheReplacementStrategy> = {
  lru,
  mru,
};

export default allStrategies;
