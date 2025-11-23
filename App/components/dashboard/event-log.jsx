'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export function EventLog({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Event Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No events available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Event Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Timestamp</th>
                <th className="text-left p-2 font-medium">Water Level (cm)</th>
                <th className="text-left p-2 font-medium">Door State</th>
                <th className="text-left p-2 font-medium">Mode</th>
                <th className="text-left p-2 font-medium">Rain Risk (%)</th>
                <th className="text-left p-2 font-medium">Temp (°C)</th>
                <th className="text-left p-2 font-medium">Humidity (%)</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-muted/50">
                  <td className="p-2">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-2 font-medium">{log.waterLevelCm.toFixed(1)}</td>
                  <td className="p-2">
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-secondary">
                      {log.doorState}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-secondary">
                      {log.mode}
                    </span>
                  </td>
                  <td className="p-2">
                    {(log.pHeavyRainNext24h * 100).toFixed(1)}%
                  </td>
                  <td className="p-2">{log.temperatureC.toFixed(1)}</td>
                  <td className="p-2">{log.humidityPct.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

