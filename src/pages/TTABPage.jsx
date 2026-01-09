import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Scale, ExternalLink, FileText, AlertCircle } from 'lucide-react'
import { useTTABProceedings, useMatters } from '@/hooks/useMatters'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const phaseColors = {
  Pleadings: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Discovery: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Trial: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  Appeal: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  Suspended: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
}

export function TTABPage() {
  const { data: proceedings, isLoading: proceedingsLoading } = useTTABProceedings()
  const { data: matters, isLoading: mattersLoading } = useMatters()

  const isLoading = proceedingsLoading || mattersLoading

  // Enrich proceedings with matter data
  const enrichedProceedings = proceedings?.map((p) => ({
    ...p,
    matter: matters?.find((m) => m.id === p.matter_id),
  }))

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
          <h1 className="text-2xl font-bold tracking-tight">TTAB Proceedings</h1>
          <p className="text-muted-foreground">
            Track opposition and cancellation proceedings
          </p>
        </div>
        <Badge variant="destructive" className="text-sm">
          <Scale className="mr-1 h-4 w-4" />
          {enrichedProceedings?.length || 0} Active
        </Badge>
      </div>

      {/* Active Proceedings */}
      {enrichedProceedings?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Scale className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No Active Proceedings</h3>
            <p className="mt-2 text-muted-foreground">
              When matters have TTAB proceedings, they will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Active Proceedings</CardTitle>
            <CardDescription>
              Opposition and cancellation cases currently before the TTAB
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proceeding #</TableHead>
                  <TableHead>Mark</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Phase</TableHead>
                  <TableHead>Opposer/Petitioner</TableHead>
                  <TableHead>Filed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrichedProceedings?.map((proceeding) => (
                  <TableRow key={proceeding.id}>
                    <TableCell className="font-mono">
                      {proceeding.proceeding_num}
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/matters/${proceeding.matter_id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {proceeding.matter?.mark_text}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        SN: {proceeding.matter?.serial_num}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {proceeding.type === 'opposition'
                          ? 'Opposition'
                          : 'Cancellation'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          phaseColors[proceeding.current_phase] ||
                          phaseColors.Suspended
                        }
                      >
                        {proceeding.current_phase}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {proceeding.opposer || '—'}
                    </TableCell>
                    <TableCell>
                      {format(parseISO(proceeding.filing_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <a
                            href={`https://ttabvue.uspto.gov/ttabvue/v?pno=${proceeding.proceeding_num}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View in TTABVUE"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            to={`/matters/${proceeding.matter_id}`}
                            title="View Matter"
                          >
                            <FileText className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Phase Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            TTAB Proceeding Phases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4">
              <Badge className={phaseColors.Pleadings}>Pleadings</Badge>
              <p className="mt-2 text-sm text-muted-foreground">
                Initial filings including the notice of opposition/petition and answer.
                Typically 40 days to respond to the notice.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <Badge className={phaseColors.Discovery}>Discovery</Badge>
              <p className="mt-2 text-sm text-muted-foreground">
                Parties exchange evidence, serve interrogatories, and take depositions.
                Standard period is 180 days.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <Badge className={phaseColors.Trial}>Trial</Badge>
              <p className="mt-2 text-sm text-muted-foreground">
                Testimony periods and submission of trial briefs. No live testimony -
                all evidence is submitted in writing.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <Badge className={phaseColors.Appeal}>Appeal</Badge>
              <p className="mt-2 text-sm text-muted-foreground">
                Post-decision phase. Appeals may be taken to Federal Circuit Court or
                civil action in district court.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <a
                href="https://ttabvue.uspto.gov/ttabvue/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                TTABVUE
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://www.uspto.gov/trademarks/ttab"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                TTAB Homepage
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://www.uspto.gov/sites/default/files/documents/tbmp-2022-Jan.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                TBMP Manual
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
