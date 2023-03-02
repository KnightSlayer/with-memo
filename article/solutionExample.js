export const withMemo = (
  originFn,
  {
    getKey = (arg) => arg,
    cache = new Map(),
    cacheRejectedPromise = false,
  } = {},
) => {
  return (arg) => {
    const cacheKey = getKey(arg);

    if (!cache.has(cacheKey)) {
      cache.set(cacheKey, originFn(arg));
    }

    const cachedValue = cache.get(cacheKey);

    if (!cacheRejectedPromise) {
      Promise.resolve(cachedValue).catch(() => {
        cache.delete(cacheKey);
      });
    }

    return cachedValue;
  };
};
