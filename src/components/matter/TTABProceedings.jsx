import { format, parseISO } from 'date-fns'
import { ExternalLink, Scale, Calendar, FileText, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const phaseColors = {
  Pleadings: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Discovery: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Trial: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  Appeal: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  Suspended: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
}

export function TTABProceedings({ proceeding }) {
  if (!proceeding) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No TTAB proceedings for this matter</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Proceeding Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              {proceeding.type === 'opposition' ? 'Opposition' : 'Cancellation'} Proceeding
            </CardTitle>
            <Button asChild>
              <a
                href={`https://ttabvue.uspto.gov/ttabvue/v?pno=${proceeding.proceeding_num}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View in TTABVUE
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Proceeding Number</span>
                <span className="font-mono font-medium">{proceeding.proceeding_num}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="outline">
                  {proceeding.type === 'opposition' ? 'Opposition' : 'Cancellation'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Phase</span>
                <Badge className={phaseColors[proceeding.current_phase] || phaseColors.Suspended}>
                  {proceeding.current_phase}
                </Badge>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Filed</span>
                <span className="font-medium">
                  {format(parseISO(proceeding.filing_date), 'MMMM d, yyyy')}
                </span>
              </div>
              {proceeding.opposer && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Opposer</span>
                  <span className="font-medium">{proceeding.opposer}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Sync</span>
                <span className="text-sm text-muted-foreground">
                  {format(parseISO(proceeding.last_sync), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-4 w-4" />
            Proceeding Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {proceeding.events && proceeding.events.length > 0 ? (
            <div className="relative space-y-4">
              {/* Timeline line */}
              <div className="absolute left-2 top-2 h-[calc(100%-16px)] w-0.5 bg-border" />

              {proceeding.events.map((event, index) => (
                <div key={index} className="relative flex gap-4 pl-8">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background" />

                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{event.description}</p>
                      <span className="text-sm text-muted-foreground">
                        {format(parseISO(event.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No events recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Phase Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">TTAB Phase Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border p-4">
              <Badge className={phaseColors.Pleadings}>Pleadings</Badge>
              <p className="mt-2 text-sm text-muted-foreground">
                Initial phase where parties file opposition/petition and answer
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <Badge className={phaseColors.Discovery}>Discovery</Badge>
              <p className="mt-2 text-sm text-muted-foreground">
                Parties exchange evidence, take depositions, and prepare case
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <Badge className={phaseColors.Trial}>Trial</Badge>
              <p className="mt-2 text-sm text-muted-foreground">
                Testimony periods and submission of trial briefs
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <Badge className={phaseColors.Appeal}>Appeal</Badge>
              <p className="mt-2 text-sm text-muted-foreground">
                Post-decision appeals to Federal Circuit or district court
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
