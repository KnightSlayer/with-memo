export const withMemo = (originFn) => {
  let cache;

  return () => {
    if (cache === undefined) {
      cache = originFn();
    }

    return cache;
  };
};
