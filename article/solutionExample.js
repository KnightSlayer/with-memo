export const withMemo = (originFn) => {
  const cache = {};

  return (arg) => {
    if (!(arg in cache)) {
      cache[arg] = originFn(arg);
    }

    return cache[arg];
  };
};
