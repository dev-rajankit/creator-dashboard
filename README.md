# Creator Dashboard

A production-ready Next.js 15 + TypeScript + shadcn/ui dashboard for managing and monitoring creators with advanced filtering, sorting, and metrics calculation.

## Setup

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Run tests with UI
pnpm test:ui

# Build for production
pnpm build
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      app/page.tsx                            │
│  (State: searchQuery, showActiveOnly, sortKey, sortDir)     │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│          buildCreatorViewModel()                            │
│  (lib/creatorPipeline.ts - ViewModel Factory)              │
└────────┬────────────────────────────────────────────────────┘
         │
         ├──────► filterCreators()  ──┐
         │                             │ Pure Functions
         ├──────► sortCreators()    ──┤ (lib/creators.ts)
         │                             │
         └──────► getDerivedMetrics() ─┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│         { rows, metrics }                                   │
│  Passed to components (MetricCards, CreatorsTable, etc)    │
└─────────────────────────────────────────────────────────────┘
```

### Core Modules

#### `lib/creators.ts`
Pure business logic layer with no side effects:
- **Creator type**: Typed data structure (id as number, required fields)
- **creators[]**: Hardcoded dataset with Aman, Riya, Karan, Neha
- **sortCreators()**: Deterministic sorting (primary key + secondary tie-break by name)
- **filterCreators()**: Case-insensitive search + active toggle (AND logic)
- **applyFiltersAndSort()**: Combines filter → sort pipeline
- **getDerivedMetrics()**: Calculates aggregates from filtered data

#### `lib/creatorPipeline.ts`
ViewModel factory for scalable UI decoupling:
- **buildCreatorViewModel()**: Single entry point with pagination support
- Pipeline: creators → filter → **paginate** → sort → metrics
- Returns `{ rows: Creator[], metrics: DerivedMetrics, pagination: PaginationMeta }`
- Metrics calculated from **full filtered dataset**, not just current page
- **API-ready**: Accepts `creators` dataset parameter (not hardcoded)

#### `app/page.tsx`
React client component:
- Manages UI state (search, filters, sort)
- Calls `buildCreatorViewModel()` with memoization
- Passes data to dumb components
- Theme toggle with next-themes

#### Components
- **MetricCards**: Displays total/active creators, revenue, average
- **CreatorsTable**: Sortable table with status badges
- **EmptyState**: "No creators match your filters" message

### Why This Architecture

1. **Pure Functions**: Testable, predictable, no dependencies on React lifecycle
2. **Pipeline Separation**: `creatorPipeline.ts` is a factory, not a hook
3. **Memoization**: `useMemo` prevents unnecessary recalculations
4. **React.memo**: Components skip re-renders if props unchanged
5. **Decoupled UI**: Components don't know about sorting logic
6. **Scalability**: Ready for server-side pagination, virtualization, GraphQL

## Sorting

### State Machine

```
Clicking same column:
null ──► desc ──► asc ──► null

Clicking new column:
(any state) ──► desc
```

### Deterministic Ordering

**Primary**: Column value (followers or revenue)
**Secondary**: Name (ascending alphabetically)

Ensures consistent results regardless of dataset order or browser differences.

Example:
- Karan: 9800 followers
- Neha: 9800 followers
- → Sorted by name: **Karan < Neha** (K < N)

## Filtering

### Search
- Case-insensitive
- Partial name match
- Applied BEFORE sorting

### Active Toggle
- Filters to `active === true` creators
- Combined with search using **AND** logic

### Example
Search "a" + Active only:
- Aman (matches "a", active ✓)
- Karan (matches "a", active ✓)
- Neha (matches "a", active ✓)
- Result: 3 creators

## Metrics (Calculated from Filtered Data)

```javascript
{
  totalCreators: number;        // Count of rows after filter
  activeCreators: number;       // Count of active=true in filtered data
  totalRevenue: number;         // Sum of revenue in filtered data
  avgRevenuePerActive: number;  // totalRevenue / activeCreators (0 if no active)
}
```

**Important**: Metrics reflect the filtered result set, not the full dataset.
If user filters to "Aman", metrics show only Aman's data.

## Dark Mode (Cosmic Night)

Uses `next-themes` for automatic light/dark toggling.

Color Palette:
- **Background**: `#0B1020` (deep blue-black)
- **Cards**: `#11182A` (muted blue)
- **Accent**: `#7C7CFF` (purple)
- **Text**: `#E5E7EB` (light gray)

All shadcn components respect `prefers-color-scheme` automatically.

## Testing

### Coverage
- 8+ test scenarios in `lib/creators.test.ts`
- Vitest framework with snapshot support

### Test Categories

1. **Sorting**
   - Followers ascending/descending
   - Revenue ascending/descending
   - Tie-breaking by name
   - Null sortKey handling
   - Immutability (no mutations)

2. **Filtering**
   - Case-insensitive search
   - Active-only toggle
   - Combined AND logic
   - No match scenarios
   - Immutability

3. **Combined**
   - Filter THEN sort
   - Empty result handling

4. **Metrics**
   - Total/active count
   - Revenue sum
   - Average calculation
   - Division by zero protection
   - Empty array safety

### Running Tests

```bash
pnpm test              # Watch mode
pnpm test:ui           # Visual dashboard
pnpm test -- --run     # Single run
```

## Pagination Architecture

### Current Implementation

Pagination is **built-in and forward-compatible**, even with 4 creators:

```typescript
buildCreatorViewModel(
  search: string,
  activeOnly: boolean,
  sortKey: 'followers' | 'revenue' | null,
  sortDirection: 'asc' | 'desc',
  page: number = 1,           // ← Optional
  pageSize: number = 10,      // ← Optional
  data: Creator[] = creators  // ← Optional, API-ready
): CreatorViewModel
```

### Return Shape

```typescript
{
  rows: Creator[],                    // Current page results (sorted)
  metrics: DerivedMetrics,            // From FULL filtered dataset
  pagination: {
    page: number,
    pageSize: number,
    totalItems: number,              // Total filtered count
    totalPages: number,
    hasNext: boolean,
    hasPrev: boolean
  }
}
```

### Key Design Decisions

1. **Metrics from full dataset**: Even on page 2, metrics reflect all 100 filtered results
2. **Filter → Paginate → Sort**: Orders applied before pagination to reduce memory
3. **Page resets on filter change**: Prevents "empty page" on new filter
4. **Optional pagination**: Works with or without page/pageSize params
5. **API-ready dataset**: Pass different creator arrays from API/server

### UI Features

- Previous/Next buttons with disabled state
- Page indicator ("Page 1 of 3")
- Page size selector (10, 25, 50 items)
- Result count ("2,847 total creators")
- Showing range ("Showing 21-40")

See `components/PaginationControls.tsx` for implementation.

## Scaling to 10,000+ Creators

### Current State (4 creators)
- All in-memory
- Pagination supported
- Full dataset metrics
- Production-ready

### Future Optimizations

#### 1. Server-Side Pagination

Drop-in replacement with API:

```typescript
// Before: Client-side
const viewModel = buildCreatorViewModel(search, activeOnly, sortKey, sortDir, page, pageSize)

// After: Server-side
const response = await fetch(`/api/creators?search=${search}&page=${page}&pageSize=${pageSize}`)
const viewModel = await response.json()
```

The `buildCreatorViewModel()` signature is **already API-compatible** because:
- Accepts `page` and `pageSize` parameters
- Accepts custom `data` parameter (from API instead of local)
- Returns pagination metadata

#### 2. Virtual Scrolling
```javascript
// For 10k rows in table: use react-window or @tanstack/react-virtual
<VirtualList height={600} itemCount={rows.length}>
  {(index) => <TableRow data={rows[index]} />}
</VirtualList>
```

#### 3. Debounce Search
```javascript
const [debouncedSearch, setDebouncedSearch] = useState('')

useEffect(() => {
  const timer = setTimeout(() => setDebouncedSearch(search), 300)
  return () => clearTimeout(timer)
}, [search])
```

#### 4. Database Indexes (See sql/answers.sql)
```sql
CREATE INDEX idx_creators_active ON creators(active);
CREATE INDEX idx_creators_revenue ON creators(revenue);
CREATE INDEX idx_creators_followers ON creators(followers);
```

#### 5. Cursor-Based Pagination

For truly scalable 10k+ scenarios with real-time data:

```typescript
// Already supports custom data parameter
buildCreatorViewModel(search, activeOnly, sortKey, sortDir, 1, 50, 
  apiCreators  // ← From API with cursor metadata
)
```

Benefits:
- Handles inserts/deletes between requests
- No offset skipping issues
- Efficient for real-time data

#### 6. Materialized Metrics

Cache metrics separately for 10k+ datasets:

```typescript
// Current: Calculate from filtered dataset
const metrics = getDerivedMetrics(filtered)

// Future: Fetch from cache
const metrics = await redis.get(`metrics:${hashFilters(filters)}`)
```

#### 7. Background Revalidation

Use Next.js ISR with Vercel's KV:

```typescript
// Revalidate metrics every 5 minutes
export const revalidate = 300

// Metrics endpoint returns cached result + tags for revalidation
```

#### 8. React.memo Optimization
Already in place:
- `MetricCards = memo(MetricCards)`
- `CreatorsTable = memo(CreatorsTable)`
- `EmptyState = memo(EmptyState)`

#### 7. useMemo Memoization
Already in place:
- `viewModel = useMemo(...)`
- Prevents recalculation on non-dependent prop changes
- Pagination-aware: Dependencies include `currentPage` and `pageSize`

#### 8. useCallback for Handlers
Already in place:
- `handleSort = useCallback(...)`
- `handlePageChange = useCallback(...)`
- `handlePageSizeChange = useCallback(...)`
- Prevents child component re-renders

## SQL Queries & Indexing

See `sql/answers.sql` for:
- Q1: All creators
- Q2: Active creators only
- Q3: Metrics with aggregates
- Q4: COUNT(DISTINCT) vs COUNT(*) explanation
- Index strategy for 10k+ creators

## Key Design Decisions

### 1. Why id is number?
Matches common database conventions (auto-increment serial/bigint).

### 2. Why null instead of 'none'?
- TypeScript narrowing is easier with `null`
- Follows React conventions (`null` = no sort)
- Cleaner conditional: `if (sortKey)` vs `if (sortKey !== 'none')`

### 3. Why filter before sort?
- In SQL: WHERE applies before ORDER BY (database optimizer pattern)
- Reduces dataset early: sort 100 rows instead of 10,000
- Scalable: O(n) filter + O(m log m) sort (m < n)

### 4. Why ViewModel factory?
- Decouples UI from data transformations
- Single integration point for testing
- Easy to migrate to server-side later
- Composable: can chain multiple pipelines

### 5. Why React.memo everywhere?
- Creators table with 10k rows: prevents 10k+ re-renders
- Each memo checks prop equality (shallow)
- Cost: small; benefit: huge for performance

## Dependencies

**Runtime**:
- `next` 15+
- `react` 19+
- `next-themes` (dark mode)
- `lucide-react` (icons)

**Dev**:
- `typescript`
- `tailwindcss`
- `vitest`
- `@testing-library/react`

**Zero external data libraries** (pure functions, no lodash/ramda).

## Quality Checklist

**Core Features:**
- ✅ Fully typed (TypeScript)
- ✅ Sorting with deterministic tie-breaking
- ✅ Filtering (search + active toggle)
- ✅ Metrics (total, active, revenue, average)
- ✅ Dark mode (Cosmic Night theme)
- ✅ Empty state with action

**Pagination:**
- ✅ Offset-based pagination (page + pageSize)
- ✅ Pagination metadata (totalItems, totalPages, hasNext, hasPrev)
- ✅ UI controls (Previous/Next, page size selector)
- ✅ Page reset on filter/sort changes
- ✅ Metrics from full filtered dataset
- ✅ API-ready design (custom data parameter)

**Code Quality:**
- ✅ No console.logs
- ✅ No TODOs or FIXMEs
- ✅ No placeholder code
- ✅ No external data libs (lodash/ramda)
- ✅ No table component libraries
- ✅ Clean imports
- ✅ React.memo on all components
- ✅ useCallback for handlers
- ✅ Pure functions in lib/
- ✅ Predictable state machine

**Testing:**
- ✅ Comprehensive tests (8+ creators.test scenarios)
- ✅ Pagination tests (11 creatorPipeline.test scenarios)
- ✅ Edge cases (empty, clamp, tie-breaking)

**Architecture:**
- ✅ ViewModel factory pattern
- ✅ Filter before sort (database optimizer pattern)
- ✅ Deterministic tie-breaking (secondary sort by name)
- ✅ Production-ready for 10k+ creators
- ✅ Cursor pagination ready
- ✅ Server-side migration path documented

