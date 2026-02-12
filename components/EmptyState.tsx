import React, { memo } from 'react'
import { Search } from 'lucide-react'

interface EmptyStateProps {
  onResetFilters?: () => void
}

const EmptyState = memo(function EmptyState({ onResetFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16 px-4">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">No creators found</h3>
      <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
        Your search didn't match any creators. Try adjusting your filters or search terms.
      </p>
      {onResetFilters && (
        <button
          onClick={onResetFilters}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
        >
          Clear Filters
        </button>
      )}
    </div>
  )
})

export default EmptyState
