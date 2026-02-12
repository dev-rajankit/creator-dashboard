'use client'

import { useState, useMemo, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { buildCreatorViewModel } from '@/lib/creatorPipeline'
import MetricCards from '@/components/MetricCards'
import CreatorsTable from '@/components/CreatorsTable'
import EmptyState from '@/components/EmptyState'
import PaginationControls from '@/components/PaginationControls'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sun, Moon, LayoutDashboard, X } from 'lucide-react'

export default function Home() {
  const { theme, setTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [sortKey, setSortKey] = useState<'followers' | 'revenue' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const viewModel = useMemo(() => {
    return buildCreatorViewModel(searchQuery, showActiveOnly, sortKey, sortDirection, currentPage, pageSize)
  }, [searchQuery, showActiveOnly, sortKey, sortDirection, currentPage, pageSize])

  const handleSort = useCallback((key: 'followers' | 'revenue') => {
    if (sortKey === key) {
      // Toggle: desc → asc → null
      if (sortDirection === 'desc') {
        setSortDirection('asc')
      } else {
        setSortKey(null)
        setSortDirection('desc')
      }
    } else {
      // New column, default to desc
      setSortKey(key)
      setSortDirection('desc')
    }
    // Reset to page 1 when sorting changes
    setCurrentPage(1)
  }, [sortKey, sortDirection])

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    // Reset to page 1 when search changes
    setCurrentPage(1)
  }, [])

  const handleActiveOnlyChange = useCallback((checked: boolean) => {
    setShowActiveOnly(checked)
    // Reset to page 1 when filter changes
    setCurrentPage(1)
  }, [])

  const handleResetFilters = useCallback(() => {
    setSearchQuery('')
    setShowActiveOnly(false)
    setSortKey(null)
    setSortDirection('desc')
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    // Reset to page 1 when page size changes
    setCurrentPage(1)
  }, [])

  const hasActiveFilters = searchQuery || showActiveOnly || sortKey

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <LayoutDashboard className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">Creator Dashboard</h1>
              <p className="mt-2 text-base text-muted-foreground">Manage and monitor your creators with real-time insights</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-lg border border-border hover:bg-accent"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Metric Cards */}
        <MetricCards metrics={viewModel.metrics} />

        {/* Filters Section */}
        <div className="mb-8">
          <div className="rounded-lg border border-border bg-card shadow-sm p-6">
            <div className="space-y-5">
              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Search Creators
                </label>
                <Input
                  placeholder="Find by name..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full h-10"
                />
              </div>

              {/* Divider */}
              <div className="h-px bg-border/50" />

              {/* Active Filter */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">Active Creators Only</label>
                <Switch
                  checked={showActiveOnly}
                  onCheckedChange={handleActiveOnlyChange}
                />
              </div>

              {/* Sort Status & Reset */}
              {hasActiveFilters && (
                <>
                  <div className="h-px bg-border/50" />
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      {sortKey && (
                        <Badge variant="secondary" className="gap-1">
                          {sortKey} {sortDirection === 'asc' ? '↑' : '↓'}
                        </Badge>
                      )}
                      {searchQuery && (
                        <Badge variant="secondary" className="gap-1">
                          Search: "{searchQuery}"
                        </Badge>
                      )}
                      {showActiveOnly && (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetFilters}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Table or Empty State */}
        <div className="space-y-4">
          {viewModel.rows.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {viewModel.pagination.totalItems} Creator{viewModel.pagination.totalItems !== 1 ? 's' : ''} Found
                </div>
                {viewModel.pagination.totalPages > 1 && (
                  <div className="text-xs font-medium text-muted-foreground">
                    Showing {Math.min((viewModel.pagination.page - 1) * viewModel.pagination.pageSize + 1, viewModel.pagination.totalItems)}-{Math.min(viewModel.pagination.page * viewModel.pagination.pageSize, viewModel.pagination.totalItems)}
                  </div>
                )}
              </div>
              <CreatorsTable
                creators={viewModel.rows}
                onSort={handleSort}
                sortKey={sortKey}
                sortDirection={sortDirection}
              />
              {viewModel.pagination.totalPages > 1 && (
                <PaginationControls
                  pagination={viewModel.pagination}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              )}
            </>
          ) : (
            <EmptyState onResetFilters={handleResetFilters} />
          )}
        </div>
      </div>
    </main>
  )
}
