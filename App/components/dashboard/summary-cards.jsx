'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Droplets, DoorOpen, CloudRain, Thermometer } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SummaryCards({ status }) {
  if (!status) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Water level interpretation: smaller = higher water
  const getWaterLevelColor = (level) => {
    if (level > 40) return 'text-green-600 dark:text-green-400'
    if (level > 20) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getWaterLevelStatus = (level) => {
    if (level > 40) return 'Safe'
    if (level > 20) return 'Warning'
    return 'Critical'
  }

  // Heavy rain probability color
  const getRainRiskColor = (prob) => {
    if (prob < 0.4) return 'text-green-600 dark:text-green-400'
    if (prob < 0.7) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getRainRiskStatus = (prob) => {
    if (prob < 0.4) return 'Low'
    if (prob < 0.7) return 'Medium'
    return 'High'
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Water Level Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Water Level</CardTitle>
          <Droplets className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <span className={cn(getWaterLevelColor(status.waterLevelCm))}>
              {status.waterLevelCm.toFixed(1)} cm
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Status: <span className={cn('font-medium', getWaterLevelColor(status.waterLevelCm))}>
              {getWaterLevelStatus(status.waterLevelCm)}
            </span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Lower = higher water (distance from sensor)
          </p>
        </CardContent>
      </Card>

      {/* Door & Mode Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Door & Mode</CardTitle>
          <DoorOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-1">
            {status.doorState}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">Mode:</span>
            <span className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              status.mode === 'AUTO'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            )}>
              {status.mode}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Heavy Rain Risk Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Heavy Rain Risk (24h)</CardTitle>
          <CloudRain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <span className={cn(getRainRiskColor(status.pHeavyRainNext24h))}>
              {(status.pHeavyRainNext24h * 100).toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Risk: <span className={cn('font-medium', getRainRiskColor(status.pHeavyRainNext24h))}>
              {getRainRiskStatus(status.pHeavyRainNext24h)}
            </span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ML model prediction probability
          </p>
        </CardContent>
      </Card>

      {/* Environment Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Environment</CardTitle>
          <Thermometer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Temperature</span>
              <span className="text-lg font-semibold">{status.temperatureC.toFixed(1)}°C</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Humidity</span>
              <span className="text-lg font-semibold">{status.humidityPct.toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

