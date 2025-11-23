'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { EventLog } from '@/components/dashboard/event-log'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function LogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [deviceId] = useState('esp32-001')

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/logs?deviceId=${deviceId}&limit=100`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [deviceId])

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Event Logs</h1>
            <p className="text-muted-foreground mt-1">
              Historical device status records
            </p>
          </div>
          <Button
            onClick={fetchLogs}
            disabled={loading}
            variant="outline"
            size="icon"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground">Loading logs...</p>
          </div>
        ) : (
          <EventLog logs={logs} />
        )}
      </div>
    </DashboardLayout>
  )
}

