import { CacheData } from "./types";

export const getAllCacheRecords = (rootCache: CacheData): CacheData[] => {
  const stack = [rootCache];
  const allCacheRecords: CacheData[] = [];

  while (stack.length) {
    const cacheData = stack.pop()!;

    if (cacheData.isCached) {
      allCacheRecords.push(cacheData);
    }

    cacheData.subCaches.forEach((cacheData) => stack.push(cacheData));
  }

  return allCacheRecords;
};

export default getAllCacheRecords;