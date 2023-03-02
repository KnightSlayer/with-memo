export const withMemo = (
  originFn,
  {
    getKey = (arg) => arg,
    getCacheStore = () => new Map(),
    cacheRejectedPromise = false,
  } = {},
) => {
  const createSubCache = () => ({
    subCaches: getCacheStore(),
    result: null,
    isCached: false,
  });

  const rootCache = createSubCache();

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
    }

    if (!cacheRejectedPromise) {
      Promise.resolve(currentCache.result).catch(() => {
        currentCache.isCached = false;
        currentCache.result = null;
      });
    }

    return currentCache.result;
  };
};
