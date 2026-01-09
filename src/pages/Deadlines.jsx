import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format, parseISO, differenceInDays } from 'date-fns'
import { Clock, Check, Filter, ExternalLink, Globe, AlertTriangle } from 'lucide-react'
import { useDeadlines, useUpdateDeadline } from '@/hooks/useMatters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { DeadlineHeatmap } from '@/components/dashboard/DeadlineHeatmap'
import { cn } from '@/lib/utils'

const deadlineTypeLabels = {
  office_action: 'Office Action',
  statement_of_use: 'Statement of Use',
  section_8: 'Section 8',
  section_8_15: 'Section 8 & 15',
  section_9: 'Section 9',
  opposition: 'Opposition',
  ttab_deadline: 'TTAB',
}

export function Deadlines() {
  const [filter, setFilter] = useState('all')
  const { data: deadlines, isLoading } = useDeadlines()
  const updateDeadline = useUpdateDeadline()

  const handleMarkComplete = (deadlineId) => {
    updateDeadline.mutate({
      deadlineId,
      updates: { status: 'completed' },
    })
  }

  const filteredDeadlines = deadlines?.filter((d) => {
    if (filter === 'all') return true
    if (filter === 'open') return d.status === 'open'
    if (filter === 'completed') return d.status === 'completed'
    if (filter === 'urgent') {
      const daysRemaining = differenceInDays(parseISO(d.due_date), new Date())
      return d.status === 'open' && daysRemaining <= 30
    }
    return d.deadline_type === filter
  })

  const urgentCount = deadlines?.filter((d) => {
    const daysRemaining = differenceInDays(parseISO(d.due_date), new Date())
    return d.status === 'open' && daysRemaining <= 30
  }).length || 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Deadlines</h1>
          <p className="text-muted-foreground">
            Track and manage all upcoming deadlines
          </p>
        </div>
        {urgentCount > 0 && (
          <Badge variant="destructive" className="text-sm">
            <AlertTriangle className="mr-1 h-4 w-4" />
            {urgentCount} urgent
          </Badge>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter deadlines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Deadlines</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="urgent">Urgent (&lt;30 days)</SelectItem>
                <SelectItem value="office_action">Office Actions</SelectItem>
                <SelectItem value="section_8">Section 8 & 15</SelectItem>
                <SelectItem value="section_9">Section 9</SelectItem>
                <SelectItem value="statement_of_use">Statement of Use</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {filteredDeadlines?.length || 0} deadlines
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Deadlines Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matter</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Extended</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeadlines?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <p className="text-muted-foreground">No deadlines found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDeadlines?.map((deadline) => {
                  const isMadrid = deadline.matter?.filing_basis === '66(a)'

                  return (
                    <TableRow
                      key={deadline.id}
                      className={cn(
                        deadline.status === 'completed' && 'opacity-60'
                      )}
                    >
                      <TableCell>
                        <div>
                          <Link
                            to={`/matters/${deadline.matter_id}`}
                            className="font-medium hover:text-primary hover:underline"
                          >
                            {deadline.matter?.mark_text}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{deadline.matter?.serial_num}</span>
                            {isMadrid && (
                              <Badge
                                variant="outline"
                                className="h-4 border-purple-500 px-1 text-[10px] text-purple-600"
                              >
                                <Globe className="mr-0.5 h-2 w-2" />
                                Madrid
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {deadlineTypeLabels[deadline.deadline_type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DeadlineHeatmap
                          dueDate={deadline.due_date}
                          status={deadline.status}
                        />
                      </TableCell>
                      <TableCell>
                        {deadline.deadline_type === 'office_action' && (
                          isMadrid ? (
                            <span className="text-xs text-muted-foreground">N/A</span>
                          ) : (
                            <Switch
                              checked={deadline.is_extended}
                              disabled={deadline.status === 'completed'}
                            />
                          )
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={deadline.status === 'completed' ? 'secondary' : 'default'}
                        >
                          {deadline.status === 'completed' ? (
                            <>
                              <Check className="mr-1 h-3 w-3" />
                              Done
                            </>
                          ) : (
                            'Open'
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {deadline.status === 'open' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkComplete(deadline.id)}
                            >
                              <Check className="mr-1 h-3 w-3" />
                              Complete
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" asChild>
                            <a
                              href={`https://tsdr.uspto.gov/#caseNumber=${deadline.matter?.serial_num}&caseType=SERIAL_NO&searchType=statusSearch`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
