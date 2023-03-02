const cacheReplacementStrategies = {
  lru: (itemsSet) => {
    const asArray = Array.from(itemsSet)
      .sort((a, b) => a.hits.at(-1) - b.hits.at(-1));
    
    return asArray.slice(0, 1);
  },
};

export const withMemo = (
  originFn,
  {
    getKey = (arg) => arg,
    getCacheStore = () => new Map(),
    cacheRejectedPromise = false,
    ttl,
    cacheReplacementPolicy = null,
  } = {},
) => {
  if (cacheReplacementPolicy && !cacheReplacementPolicy.maxSize) {
    throw new Error("maxSize is mandatory for cacheReplacementPolicy");
  }

  const createSubCache = () => ({
    subCaches: getCacheStore(),
    result: null,
    isCached: false,
    invalidationTimeoutId: null,
    hits: [],
  });

  const rootCache = createSubCache();

  const allCacheRecords = new Set();

  const invalidateByCache = (theCache) => {
    clearTimeout(theCache.invalidationTimeoutId);
    theCache.isCached = false;
    theCache.result = null;
    theCache.invalidationTimeoutId = null;
    theCache.hits = [];
    allCacheRecords.delete(theCache);
  };

  return (...args) => {
    let currentCache = rootCache;

    for (const arg of args) {
      const cacheKey = getKey(arg);
      if (!currentCache.subCaches.has(cacheKey)) {
        currentCache.subCaches.set(cacheKey, createSubCache());
      }

      currentCache = currentCache.subCaches.get(cacheKey);
    }

    if (!currentCache.isCached) {
      if (cacheReplacementPolicy) {
        const {
          maxSize,
          strategy = cacheReplacementStrategies.lru,
        } = cacheReplacementPolicy;
        if (allCacheRecords.size >= maxSize) {
          const cachesToReplace = strategy(allCacheRecords);
          cachesToReplace.forEach(invalidateByCache);
        }
      }

      currentCache.result = originFn(...args);
      currentCache.isCached = true;

      if (ttl != null) {
        currentCache.invalidationTimeoutId = setTimeout(
          () => invalidateByCache(currentCache),
          ttl,
        );
      }
      allCacheRecords.add(currentCache);
    }
    currentCache.hits.push(+new Date());

    if (!cacheRejectedPromise) {
      Promise.resolve(currentCache.result).catch(() =>
        invalidateByCache(currentCache),
      );
    }

    return currentCache.result;
  };
};
