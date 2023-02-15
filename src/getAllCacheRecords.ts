import type { CacheData } from "./types";

export const getAllCacheRecords = (rootCache: CacheData): CacheData[] => {
  const stack = [rootCache];
  const allCacheRecords: CacheData[] = [];

  while (stack.length) {
    const cacheData = stack.pop();
    if (!cacheData) throw new Error("Something went really wrong");

    if (cacheData.isCached) {
      allCacheRecords.push(cacheData);
    }

    cacheData.subCaches.forEach((subCacheData) => stack.push(subCacheData));
  }

  return allCacheRecords;
};

export default getAllCacheRecords;
