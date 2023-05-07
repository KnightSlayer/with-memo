import type { CacheReplacementStrategy } from "../types";
import { lru } from "./lru";
import { mru } from "./mru";
import { lfu } from "./lfu";


const allStrategies: Record<string, CacheReplacementStrategy> = {
  lru,
  mru,
  lfu,
};

export default allStrategies;
