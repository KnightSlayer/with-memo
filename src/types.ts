export type AnyClass = {
  new (...args:  any[]): any;
}
export type AnyFunction = (this: any, ...args: any[]) => any

export interface CacheStore<K = any, V = any> {
  forEach(cb: (value: V, key: K, cacheStore: CacheStore) => void, thisArg?: unknown): void;
  // clear(): void;
  // delete(key: K): boolean;
  get(key: K): V;
  has(key: K): boolean;
  set(key: K, value: V): this;
  readonly size: number;
}

export type Hit = {
  index: number,
  timestamp: number,
}

export interface CacheData<R = unknown> {
  subCaches: CacheStore<unknown, this>;
  result: R | null,
  isCached: boolean,
  invalidationTimeoutId: ReturnType<typeof setTimeout> | null,
  hits: Hit[]
}
export type CacheReplacementStrategy<T extends {hits: Hit[]} = {hits: Hit[]}> = {
  (caches: T[]): T[]
}

export type WithMemoConfig = {
  getKey?: (arg: any) => unknown;
  getContextKey?: (arg: any) => unknown;
  getCacheStore?: () => CacheStore;
  ttl?: number;
  cacheRejectedPromise?: boolean;
  cacheReplacementPolicy?: {
    maxSize: number;
    strategy: CacheReplacementStrategy;
  };
  transformArgs?: (args: unknown[]) => unknown[];
};

export type MemoizedFunction<OriginFn extends AnyFunction> = {
  (...args: Parameters<OriginFn>): ReturnType<OriginFn>
  invalidateCache: () => void;
  invalidateCacheByArgs: (...args: Parameters<OriginFn>) => void;
  invalidateCacheByContextAndArgs: (context: unknown, ...args: Parameters<OriginFn>) => void;
}

export type ClassWithMemoizedMethods<Class, methods extends string> = {
  [Key in keyof Class]: Key extends methods ? (Class[Key] extends AnyFunction ? MemoizedFunction<Class[Key]> : never) : Class[Key]
}