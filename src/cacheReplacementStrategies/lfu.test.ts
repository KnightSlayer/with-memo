import { describe, it, expect } from "vitest";
import { lfu } from "./lfu";

describe("cacheReplacementStrategies: LFU", () => {
  it("should handle empty set", () => {
    expect(lfu([])).toEqual([]);
  });

  it("should return Least-Frequently Used", () => {
    const item1 = {
      id: 1,
      hits: [{
        index: 2,
        timestamp: 2,
      }, {
        index: 4,
        timestamp: 4,
      }],
    };
    const item2 = {
      id: 2,
      hits: [{
        index: 1,
        timestamp: 1,
      }],
    };
    // test
    const item3 = {
      id: 3,
      hits: [{
        index: 3,
        timestamp: 3,
      }, {
        index: 5,
        timestamp: 5,
      }, {
        index: 6,
        timestamp: 6,
      }],
    };

    const res = lfu([item1, item2, item3]);
    expect(res.length).toBe(1);
    expect(res[0]).toBe(item2);
  });
});

