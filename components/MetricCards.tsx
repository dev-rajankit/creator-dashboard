import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, DollarSign, BarChart3 } from 'lucide-react'
import type { DerivedMetrics } from '@/lib/creators'

interface MetricCardsProps {
  metrics: DerivedMetrics
}

interface MetricConfig {
  icon: React.ReactNode
  accentColor: string
  gradientFrom: string
  label: string
}

const MetricCards = memo(function MetricCards({ metrics }: MetricCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const metricConfigs: Record<string, MetricConfig> = {
    total: {
      icon: <Users className="h-5 w-5" />,
      accentColor: 'from-blue-500',
      gradientFrom: 'from-blue-500/10',
      label: 'Total Creators',
    },
    active: {
      icon: <TrendingUp className="h-5 w-5" />,
      accentColor: 'from-emerald-500',
      gradientFrom: 'from-emerald-500/10',
      label: 'Active Creators',
    },
    revenue: {
      icon: <DollarSign className="h-5 w-5" />,
      accentColor: 'from-purple-500',
      gradientFrom: 'from-purple-500/10',
      label: 'Total Revenue',
    },
    average: {
      icon: <BarChart3 className="h-5 w-5" />,
      accentColor: 'from-cyan-500',
      gradientFrom: 'from-cyan-500/10',
      label: 'Avg Revenue/Active',
    },
  }

  const MetricCard = ({ 
    config, 
    value 
  }: { 
    config: MetricConfig
    value: string | number
  }) => (
    <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group hover:border-primary/50">
      <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${config.accentColor}`} />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {config.label}
          </CardTitle>
          <div className={`text-muted-foreground group-hover:text-primary transition-colors duration-300`}>
            {config.icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <MetricCard config={metricConfigs.total} value={metrics.totalCreators} />
      <MetricCard config={metricConfigs.active} value={metrics.activeCreators} />
      <MetricCard config={metricConfigs.revenue} value={formatCurrency(metrics.totalRevenue)} />
      <MetricCard config={metricConfigs.average} value={formatCurrency(metrics.avgRevenuePerActive)} />
    </div>
  )
})

export default MetricCards
