import { useState } from 'react'
import { Settings as SettingsIcon, Key, Database, Bell, User, Save, RefreshCw, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export function Settings() {
  const [apiKey, setApiKey] = useState('')
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncResult, setLastSyncResult] = useState(null)
  const [syncSettings, setSyncSettings] = useState({
    autoSync: false,
    syncTime: '06:00',
  })
  const [notifications, setNotifications] = useState({
    urgentDeadlines: true,
    weeklyDigest: true,
    ttabUpdates: true,
  })

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch('/api/sync-uspto')
      const result = await response.json()
      setLastSyncResult(result)
    } catch (error) {
      setLastSyncResult({ error: error.message })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure MarkFlow settings and integrations
        </p>
      </div>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Configuration
          </CardTitle>
          <CardDescription>
            Connect to USPTO Open Data Portal and Supabase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">USPTO API Key</label>
            <Input
              type="password"
              placeholder="Enter your USPTO API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a
                href="https://developer.uspto.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                developer.uspto.gov
              </a>
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <label className="text-sm font-medium">Supabase URL</label>
            <Input
              type="url"
              placeholder="https://your-project.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Supabase Anon Key</label>
            <Input type="password" placeholder="Enter your Supabase anon key" />
          </div>

          <div className="flex items-center justify-between pt-4">
            <Badge variant="secondary">
              <Database className="mr-1 h-3 w-3" />
              Using Mock Data
            </Badge>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* USPTO Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            USPTO Auto-Sync
          </CardTitle>
          <CardDescription>
            Automatically sync trademark data from USPTO daily
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Daily Sync</p>
              <p className="text-sm text-muted-foreground">
                Automatically refresh all marks from USPTO each day
              </p>
            </div>
            <Switch
              checked={syncSettings.autoSync}
              onCheckedChange={(checked) =>
                setSyncSettings({ ...syncSettings, autoSync: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sync Time (UTC)</p>
              <p className="text-sm text-muted-foreground">
                When to run the daily sync
              </p>
            </div>
            <Input
              type="time"
              value={syncSettings.syncTime}
              onChange={(e) =>
                setSyncSettings({ ...syncSettings, syncTime: e.target.value })
              }
              className="w-32"
              disabled={!syncSettings.autoSync}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Manual Sync</p>
              <p className="text-sm text-muted-foreground">
                Sync all marks from USPTO now
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleManualSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>

          {lastSyncResult && (
            <div className="rounded-md bg-muted p-3 text-sm">
              {lastSyncResult.error ? (
                <p className="text-red-600">Error: {lastSyncResult.error}</p>
              ) : (
                <div className="space-y-1">
                  <p className="text-muted-foreground">
                    Last sync: {new Date(lastSyncResult.timestamp).toLocaleString()}
                  </p>
                  <p>{lastSyncResult.message}</p>
                </div>
              )}
            </div>
          )}

          <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            <p className="font-medium">Note</p>
            <p>Auto-sync requires Supabase to be connected for data persistence. Currently using mock data.</p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Configure email and in-app notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Urgent Deadline Alerts</p>
              <p className="text-sm text-muted-foreground">
                Get notified when deadlines are within 7 days
              </p>
            </div>
            <Switch
              checked={notifications.urgentDeadlines}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, urgentDeadlines: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly Digest</p>
              <p className="text-sm text-muted-foreground">
                Receive a weekly summary of upcoming deadlines
              </p>
            </div>
            <Switch
              checked={notifications.weeklyDigest}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, weeklyDigest: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">TTAB Updates</p>
              <p className="text-sm text-muted-foreground">
                Get notified of new TTAB filings and orders
              </p>
            </div>
            <Switch
              checked={notifications.ttabUpdates}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, ttabUpdates: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* User Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Default View</p>
              <p className="text-sm text-muted-foreground">
                Choose your default dashboard view
              </p>
            </div>
            <select className="rounded-md border px-3 py-2 text-sm">
              <option>Dashboard</option>
              <option>Deadlines</option>
              <option>Matters</option>
            </select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Deadline Threshold</p>
              <p className="text-sm text-muted-foreground">
                Days before deadline is marked as urgent
              </p>
            </div>
            <select className="rounded-md border px-3 py-2 text-sm">
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            About MarkFlow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data Source</span>
              <span>USPTO Open Data Portal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">API Versions</span>
              <span>TSDR v1.0, PTAB/TTAB v3.0</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
