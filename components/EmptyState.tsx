import React, { memo } from 'react'
import { Search } from 'lucide-react'

interface EmptyStateProps {
  onResetFilters?: () => void
}

const EmptyState = memo(function EmptyState({ onResetFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card py-20 px-4 shadow-sm">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/5">
        <Search className="h-10 w-10 text-primary/60" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">No creators found</h3>
      <p className="mb-8 max-w-sm text-center text-sm text-muted-foreground leading-relaxed">
        Your search didn't match any creators. Try adjusting your filters or search terms.
      </p>
      {onResetFilters && (
        <button
          onClick={onResetFilters}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95"
        >
          Clear Filters
        </button>
      )}
    </div>
  )
})

export default EmptyState
