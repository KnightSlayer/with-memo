import { describe, it, expect } from 'vitest'
import { lru } from './lru'

describe('cacheReplacementStrategies: LRU', () => {
  it('should handle empty set', () => {
    expect(lru([])).toEqual([])
  })

  it('should return least recently used', () => {
    const item1 = {
      id: 1,
      hits: [{
        index: 2,
        timestamp: 2,
      }, {
        index: 4,
        timestamp: 4,
      }]
    };
    const item2 = {
      id: 2,
      hits: [{
        index: 1,
        timestamp: 1,
      }, {
        index: 3,
        timestamp: 3,
      }]
    }
    const item3 = {
      id: 3,
      hits: [{
        index: 5,
        timestamp: 5,
      }, {
        index: 6,
        timestamp: 6,
      }]
    }
    const item4 = {
      id: 4,
      hits: [{
        index: 7,
        timestamp: 7,
      }]
    }

    const res = lru([item1, item2, item3, item4])
    expect(res.length).toBe(1)
    expect(res[0]).toBe(item2)
  })
})