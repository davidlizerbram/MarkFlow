import { Link } from 'react-router-dom'
import { Users, Mail, FileText, ArrowRight } from 'lucide-react'
import { useClients, useMatters } from '@/hooks/useMatters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function Clients() {
  const { data: clients, isLoading: clientsLoading } = useClients()
  const { data: matters, isLoading: mattersLoading } = useMatters()

  const isLoading = clientsLoading || mattersLoading

  const getClientStats = (clientId) => {
    const clientMatters = matters?.filter((m) => m.client_id === clientId) || []
    return {
      total: clientMatters.length,
      registered: clientMatters.filter((m) => m.reg_num).length,
      pending: clientMatters.filter((m) => !m.reg_num && m.status_code < 900).length,
    }
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
        <p className="text-muted-foreground">
          Manage client portfolios and contact information
        </p>
      </div>

      {/* Client Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients?.map((client) => {
          const stats = getClientStats(client.id)

          return (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(client.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <a
                        href={`mailto:${client.contact_email}`}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                      >
                        <Mail className="h-3 w-3" />
                        {client.contact_email}
                      </a>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">
                    <FileText className="mr-1 h-3 w-3" />
                    {stats.total} marks
                  </Badge>
                  {stats.registered > 0 && (
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      {stats.registered} registered
                    </Badge>
                  )}
                  {stats.pending > 0 && (
                    <Badge variant="outline" className="text-amber-600 border-amber-300">
                      {stats.pending} pending
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to={`/matters?client=${client.id}`}>
                      View Matters
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/reports?client=${client.id}`}>
                      Report
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {clients?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No clients yet</h3>
            <p className="mt-2 text-muted-foreground">
              Clients will appear here when matters are added to the system
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
