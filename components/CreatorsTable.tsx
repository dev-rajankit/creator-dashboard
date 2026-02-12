import React, { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowUp, ArrowDown } from 'lucide-react'
import type { Creator } from '@/lib/creators'

interface CreatorsTableProps {
  creators: Creator[]
  sortKey: 'followers' | 'revenue' | null
  sortDirection: 'asc' | 'desc'
  onSort: (key: 'followers' | 'revenue') => void
}

const CreatorsTable = memo(function CreatorsTable({
  creators,
  sortKey,
  sortDirection,
  onSort,
}: CreatorsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const SortButton = ({ columnKey, label }: { columnKey: 'followers' | 'revenue'; label: string }) => {
    const isActive = sortKey === columnKey
    const isAsc = sortDirection === 'asc'

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSort(columnKey)}
        className="h-auto gap-1.5 p-0 font-semibold hover:bg-transparent hover:text-primary transition-all"
      >
        {label}
        {isActive && (
          <span className="transition-transform duration-200">
            {isAsc ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
          </span>
        )}
      </Button>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-sm bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-semibold h-14">Name</TableHead>
              <TableHead className="text-right font-semibold h-14">
                <div className="flex justify-end">
                  <SortButton columnKey="followers" label="Followers" />
                </div>
              </TableHead>
              <TableHead className="text-right font-semibold h-14">
                <div className="flex justify-end">
                  <SortButton columnKey="revenue" label="Revenue" />
                </div>
              </TableHead>
              <TableHead className="font-semibold h-14">Status</TableHead>
              <TableHead className="font-semibold h-14">Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {creators.map((creator, idx) => (
              <TableRow 
                key={creator.id}
                className={`h-16 transition-all duration-200 cursor-pointer ${
                  idx % 2 === 0 ? 'bg-background/50' : 'bg-card'
                } hover:bg-accent/10 border-b border-border/40 last:border-0`}
              >
                <TableCell className="font-medium text-foreground">{creator.name}</TableCell>
                <TableCell className="text-right text-foreground tabular-nums">
                  {creator.followers.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-foreground tabular-nums font-medium">
                  {formatCurrency(creator.revenue)}
                </TableCell>
                <TableCell>
                  {creator.active ? (
                    <Badge className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25 transition-colors">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="rounded-full border-muted-foreground/30 text-muted-foreground hover:bg-muted/30 transition-colors">
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-foreground text-sm">{creator.createdAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
})

export default CreatorsTable
