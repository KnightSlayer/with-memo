import type { CacheReplacementStrategy } from "../types";
import { lru } from './lru'


const allStrategies: Record<string, CacheReplacementStrategy> = {
  lru,
}

export default allStrategies