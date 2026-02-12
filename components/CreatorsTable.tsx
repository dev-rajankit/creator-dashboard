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
        className="h-auto gap-1 p-0 font-semibold hover:bg-transparent"
      >
        {label}
        {isActive && (
          isAsc ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )
        )}
      </Button>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/80 hover:bg-transparent">
              <TableHead className="font-semibold h-12">Name</TableHead>
              <TableHead className="text-right font-semibold h-12">
                <SortButton columnKey="followers" label="Followers" />
              </TableHead>
              <TableHead className="text-right font-semibold h-12">
                <SortButton columnKey="revenue" label="Revenue" />
              </TableHead>
              <TableHead className="font-semibold h-12">Status</TableHead>
              <TableHead className="font-semibold h-12">Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {creators.map((creator, idx) => (
              <TableRow 
                key={creator.id}
                className={`h-14 transition-colors duration-200 ${
                  idx % 2 === 0 ? 'bg-background/50' : 'bg-card/50'
                } hover:bg-accent/50 border-b border-border/40`}
              >
                <TableCell className="font-medium text-foreground">{creator.name}</TableCell>
                <TableCell className="text-right text-foreground tabular-nums">
                  {creator.followers.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-foreground tabular-nums">
                  {formatCurrency(creator.revenue)}
                </TableCell>
                <TableCell>
                  {creator.active ? (
                    <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
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
