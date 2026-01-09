import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { FileBarChart, Download, Mail, FileText, Printer, Filter } from 'lucide-react'
import { useMatters, useClients, useDeadlines } from '@/hooks/useMatters'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Separator } from '@/components/ui/separator'
import { getStatusInfo } from '@/constants/statusCodes'

export function Reports() {
  const [selectedClient, setSelectedClient] = useState('all')
  const [reportType, setReportType] = useState('portfolio')

  const { data: matters } = useMatters()
  const { data: clients } = useClients()
  const { data: deadlines } = useDeadlines()

  const filteredMatters = selectedClient === 'all'
    ? matters
    : matters?.filter((m) => m.client_id === selectedClient)

  const generateCSV = () => {
    if (!filteredMatters) return

    const headers = [
      'Mark',
      'Serial Number',
      'Registration Number',
      'Client',
      'Status',
      'Filing Date',
      'Registration Date',
      'Filing Basis',
      'Class',
    ]

    const rows = filteredMatters.map((m) => [
      m.mark_text,
      m.serial_num,
      m.reg_num || '',
      m.client?.name || '',
      getStatusInfo(m.status_code).label,
      m.filing_date,
      m.reg_date || '',
      m.filing_basis,
      m.trademark_class,
    ])

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `markflow-portfolio-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clientPortfolio = selectedClient !== 'all'
    ? clients?.find((c) => c.id === selectedClient)
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate portfolio reports and exports for clients
        </p>
      </div>

      {/* Report Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5" />
            Generate Report
          </CardTitle>
          <CardDescription>
            Select options to generate a customized portfolio report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Client</label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portfolio">Portfolio Summary</SelectItem>
                  <SelectItem value="deadlines">Upcoming Deadlines</SelectItem>
                  <SelectItem value="status">Status Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button onClick={generateCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" disabled>
              <Mail className="mr-2 h-4 w-4" />
              Email Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card className="print:shadow-none print:border-0">
        <CardHeader className="print:pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                {clientPortfolio
                  ? `${clientPortfolio.name} - Portfolio Report`
                  : 'All Clients Portfolio Report'}
              </CardTitle>
              <CardDescription>
                Generated on {format(new Date(), 'MMMM d, yyyy')}
              </CardDescription>
            </div>
            <Badge variant="outline" className="print:hidden">
              {filteredMatters?.length || 0} marks
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-4 print:grid-cols-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Total Marks</p>
              <p className="text-2xl font-bold">{filteredMatters?.length || 0}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Registered</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredMatters?.filter((m) => m.reg_num).length || 0}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-amber-600">
                {filteredMatters?.filter((m) => !m.reg_num && m.status_code < 900).length || 0}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Upcoming Deadlines</p>
              <p className="text-2xl font-bold text-red-600">
                {deadlines?.filter((d) =>
                  d.status === 'open' &&
                  (selectedClient === 'all' ||
                    filteredMatters?.some((m) => m.id === d.matter_id))
                ).length || 0}
              </p>
            </div>
          </div>

          {/* Portfolio Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mark</TableHead>
                <TableHead>Serial/Reg #</TableHead>
                {selectedClient === 'all' && <TableHead>Client</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead>Filing Date</TableHead>
                <TableHead>Class</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMatters?.map((matter) => {
                const statusInfo = getStatusInfo(matter.status_code)
                return (
                  <TableRow key={matter.id}>
                    <TableCell className="font-medium">{matter.mark_text}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {matter.serial_num}
                      {matter.reg_num && (
                        <span className="ml-1 text-muted-foreground">
                          / {matter.reg_num}
                        </span>
                      )}
                    </TableCell>
                    {selectedClient === 'all' && (
                      <TableCell>{matter.client?.name}</TableCell>
                    )}
                    <TableCell>
                      <Badge variant="outline">{statusInfo.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {format(parseISO(matter.filing_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{matter.trademark_class}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {/* Footer */}
          <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground print:mt-4">
            <p>MarkFlow Trademark Management System</p>
            <p>Report generated on {format(new Date(), 'MMMM d, yyyy \'at\' h:mm a')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
