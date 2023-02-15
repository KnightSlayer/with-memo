import { describe, it, expect } from "vitest";
import { getAllCacheRecords } from "./getAllCacheRecords";
import type { CacheData } from "./types";

describe("getAllCacheRecords", () => {
  const createSubCache = (result: number, isCached: boolean): CacheData => ({
    subCaches: new Map(),
    result,
    isCached,
    invalidationTimeoutId: null,
    hits: [],
  });

  it("only root cache. isCached: false", () => {
    const rootCache = createSubCache(1, false);

    const allCacheRecords = getAllCacheRecords(rootCache);
    expect(allCacheRecords.length).toBe(0);
  });

  it("only root cache. isCached: true", () => {
    const rootCache = createSubCache(1, true);

    const allCacheRecordsResults = getAllCacheRecords(rootCache).map((c) => c.result);
    expect(allCacheRecordsResults).toEqual([1]);
  });

  it("deep 2. root: false. sub: true", () => {
    const rootCache = createSubCache(1, false);
    rootCache.subCaches.set(2, createSubCache(2, true));

    const allCacheRecordsResults = getAllCacheRecords(rootCache).map((c) => c.result);
    expect(allCacheRecordsResults).toEqual([2]);
  });

  it("deep 2. root: false. sub: false", () => {
    const rootCache = createSubCache(1, false);
    rootCache.subCaches.set(2, createSubCache(2, false));

    const allCacheRecordsResults = getAllCacheRecords(rootCache).map((c) => c.result);
    expect(allCacheRecordsResults).toEqual([]);
  });

  it("deep 2. root: true. sub: false", () => {
    const rootCache = createSubCache(1, true);
    rootCache.subCaches.set(2, createSubCache(2, false));

    const allCacheRecordsResults = getAllCacheRecords(rootCache).map((c) => c.result);
    expect(allCacheRecordsResults).toEqual([1]);
  });

  it("deep 2. root: true. sub: true", () => {
    const rootCache = createSubCache(1, true);
    rootCache.subCaches.set(2, createSubCache(2, true));

    const allCacheRecordsResults = getAllCacheRecords(rootCache).map((c) => c.result);
    expect(allCacheRecordsResults).toEqual([1, 2]);
  });

  it("deep 4", () => {
    const rootCache = createSubCache(1, true);
    const cache2 = createSubCache(2, false);
    rootCache.subCaches.set(2, cache2);
    const cache3 = createSubCache(3, true);
    cache2.subCaches.set(3, cache3);
    const cache4 = createSubCache(4, true);
    cache2.subCaches.set(4, cache4);
    const cache5 = createSubCache(5, false);
    cache4.subCaches.set(5, cache5);
    const cache6 = createSubCache(6, false);
    cache4.subCaches.set(6, cache6);
    const cache7 = createSubCache(7, true);
    rootCache.subCaches.set(7, cache7);

    const allCacheRecordsResults = getAllCacheRecords(rootCache).map((c) => c.result).sort();
    expect(allCacheRecordsResults).toEqual([1, 3, 4, 7]);
  });
});
