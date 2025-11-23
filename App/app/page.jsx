'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { Charts } from '@/components/dashboard/charts'
import { ControlPanel } from '@/components/dashboard/control-panel'
import { EventLog } from '@/components/dashboard/event-log'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle } from 'lucide-react'

export default function DashboardPage() {
  const [status, setStatus] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deviceId] = useState('esp32-001')
  const [isOffline, setIsOffline] = useState(false)

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/status/latest?deviceId=${deviceId}`)
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
        setIsOffline(false)
        setError(null)
        
        // Check if device is offline (no status in last 60 seconds)
        const statusAge = Date.now() - new Date(data.timestamp).getTime()
        setIsOffline(statusAge > 60000)
      } else if (response.status === 404) {
        setStatus(null)
        setIsOffline(true)
      } else {
        throw new Error('Failed to fetch status')
      }
    } catch (err) {
      setError(err.message)
      setIsOffline(true)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/logs?deviceId=${deviceId}&limit=50`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err)
    }
  }

  useEffect(() => {
    fetchStatus()
    fetchLogs()

    // Poll for status updates every 5 seconds
    const interval = setInterval(() => {
      fetchStatus()
    }, 5000)

    // Refresh logs every 30 seconds
    const logsInterval = setInterval(() => {
      fetchLogs()
    }, 30000)

    return () => {
      clearInterval(interval)
      clearInterval(logsInterval)
    }
  }, [deviceId])

  const handleRefresh = () => {
    setLoading(true)
    fetchStatus()
    fetchLogs()
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Smart Flood Barrier Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Real-time monitoring and control system for IoT flood barrier
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            size="icon"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Device Offline Warning */}
        {isOffline && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20 p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Device Offline
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                No status updates received in the last 60 seconds. The device may be disconnected.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              Error: {error}
            </p>
          </div>
        )}

        {/* Summary Cards */}
        <SummaryCards status={status} />

        {/* Charts */}
        <Charts logs={logs} />

        {/* Control Panel and Event Log */}
        <div className="grid gap-4 md:grid-cols-2">
          <ControlPanel deviceId={deviceId} />
          <EventLog logs={logs.slice(0, 10)} />
        </div>
      </div>
    </DashboardLayout>
  )
}

