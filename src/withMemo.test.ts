import { vi, describe, it, expect } from 'vitest'
import { withMemo } from "./withMemo"
import { ClassWithMemoizedMethods } from "./types";
import { lru } from "./cacheReplacementStrategies/lru";
import { memoizeClassMethods } from './memoizeClassMethods'

describe("withMemo", () => {
  it("should call original function only ones and always return original result (no args)", () => {
      const result = Math.random();
      const fn = vi.fn(() => result);
      const memoizedFn = withMemo(fn);

      expect(fn).toHaveBeenCalledTimes(0);
      expect(memoizedFn()).toBe(result);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(memoizedFn()).toBe(result);
      expect(fn).toHaveBeenCalledTimes(1);
    }
  );
  it("'undefined' is valid value", () => {
    const result = undefined;
    const fn = vi.fn(() => result);
    const memoizedFn = withMemo(fn);

    expect(fn).toHaveBeenCalledTimes(0);
    expect(memoizedFn()).toBe(result);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(memoizedFn()).toBe(result);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should cache depending on arg", () => {
    const factor = Math.random();
    const fn = vi.fn((arg) => arg * factor);
    const memoizedFn = withMemo(fn);

    expect(fn).toHaveBeenCalledTimes(0);
    expect(memoizedFn(1)).toBe(factor);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(memoizedFn(1)).toBe(factor);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(memoizedFn(2)).toBe(2 * factor);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(memoizedFn(2)).toBe(2 * factor);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(memoizedFn(1)).toBe(factor);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should cache depending on arg", () => {
    const num = Math.random();
    const fn1 = vi.fn((arg) => ({ ...arg, num }));
    const fn2 = vi.fn((arg) => ({ ...arg, num }));
    const memoizedFn1 = withMemo(fn1, {
      getKey: (arg: any) => arg
    });
    const memoizedFn2 = withMemo(fn2, {
      getKey: (arg: any) => JSON.stringify(arg)
    });
    const argA1 = { a: "a" };
    const argA2 = { a: "a" };

    memoizedFn1(argA1);
    expect(fn1).toHaveBeenCalledTimes(1);
    memoizedFn1(argA2);
    expect(fn1).toHaveBeenCalledTimes(2);

    memoizedFn2(argA1);
    expect(fn2).toHaveBeenCalledTimes(1);
    memoizedFn2(argA2);
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  it("should clear cache on error", async () => {
    const result = Math.random();
    let callIndex = 0;
    const fn = vi.fn(async () => {
      callIndex++;
      if (callIndex === 1) return Promise.reject("Some error");
      return Promise.resolve(result);
    });

    const memoizedFn = withMemo(fn, {
      cacheRejectedPromise: false
    });

    await expect(memoizedFn()).rejects.toEqual("Some error");
    expect(fn).toHaveBeenCalledTimes(1);

    expect(await memoizedFn()).toBe(result);
    expect(fn).toHaveBeenCalledTimes(2);

    expect(await memoizedFn()).toBe(result);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should not clear cache on error", async () => {
    const error = Math.random();
    const fn = vi.fn(async () => Promise.reject(error));

    const memoizedFn = withMemo(fn, {
      cacheRejectedPromise: true
    });

    await expect(memoizedFn()).rejects.toEqual(error);
    expect(fn).toHaveBeenCalledTimes(1);
    await expect(memoizedFn()).rejects.toEqual(error);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("multiple arguments", () => {
    const fn = vi.fn((...args) => args.reduce((acc, num) => acc + num, 0));
    const memoizedFn = withMemo(fn);

    expect(memoizedFn(4, 6)).toBe(10);
    expect(fn).toHaveBeenCalledTimes(1);

    expect(memoizedFn(4, 6)).toBe(10);
    expect(fn).toHaveBeenCalledTimes(1);

    expect(memoizedFn(4, 8)).toBe(12);
    expect(fn).toHaveBeenCalledTimes(2);

    expect(memoizedFn(4)).toBe(4);
    expect(fn).toHaveBeenCalledTimes(3);

    expect(memoizedFn(4, 6)).toBe(10);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("ttl", async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const memoizedFn = withMemo(fn, { ttl: 1000 });

    memoizedFn();
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(500);

    memoizedFn();
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(500);

    memoizedFn();
    expect(fn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("LRU", async () => {
    const fn = vi.fn((...args) => args.join("-"));
    const memoizedFn = withMemo(fn, {
      cacheReplacementPolicy: {
        maxSize: 3,
        strategy: lru,
      }
    });

    memoizedFn(1, 2);
    memoizedFn(1, 3);
    memoizedFn(2, 3);
    memoizedFn(1, 2);
    expect(fn).toHaveBeenCalledTimes(3);
    memoizedFn(3, 3); // replace cache for (1, 3)
    expect(fn).toHaveBeenCalledTimes(4);
    memoizedFn(1, 2);
    expect(fn).toHaveBeenCalledTimes(4);
    memoizedFn(2, 3);
    expect(fn).toHaveBeenCalledTimes(4);
    memoizedFn(3, 3);
    expect(fn).toHaveBeenCalledTimes(4);
    memoizedFn(1, 3); // replace cache for (1, 2)
    expect(fn).toHaveBeenCalledTimes(5);
  });

  it("invalidateCache", () => {
    const fn = vi.fn();
    const memoizedFn = withMemo(fn);

    memoizedFn(1, 2);
    memoizedFn(1, 3);
    memoizedFn.invalidateCache();
    expect(fn).toHaveBeenCalledTimes(2);
    memoizedFn(1, 3);
    expect(fn).toHaveBeenCalledTimes(3);
    memoizedFn(1, 2);
    expect(fn).toHaveBeenCalledTimes(4);
  });

  it("invalidateCacheByArgs", () => {
    const fn = vi.fn((a: number, b: number): number => a + b);
    const memoizedFn = withMemo(fn);

    memoizedFn(1, 2);
    memoizedFn(1, 3);
    memoizedFn.invalidateCacheByArgs(1, 2);
    expect(fn).toHaveBeenCalledTimes(2);
    memoizedFn(1, 3);
    expect(fn).toHaveBeenCalledTimes(2);
    memoizedFn(1, 2);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("context", () => {
    class Point {
      public x: number;
      public y: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
      }

      doubleX(this: Point) {
        return this.x * 2
      }
    }
    const fn = vi.fn(Point.prototype.doubleX);
    Point.prototype.doubleX = withMemo(fn, {
      getContextKey: (context: Point): number => context.x
    });

    const p1 = new Point(3, 100);
    const p2 = new Point(5, 50);

    expect(p1.doubleX()).toBe(6);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(p1.doubleX()).toBe(6);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(p2.doubleX()).toBe(10);
    expect(fn).toHaveBeenCalledTimes(2);
    p2.x = 3;
    expect(p2.doubleX()).toBe(6);
    expect(fn).toHaveBeenCalledTimes(2);
    p2.x = 33;
    expect(p2.doubleX()).toBe(66);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("invalidate with context", () => {
    const fn = vi.fn();
    class Dummy {
      memoizedFn(n: number) {fn(n)}
    }

    const MemoizedDummy = memoizeClassMethods(Dummy, ['memoizedFn'] as const, {
      getContextKey: (context: unknown) => context
    })

    type MemoizedDummy1 = ClassWithMemoizedMethods<Dummy, 'memoizedFn'>

    const obj1 = new MemoizedDummy() as unknown as MemoizedDummy1;
    const obj2 = new MemoizedDummy();

    obj1.memoizedFn(2);
    obj1.memoizedFn(3);
    obj1.memoizedFn(3);
    expect(fn).toHaveBeenCalledTimes(2);
    obj2.memoizedFn(2);
    obj2.memoizedFn(3);
    expect(fn).toHaveBeenCalledTimes(4);
    obj1.memoizedFn.invalidateCacheByContextAndArgs(obj1, 3);
    obj2.memoizedFn(3);
    expect(fn).toHaveBeenCalledTimes(4);
    obj1.memoizedFn(2);
    expect(fn).toHaveBeenCalledTimes(4);
    obj1.memoizedFn(3);
    expect(fn).toHaveBeenCalledTimes(5);
  });

  it("transformArgs", () => {
    const fn = vi.fn((a, b) => a + b);

    const memoizedFn = withMemo(fn, {
      transformArgs: (args: unknown[]) => [...args].sort()
    });

    expect(memoizedFn(4, 9)).toBe(13);
    expect(memoizedFn(9, 4)).toBe(13);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(memoizedFn(4, 4)).toBe(8);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should throw an error when trying to call invalidateCacheByArgs when getContextKey is defined", () => {
    const memoizedFn = withMemo(() => {}, {
      getContextKey: (a: any) => a,
    });
    memoizedFn();
    expect(() => memoizedFn.invalidateCacheByArgs()).toThrow(new Error("Use invalidateCacheByContextAndArgs instead"));
  })

  it("should throw an error when trying to call invalidateCacheByContextAndArgs when getContextKey isn't defined", () => {
    const memoizedFn = withMemo(() => {});
    memoizedFn();
    expect(() => memoizedFn.invalidateCacheByContextAndArgs(null)).toThrow(new Error("Use invalidateCacheByArgs instead"));
  })

  it("should not fail if call invalidateCacheByArgs for uncached arguments", () => {
    const memoizedFn = withMemo((a: number) => a);
    expect(memoizedFn.invalidateCacheByArgs(1)).toBeUndefined();
  })

  it("should not fail if call invalidateCacheByContextAndArgs for uncached arguments", () => {
    const memoizedFn = withMemo((a: number) => a, {
      getContextKey: (a: any) => a,
    });
    expect(memoizedFn.invalidateCacheByContextAndArgs(null,1)).toBeUndefined();
    memoizedFn.call(null, 1)
    expect(memoizedFn.invalidateCacheByContextAndArgs(null,2)).toBeUndefined();
  })
})