import type { CacheReplacementStrategy, Hit } from "../types";

// Most Recently Used
export const mru: CacheReplacementStrategy = <T extends {hits: Hit[]} = {hits: Hit[]}>(items: T[]): T[] => {
  const asArr = [...items]
    .sort((a, b) => {
      const aIndex = a.hits.at(-1)?.index || 0;
      const bIndex = b.hits.at(-1)?.index || 0;

      return bIndex - aIndex;
    });

  return asArr.slice(0, 1);
};

export default mru;
