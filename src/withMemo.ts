import { WithMemoConfig, MemoizedFunction, CacheData, AnyFunction } from "./types";

export const withMemo = <OriginFn extends AnyFunction>(
  originFn: OriginFn,
  {
    getKey = (arg) => arg,
    getContextKey,
    getCacheStore = () => new Map(),
    cacheRejectedPromise = false,
    ttl,
    cacheReplacementPolicy,
    transformArgs = (args) => args
  }: WithMemoConfig = {}
): MemoizedFunction<OriginFn> => {
  let nextHitIndex = 1;
  const createSubCache = (): CacheData<ReturnType<OriginFn>> => ({
    subCaches: getCacheStore(),
    result: null,
    isCached: false,
    invalidationTimeoutId: null,
    hits: []
  });

  const rootCache = createSubCache();
  const allCacheRecords = new Set();

  const invalidateByCache = (theCache: CacheData) => {
    if (theCache.invalidationTimeoutId) {
      clearTimeout(theCache.invalidationTimeoutId);
    }
    theCache.isCached = false;
    theCache.result = null;
    theCache.invalidationTimeoutId = null;
    theCache.hits = [];
    allCacheRecords.delete(theCache);
  };

  const memoizedFn = function (this: unknown, ...args: Parameters<OriginFn>): ReturnType<OriginFn> {
    let currentCache = rootCache;

    if (getContextKey) {
      const cacheKey = getContextKey(this);
      if (!currentCache.subCaches.has(cacheKey)) {
        currentCache.subCaches.set(cacheKey, createSubCache());
      }

      currentCache = currentCache.subCaches.get(cacheKey);
    }

    for (const arg of transformArgs(args)) {
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
          strategy,
        } = cacheReplacementPolicy;
        if (allCacheRecords.size >= maxSize) {
          const cachesToReplace = strategy(allCacheRecords);
          cachesToReplace.forEach(invalidateByCache);
        }
      }
      currentCache.result = originFn.call(this, ...args) as ReturnType<OriginFn>;
      currentCache.isCached = true;

      if (ttl != null) {
        currentCache.invalidationTimeoutId = setTimeout(
          () => invalidateByCache(currentCache),
          ttl
        );
      }
      allCacheRecords.add(currentCache);
    }
    currentCache.hits.push({
      index: nextHitIndex++,
      timestamp: +new Date(),
    });

    if (!cacheRejectedPromise) {
      Promise.resolve(currentCache.result).catch(() =>
        invalidateByCache(currentCache)
      );
    }

    return currentCache.result!;
  };

  memoizedFn.invalidateCache = () => {
    allCacheRecords.clear();
    Object.assign(rootCache, createSubCache());
  };

  memoizedFn.invalidateCacheByArgs = (...args: Parameters<OriginFn>) => {
    if (getContextKey) throw new Error("Use invalidateCacheByContextAndArgs instead");

    let currentCache = rootCache;

    for (const arg of transformArgs(args)) {
      const cacheKey = getKey(arg);

      currentCache = currentCache.subCaches.get(cacheKey);
      if (!currentCache) return;
    }

    allCacheRecords.delete(currentCache);
    invalidateByCache(currentCache);
  };

  memoizedFn.invalidateCacheByContextAndArgs = (context: unknown, ...args: Parameters<OriginFn>) => {
    if (!getContextKey) throw new Error("Use invalidateCacheByArgs instead");

    let currentCache = rootCache;
    const cotextKey = getContextKey(context);
    currentCache = currentCache.subCaches.get(cotextKey);
    if (!currentCache) return;

    for (const arg of transformArgs(args)) {
      const cacheKey = getKey(arg);

      currentCache = currentCache.subCaches.get(cacheKey);
      if (!currentCache) return;
    }

    allCacheRecords.delete(currentCache);
    invalidateByCache(currentCache);
  };

  return memoizedFn
};

export default withMemo
