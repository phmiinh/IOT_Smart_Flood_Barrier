'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export function Charts({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Water Level Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Heavy Rain Probability Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Prepare data for charts (reverse to show chronological order)
  const chartData = [...logs].reverse().map((log) => ({
    time: new Date(log.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    waterLevel: log.waterLevelCm,
    rainProbability: log.pHeavyRainNext24h * 100,
    fullTime: log.timestamp,
  }))

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Water Level Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Water Level Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                label={{ value: 'Water Level (cm)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <p className="text-sm font-medium">
                          {payload[0].payload.fullTime
                            ? new Date(payload[0].payload.fullTime).toLocaleString()
                            : ''}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Water Level: {payload[0].value?.toFixed(1)} cm
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Lower = higher water
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line
                type="monotone"
                dataKey="waterLevel"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Water Level (cm)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Heavy Rain Probability Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Heavy Rain Probability Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <p className="text-sm font-medium">
                          {payload[0].payload.fullTime
                            ? new Date(payload[0].payload.fullTime).toLocaleString()
                            : ''}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Probability: {payload[0].value?.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          ML model prediction for next 24h
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line
                type="monotone"
                dataKey="rainProbability"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Heavy Rain Probability (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

