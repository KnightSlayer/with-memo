export const withMemo = (originFn) => {
  const cache = {
    value: undefined,
    isCached: false,
  };

  return () => {
    if (!cache.isCached) {
      cache.value = originFn();
      cache.isCached = true;
    }

    return cache.value;
  };
};
