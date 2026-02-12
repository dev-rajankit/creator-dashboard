import { creators as defaultCreators, filterCreators, sortCreators, getDerivedMetrics, type Creator, type DerivedMetrics } from './creators';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CreatorViewModel {
  rows: Creator[];
  metrics: DerivedMetrics;
  pagination: PaginationMeta;
}

/**
 * Pipeline: creators → filter → paginate → sort → metrics
 * 
 * Order of operations:
 * 1. Filter (by search & activeOnly)
 * 2. Paginate (slice the filtered results)
 * 3. Sort (sort the paginated slice)
 * 4. Metrics (calculated from FULL filtered dataset, not just current page)
 * 
 * This ensures metrics always reflect the complete filtered dataset while only
 * displaying and sorting the current page of results.
 * 
 * @param search - Case-insensitive partial name match
 * @param activeOnly - Filter to active creators only
 * @param sortKey - Column to sort by ('followers' | 'revenue' | null)
 * @param sortDirection - Sort direction ('asc' | 'desc')
 * @param page - Current page (1-indexed, default 1)
 * @param pageSize - Items per page (default 10)
 * @param data - Creator dataset (default: static creators, for API readiness)
 * @returns ViewModel with paginated rows, full-dataset metrics, and pagination meta
 */
export function buildCreatorViewModel(
  search: string,
  activeOnly: boolean,
  sortKey: 'followers' | 'revenue' | null,
  sortDirection: 'asc' | 'desc',
  page: number = 1,
  pageSize: number = 10,
  data: Creator[] = defaultCreators
): CreatorViewModel {
  // Step 1: Filter
  const filtered = filterCreators(data, search, activeOnly);

  // Step 2: Calculate pagination metadata
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const validPage = Math.max(1, Math.min(page, totalPages || 1));
  const startIdx = (validPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;

  // Step 3: Paginate (slice the filtered results)
  const paginated = filtered.slice(startIdx, endIdx);

  // Step 4: Sort the paginated slice
  const sorted = sortCreators(paginated, sortKey, sortDirection);

  // Step 5: Calculate metrics from FULL filtered dataset (not just current page)
  const metrics = getDerivedMetrics(filtered);

  // Pagination metadata
  const pagination: PaginationMeta = {
    page: validPage,
    pageSize,
    totalItems,
    totalPages,
    hasNext: validPage < totalPages,
    hasPrev: validPage > 1,
  };

  return {
    rows: sorted,
    metrics,
    pagination,
  };
}
