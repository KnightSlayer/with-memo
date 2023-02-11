import type { CacheReplacementStrategy, Hit } from "../types";

export const lru: CacheReplacementStrategy = (itemsSet: Set<{hits: Hit[]}>) => {
  return [
    Array.from(itemsSet)
      .sort((a, b) => {
        const aIndex = a.hits.at(-1)?.index || 0;
        const bIndex = b.hits.at(-1)?.index || 0;

        return aIndex - bIndex
      })
      .at(0)
  ];
}

export default lru