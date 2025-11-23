'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { Shield, Clock } from 'lucide-react'

export function ControlPanel({ deviceId = 'esp32-001' }) {
  const { data: session } = useSession()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [lastCommand, setLastCommand] = useState(null)

  const isAdmin = session?.user?.role === 'ADMIN'

  // Fetch last command on mount
  useEffect(() => {
    if (isAdmin) {
      fetchLastCommand()
    }
  }, [isAdmin, deviceId])

  const fetchLastCommand = async () => {
    try {
      const response = await fetch(`/api/control/latest?deviceId=${deviceId}`)
      if (response.ok) {
        const data = await response.json()
        setLastCommand(data)
      }
    } catch (error) {
      console.error('Failed to fetch last command:', error)
    }
  }

  const sendCommand = async (command) => {
    if (!isAdmin) {
      addToast('You do not have permission to send commands', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId,
          command,
        }),
      })

      if (response.ok) {
        addToast(`Command "${command}" sent successfully`, 'success')
        await fetchLastCommand()
      } else {
        const error = await response.json()
        addToast(error.error || 'Failed to send command', 'error')
      }
    } catch (error) {
      addToast('Network error. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You need ADMIN role to control the device.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Control Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => sendCommand('OPEN')}
            disabled={loading}
            variant="default"
            className="flex-1 min-w-[100px]"
          >
            OPEN
          </Button>
          <Button
            onClick={() => sendCommand('CLOSE')}
            disabled={loading}
            variant="default"
            className="flex-1 min-w-[100px]"
          >
            CLOSE
          </Button>
          <Button
            onClick={() => sendCommand('AUTO')}
            disabled={loading}
            variant="outline"
            className="flex-1 min-w-[100px]"
          >
            AUTO
          </Button>
        </div>
        {lastCommand && (
          <div className="pt-4 border-t space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Last command:</span>
              <span className="font-medium">{lastCommand.command}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {lastCommand.createdAt
                ? new Date(lastCommand.createdAt).toLocaleString()
                : 'Unknown'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

