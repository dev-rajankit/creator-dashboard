import { describe, it, expect } from 'vitest'
import {
  sortCreators,
  filterCreators,
  applyFiltersAndSort,
  getDerivedMetrics,
  type Creator,
} from './creators'

const testCreators: Creator[] = [
  { id: 1, name: 'Aman', followers: 1200, revenue: 4500, active: true, createdAt: '2025-01-10' },
  { id: 2, name: 'Riya', followers: 540, revenue: 0, active: false, createdAt: '2025-01-12' },
  { id: 3, name: 'Karan', followers: 9800, revenue: 12000, active: true, createdAt: '2025-01-21' },
  { id: 4, name: 'Neha', followers: 9800, revenue: 2000, active: true, createdAt: '2025-02-02' },
]

describe('sortCreators', () => {
  it('should sort by followers ascending', () => {
    const result = sortCreators(testCreators, 'followers', 'asc')
    expect(result[0].name).toBe('Riya')
    expect(result[1].name).toBe('Aman')
    expect(result[2].name).toBe('Karan')
    expect(result[3].name).toBe('Neha')
  })

  it('should sort by followers descending', () => {
    const result = sortCreators(testCreators, 'followers', 'desc')
    expect(result[0].name).toBe('Karan')
    expect(result[1].name).toBe('Neha')
    expect(result[2].name).toBe('Aman')
    expect(result[3].name).toBe('Riya')
  })

  it('should sort by revenue ascending', () => {
    const result = sortCreators(testCreators, 'revenue', 'asc')
    expect(result[0].name).toBe('Riya')
    expect(result[1].name).toBe('Neha')
    expect(result[2].name).toBe('Aman')
    expect(result[3].name).toBe('Karan')
  })

  it('should sort by revenue descending', () => {
    const result = sortCreators(testCreators, 'revenue', 'desc')
    expect(result[0].name).toBe('Karan')
    expect(result[1].name).toBe('Aman')
    expect(result[2].name).toBe('Neha')
    expect(result[3].name).toBe('Riya')
  })

  it('should tie-break by name ascending', () => {
    const result = sortCreators(testCreators, 'followers', 'asc')
    // Karan and Neha both have 9800 followers, should be ordered by name
    const karanIndex = result.findIndex((c) => c.name === 'Karan')
    const nehaIndex = result.findIndex((c) => c.name === 'Neha')
    expect(karanIndex).toBeLessThan(nehaIndex)
  })

  it('should return copy when sortKey is null', () => {
    const result = sortCreators(testCreators, null, 'asc')
    expect(result).toEqual(testCreators)
    expect(result).not.toBe(testCreators)
  })

  it('should not mutate original array', () => {
    const original = JSON.stringify(testCreators)
    sortCreators(testCreators, 'followers', 'asc')
    expect(JSON.stringify(testCreators)).toBe(original)
  })
})

describe('filterCreators', () => {
  it('should filter by search case-insensitive', () => {
    const result = filterCreators(testCreators, 'aman', false)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Aman')
  })

  it('should filter by activeOnly', () => {
    const result = filterCreators(testCreators, '', true)
    expect(result).toHaveLength(3)
    expect(result.every((c) => c.active)).toBe(true)
  })

  it('should combine search and activeOnly with AND', () => {
    const result = filterCreators(testCreators, 'a', true)
    // Active: Aman, Karan, Neha. With 'a': Aman, Karan, Neha
    expect(result).toHaveLength(3)
    expect(result.every((c) => c.active && c.name.toLowerCase().includes('a'))).toBe(true)
  })

  it('should return all when no filters', () => {
    const result = filterCreators(testCreators, '', false)
    expect(result).toHaveLength(4)
  })

  it('should return empty when no match', () => {
    const result = filterCreators(testCreators, 'xyz', false)
    expect(result).toHaveLength(0)
  })

  it('should not mutate original', () => {
    const original = JSON.stringify(testCreators)
    filterCreators(testCreators, 'aman', false)
    expect(JSON.stringify(testCreators)).toBe(original)
  })
})

describe('applyFiltersAndSort', () => {
  it('should filter then sort', () => {
    const result = applyFiltersAndSort(testCreators, '', false, 'followers', 'asc')
    expect(result[0].followers).toBeLessThanOrEqual(result[1].followers)
  })

  it('should combine all filters and sort', () => {
    const result = applyFiltersAndSort(testCreators, 'a', true, 'revenue', 'asc')
    expect(result).toHaveLength(3)
    expect(result[0].name).toBe('Neha')
    expect(result[1].name).toBe('Aman')
    expect(result[2].name).toBe('Karan')
  })

  it('should handle no results', () => {
    const result = applyFiltersAndSort(testCreators, 'xyz', false, 'followers', 'asc')
    expect(result).toHaveLength(0)
  })
})

describe('getDerivedMetrics', () => {
  it('should calculate total creators', () => {
    const metrics = getDerivedMetrics(testCreators)
    expect(metrics.totalCreators).toBe(4)
  })

  it('should count active creators', () => {
    const metrics = getDerivedMetrics(testCreators)
    expect(metrics.activeCreators).toBe(3)
  })

  it('should sum total revenue', () => {
    const metrics = getDerivedMetrics(testCreators)
    expect(metrics.totalRevenue).toBe(18500)
  })

  it('should calculate average revenue per active', () => {
    const metrics = getDerivedMetrics(testCreators)
    expect(metrics.avgRevenuePerActive).toBeCloseTo(6166.67, 1)
  })

  it('should return 0 avg when no active creators', () => {
    const inactive = testCreators.map((c) => ({ ...c, active: false }))
    const metrics = getDerivedMetrics(inactive)
    expect(metrics.avgRevenuePerActive).toBe(0)
  })

  it('should handle empty array', () => {
    const metrics = getDerivedMetrics([])
    expect(metrics.totalCreators).toBe(0)
    expect(metrics.activeCreators).toBe(0)
    expect(metrics.totalRevenue).toBe(0)
    expect(metrics.avgRevenuePerActive).toBe(0)
  })
})
