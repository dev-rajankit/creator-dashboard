import { describe, it, expect } from 'vitest'
import { buildCreatorViewModel, type CreatorViewModel } from './creatorPipeline'
import type { Creator } from './creators'

const testCreators: Creator[] = [
  { id: 1, name: 'Aman', followers: 1200, revenue: 4500, active: true, createdAt: '2025-01-10' },
  { id: 2, name: 'Riya', followers: 540, revenue: 0, active: false, createdAt: '2025-01-12' },
  { id: 3, name: 'Karan', followers: 9800, revenue: 12000, active: true, createdAt: '2025-01-21' },
  { id: 4, name: 'Neha', followers: 9800, revenue: 2000, active: true, createdAt: '2025-02-02' },
]

describe('buildCreatorViewModel with pagination', () => {
  it('should return default pagination when no pagination params provided', () => {
    const vm = buildCreatorViewModel('', false, null, 'desc', undefined, undefined, testCreators)
    expect(vm.pagination).toEqual({
      page: 1,
      pageSize: 10,
      totalItems: 4,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    })
  })

  it('should paginate correctly with custom page size', () => {
    const vm = buildCreatorViewModel('', false, null, 'desc', 1, 2, testCreators)
    expect(vm.rows).toHaveLength(2)
    expect(vm.pagination).toEqual({
      page: 1,
      pageSize: 2,
      totalItems: 4,
      totalPages: 2,
      hasNext: true,
      hasPrev: false,
    })
  })

  it('should return second page correctly', () => {
    const vm = buildCreatorViewModel('', false, null, 'desc', 2, 2, testCreators)
    expect(vm.rows).toHaveLength(2)
    expect(vm.pagination.page).toBe(2)
    expect(vm.pagination.hasNext).toBe(false)
    expect(vm.pagination.hasPrev).toBe(true)
  })

  it('should clamp page to valid range', () => {
    const vm = buildCreatorViewModel('', false, null, 'desc', 100, 2, testCreators)
    expect(vm.pagination.page).toBe(2)
  })

  it('should clamp page to 1 when empty', () => {
    const vm = buildCreatorViewModel('x', false, null, 'desc', 1, 10, testCreators)
    expect(vm.pagination.page).toBe(1)
    expect(vm.pagination.totalPages).toBe(0)
  })

  it('should calculate metrics from FULL filtered dataset, not just current page', () => {
    const vm = buildCreatorViewModel('', false, null, 'desc', 1, 1, testCreators)
    // Only 1 row displayed (page 1 of 4 with size 1)
    expect(vm.rows).toHaveLength(1)
    // But metrics should reflect all 4 creators
    expect(vm.metrics.totalCreators).toBe(4)
    expect(vm.metrics.activeCreators).toBe(3)
  })

  it('should maintain sort order within paginated slice', () => {
    const vm = buildCreatorViewModel('', false, 'followers', 'asc', 1, 2, testCreators)
    // First page should have the 2 creators with lowest followers
    expect(vm.rows[0].name).toBe('Riya')
    expect(vm.rows[1].name).toBe('Aman')
  })

  it('should filter before pagination', () => {
    const vm = buildCreatorViewModel('', true, null, 'desc', 1, 10, testCreators)
    // Only 3 active creators should be counted
    expect(vm.pagination.totalItems).toBe(3)
    expect(vm.metrics.activeCreators).toBe(3)
  })

  it('should support custom dataset parameter', () => {
    const customCreators: Creator[] = [
      { id: 10, name: 'Custom1', followers: 100, revenue: 1000, active: true, createdAt: '2025-01-01' },
      { id: 11, name: 'Custom2', followers: 200, revenue: 2000, active: true, createdAt: '2025-01-02' },
    ]
    const vm = buildCreatorViewModel('', false, null, 'desc', 1, 10, customCreators)
    expect(vm.pagination.totalItems).toBe(2)
    expect(vm.rows).toHaveLength(2)
  })

  it('should handle edge case with pageSize larger than total items', () => {
    const vm = buildCreatorViewModel('', false, null, 'desc', 1, 100, testCreators)
    expect(vm.rows).toHaveLength(4)
    expect(vm.pagination.totalPages).toBe(1)
    expect(vm.pagination.hasNext).toBe(false)
  })
})
