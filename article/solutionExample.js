export const withMemo = (
  originFn,
  {
    getKey = (arg) => arg,
    getCacheStore = () => new Map(),
    cacheRejectedPromise = false,
    ttl,
  } = {},
) => {
  const createSubCache = () => ({
    subCaches: getCacheStore(),
    result: null,
    isCached: false,
    invalidationTimeoutId: null,
  });

  const rootCache = createSubCache();

  const invalidateByCache = (theCache) => {
    theCache.isCached = false;
    theCache.result = null;
    clearTimeout(theCache.invalidationTimeoutId);
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
      currentCache.result = originFn(...args);
      currentCache.isCached = true;

      if (ttl != null) {
        currentCache.invalidationTimeoutId = setTimeout(
          () => invalidateByCache(currentCache),
          ttl,
        );
      }
    }

    if (!cacheRejectedPromise) {
      Promise.resolve(currentCache.result).catch(() =>
        invalidateByCache(currentCache),
      );
    }

    return currentCache.result;
  };
};
