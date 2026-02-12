import React, { memo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginationMeta } from '@/lib/creatorPipeline'

interface PaginationControlsProps {
  pagination: PaginationMeta
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const PAGE_SIZE_OPTIONS = [10, 25, 50]

const PaginationControls = memo(function PaginationControls({
  pagination,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const handlePrevious = useCallback(() => {
    if (pagination.hasPrev) {
      onPageChange(pagination.page - 1)
    }
  }, [pagination.page, pagination.hasPrev, onPageChange])

  const handleNext = useCallback(() => {
    if (pagination.hasNext) {
      onPageChange(pagination.page + 1)
    }
  }, [pagination.page, pagination.hasNext, onPageChange])

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      {/* Left: Page info */}
      <div className="text-sm text-muted-foreground">
        Page <span className="font-semibold text-foreground">{pagination.page}</span> of{' '}
        <span className="font-semibold text-foreground">{pagination.totalPages || 1}</span>
        {pagination.totalItems > 0 && (
          <>
            {' '}
            • <span className="font-semibold text-foreground">{pagination.totalItems}</span> total
          </>
        )}
      </div>

      {/* Center: Previous/Next buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={!pagination.hasPrev}
          className="gap-1 rounded-xl transition-all hover:bg-primary/10 hover:border-primary/50"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!pagination.hasNext}
          className="gap-1 rounded-xl transition-all hover:bg-primary/10 hover:border-primary/50"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Right: Page size selector */}
      <Select value={pagination.pageSize.toString()} onValueChange={(val) => onPageSizeChange(parseInt(val, 10))}>
        <SelectTrigger className="w-32 rounded-xl">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {PAGE_SIZE_OPTIONS.map((size) => (
            <SelectItem key={size} value={size.toString()}>
              {size} per page
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
})

export default PaginationControls
