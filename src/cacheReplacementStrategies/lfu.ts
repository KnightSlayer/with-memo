import type { CacheReplacementStrategy, Hit } from "../types";

// Least-Frequently Used
export const lfu: CacheReplacementStrategy = <T extends {hits: Hit[]} = {hits: Hit[]}>(items: T[]): T[] => {
  const nowTimestamp = +new Date();

  const asArr = [...items]
    .sort((a, b) => {
      const aFirstHitTimestamp = a.hits.at(0)!.timestamp;
      const bFirstHitTimestamp = b.hits.at(0)!.timestamp;
      const aFrequency = a.hits.length / (nowTimestamp -  aFirstHitTimestamp);
      const bFrequency = b.hits.length / (nowTimestamp -  bFirstHitTimestamp);

      return aFrequency - bFrequency;
    });

  return asArr.slice(0, 1);
};

export default lfu;
