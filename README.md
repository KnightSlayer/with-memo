# High Order Function withMemo
This library is result of this article: --link--

| Option                  | Default value   | Description                                                                                                            |
|-------------------------|-----------------|------------------------------------------------------------------------------------------------------------------------|
| getKey                  | (arg) => arg    | Specifies how the arguments will be compared with each other.                                                          |
| getContextKey           | undefined       | Same as getKey but for context. If doesn't provided then context ignored.                                              |
| getCacheStore           | () => new Map() | The function should return an object with the same interface as Map. This structure will store the cache in tree form. |
| cacheRejectedPromise    | false           | If `false` then rejected promises will not be cached.                                                                  |
| ttl                     | undefined       | Must be a number of milliseconds. If specified, it will clear the cache after that time.                               |
| transformArgs           | (args) => args  | You can apply any transformation to arguments array before handling.                                                   |
| cacheReplacementPolicy  | undefined       | You can limit the number of cache entries. See examples.                                                               |
