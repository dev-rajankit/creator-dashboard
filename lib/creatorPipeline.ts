import {
  creators as defaultCreators,
  filterCreators,
  sortCreators,
  getDerivedMetrics,
  type Creator,
  type DerivedMetrics,
} from './creators'

export interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface CreatorViewModel {
  rows: Creator[]
  metrics: DerivedMetrics
  pagination: PaginationMeta
}

/**
 * Pipeline: creators → filter → sort → paginate → metrics
 *
 * Correct Order of Operations:
 *
 * 1. Filter   (reduce dataset early)
 * 2. Sort     (global deterministic ordering)
 * 3. Paginate (slice sorted results)
 * 4. Metrics  (calculated from FULL filtered dataset)
 *
 * IMPORTANT:
 * Sorting MUST happen BEFORE pagination to ensure consistent
 * ordering across pages. Otherwise each page would be sorted
 * independently, which breaks global ordering.
 *
 * Metrics are intentionally calculated from the FULL filtered dataset
 * (not just current page) so summary cards always reflect reality.
 *
 * @param search - Case-insensitive partial name match
 * @param activeOnly - Filter to active creators only
 * @param sortKey - Column to sort by ('followers' | 'revenue' | null)
 * @param sortDirection - Sort direction ('asc' | 'desc')
 * @param page - Current page (1-indexed, default 1)
 * @param pageSize - Items per page (default 10)
 * @param data - Creator dataset (default: static creators, future API-ready)
 */
export function buildCreatorViewModel(
  search: string,
  activeOnly: boolean,
  sortKey: 'followers' | 'revenue' | null,
  sortDirection: 'asc' | 'desc',
  page: number = 1,
  pageSize: number = 10,
  data: Creator[] = defaultCreators // In future, this can be replaced with API data fetching-- Dependency Injection for flexibility and testability
): CreatorViewModel {
  /**
   * STEP 1 — Filter
   * Apply search + activeOnly.
   * Reduces dataset as early as possible.
   */
  const filtered = filterCreators(data, search, activeOnly)

  /**
   * STEP 2 — Sort (GLOBAL)
   * Sorting is applied to the FULL filtered dataset.
   * This guarantees stable ordering across pages.
   */
  const sorted = sortCreators(filtered, sortKey, sortDirection)

  /**
   * STEP 3 — Pagination metadata
   */
  const totalItems = sorted.length
  const totalPages = Math.ceil(totalItems / pageSize)

  // Clamp page within valid bounds
  const validPage = Math.max(1, Math.min(page, totalPages || 1))

  const startIdx = (validPage - 1) * pageSize
  const endIdx = startIdx + pageSize

  /**
   * STEP 4 — Paginate
   * Slice AFTER sorting.
   */
  const paginated = sorted.slice(startIdx, endIdx)

  /**
   * STEP 5 — Metrics
   * Metrics are calculated from FULL filtered dataset,
   * not just paginated slice.
   */
  const metrics = getDerivedMetrics(filtered)

  const pagination: PaginationMeta = {
    page: validPage,
    pageSize,
    totalItems,
    totalPages,
    hasNext: validPage < totalPages,
    hasPrev: validPage > 1,
  }

  return {
    rows: paginated,
    metrics,
    pagination,
  }
}
