export const withMemo = (
  originFn,
  {
    getKey = (arg) => arg,
    cache = new Map(),
  } = {},
) => {
  return (arg) => {
    const cacheKey = getKey(arg);

    if (!cache.has(cacheKey)) {
      cache.set(cacheKey, originFn(arg));
    }

    return cache.get(cacheKey);
  };
};
