import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Calendar,
  Building2,
  Scale,
  Globe,
  Clock,
  AlertTriangle,
  Save,
} from 'lucide-react'
import { useMatter, useUpdateMatterNotes } from '@/hooks/useMatters'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { DeadlineHeatmap } from '@/components/dashboard/DeadlineHeatmap'
import { getStatusInfo, getStatusCategory, FILING_BASIS } from '@/constants/statusCodes'
import { calculateOfficeActionDeadline, calculateMaintenanceDeadlines } from '@/utils/lawEngine'
import { TTABProceedings } from '@/components/matter/TTABProceedings'
import { cn } from '@/lib/utils'

export function MatterDetail() {
  const { id } = useParams()
  const { data: matter, isLoading, error } = useMatter(id)
  const updateNotes = useUpdateMatterNotes()
  const [notes, setNotes] = useState('')
  const [notesInitialized, setNotesInitialized] = useState(false)

  // Initialize notes when matter loads
  if (matter && !notesInitialized) {
    setNotes(matter.attorney_notes || '')
    setNotesInitialized(true)
  }

  const handleSaveNotes = () => {
    updateNotes.mutate({ matterId: id, notes })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (error || !matter) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-muted-foreground">Matter not found</p>
        <Button asChild className="mt-4">
          <Link to="/">Return to Dashboard</Link>
        </Button>
      </div>
    )
  }

  const statusInfo = getStatusInfo(matter.status_code)
  const statusCategory = getStatusCategory(matter.status_code)
  const basis = FILING_BASIS[matter.filing_basis]
  const isMadrid = matter.filing_basis === '66(a)'
  const hasTTAB = !!matter.ttab_proceeding

  // Calculate deadlines
  const maintenanceDeadlines = matter.reg_date
    ? calculateMaintenanceDeadlines(matter.reg_date)
    : null

  // Calculate office action deadline if status indicates one is pending
  // Use office_action_date (date OA was mailed) if available, otherwise can't calculate
  const isOfficeActionPending = [600, 601, 602, 603, 610, 611, 612, 614, 615, 616].includes(matter.status_code)
  const officeActionDeadline = isOfficeActionPending && matter.office_action_date
    ? calculateOfficeActionDeadline(matter.office_action_date, matter.filing_basis)
    : null

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{matter.mark_text}</h1>
            {isMadrid && (
              <Badge variant="outline" className="border-purple-500 text-purple-600">
                <Globe className="mr-1 h-3 w-3" />
                Madrid Protocol
              </Badge>
            )}
            {hasTTAB && (
              <Badge variant="destructive">
                <Scale className="mr-1 h-3 w-3" />
                TTAB Active
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Serial #{matter.serial_num}
            {matter.reg_num && ` | Reg #${matter.reg_num}`}
          </p>
        </div>
        <Button asChild>
          <a
            href={`https://tsdr.uspto.gov/#caseNumber=${matter.serial_num}&caseType=SERIAL_NO&searchType=statusSearch`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View in TSDR
          </a>
        </Button>
      </div>

      {/* Status Banner */}
      <Card
        className={cn(
          'border-l-4',
          statusInfo.category === 'registered' && 'border-l-green-500',
          statusInfo.category === 'office_action' && 'border-l-orange-500',
          statusInfo.category === 'ttab' && 'border-l-red-500'
        )}
      >
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Badge className={cn(statusCategory.bgColor, statusCategory.textColor)}>
              {statusInfo.label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Status Code: {matter.status_code}
            </span>
          </div>
          {basis && (
            <div className="text-sm">
              <span className="text-muted-foreground">Filing Basis: </span>
              <span className="font-medium">
                {matter.filing_basis} - {basis.label}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          {hasTTAB && <TabsTrigger value="ttab">Litigation</TabsTrigger>}
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Key Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-4 w-4" />
                  Key Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Filing Date</span>
                  <span className="font-medium">
                    {format(parseISO(matter.filing_date), 'MMMM d, yyyy')}
                  </span>
                </div>
                {matter.reg_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registration Date</span>
                    <span className="font-medium">
                      {format(parseISO(matter.reg_date), 'MMMM d, yyyy')}
                    </span>
                  </div>
                )}
                <Separator />
                {maintenanceDeadlines && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Section 8/15 Window</span>
                      <span className="font-medium">
                        {format(maintenanceDeadlines.section8.windowStart, 'MMM yyyy')} -{' '}
                        {format(maintenanceDeadlines.section8.windowEnd, 'MMM yyyy')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Section 9 Due</span>
                      <span className="font-medium">
                        {format(maintenanceDeadlines.section9.dueDate, 'MMMM d, yyyy')}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-4 w-4" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client Name</span>
                  <span className="font-medium">{matter.client?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact</span>
                  <a
                    href={`mailto:${matter.client?.contact_email}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {matter.client?.contact_email}
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Goods & Services */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-4 w-4" />
                  Goods & Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{matter.goods_services}</p>
                <div className="mt-4">
                  <Badge variant="outline">Class {matter.trademark_class}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Deadlines Tab */}
        <TabsContent value="deadlines" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-4 w-4" />
                Active Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              {matter.deadlines?.length === 0 && !officeActionDeadline && !isOfficeActionPending ? (
                <p className="text-muted-foreground">No active deadlines</p>
              ) : matter.deadlines?.length === 0 && !officeActionDeadline && isOfficeActionPending ? (
                <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
                  <p className="font-medium text-amber-800">Office Action Pending</p>
                  <p className="text-sm text-amber-700 mt-1">
                    This mark has an office action status but the mailing date is not available.
                    Re-import this mark from USPTO to fetch the correct deadline date.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Calculated Office Action deadline */}
                  {officeActionDeadline && (
                    <div className="flex items-center justify-between rounded-lg border p-4 border-orange-200 bg-orange-50">
                      <div className="space-y-1">
                        <p className="font-medium">
                          Response to Office Action
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {officeActionDeadline.daysRemaining} days remaining
                          {officeActionDeadline.isExtendable && ' (extension available)'}
                        </p>
                        {isMadrid && (
                          <div className="flex items-center gap-1 text-xs text-purple-600">
                            <AlertTriangle className="h-3 w-3" />
                            Madrid Protocol - No extension available
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">
                            {format(officeActionDeadline.deadline, 'MMM d, yyyy')}
                          </p>
                          {officeActionDeadline.daysRemaining <= 30 && (
                            <Badge variant={officeActionDeadline.daysRemaining <= 7 ? 'destructive' : 'warning'}>
                              {officeActionDeadline.daysRemaining <= 7 ? 'Urgent' : 'Due Soon'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Stored deadlines */}
                  {matter.deadlines?.map((deadline) => (
                    <div
                      key={deadline.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">
                          {deadline.notes || deadline.deadline_type}
                        </p>
                        {isMadrid && deadline.deadline_type === 'office_action' && (
                          <div className="flex items-center gap-1 text-xs text-purple-600">
                            <AlertTriangle className="h-3 w-3" />
                            Madrid Protocol - No extension available
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        {!isMadrid && deadline.deadline_type === 'office_action' && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              Extension Filed
                            </span>
                            <Switch checked={deadline.is_extended} disabled />
                          </div>
                        )}
                        <DeadlineHeatmap
                          dueDate={deadline.due_date}
                          status={deadline.status}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>File Wrapper Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" asChild className="w-full justify-start">
                  <a
                    href={`https://tsdr.uspto.gov/documentviewer?caseId=sn${matter.serial_num}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View All Documents in TSDR
                    <ExternalLink className="ml-auto h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <a
                    href={`https://tsdr.uspto.gov/#caseNumber=${matter.serial_num}&caseSearchType=US_APPLICATION&caseType=DEFAULT&searchType=documentSearch`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Office Action History
                    <ExternalLink className="ml-auto h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TTAB Tab */}
        {hasTTAB && (
          <TabsContent value="ttab" className="mt-6">
            <TTABProceedings proceeding={matter.ttab_proceeding} />
          </TabsContent>
        )}

        {/* Notes Tab */}
        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Internal Notes</span>
                <Badge variant="secondary">Attorney-Client Privileged</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Add internal notes here... (these are stored locally, not synced with USPTO)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="mt-4 flex justify-end">
                <Button onClick={handleSaveNotes} disabled={updateNotes.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {updateNotes.isPending ? 'Saving...' : 'Save Notes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
