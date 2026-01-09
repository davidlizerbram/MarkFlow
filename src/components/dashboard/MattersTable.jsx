import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, ChevronDown, ChevronUp, Filter, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DeadlineIndicator } from './DeadlineHeatmap'
import { getStatusInfo, getStatusCategory, FILING_BASIS } from '@/constants/statusCodes'
import { useDeleteMatter } from '@/hooks/useMatters'
import { cn } from '@/lib/utils'

export function MattersTable({ matters, isLoading }) {
  const [sortField, setSortField] = useState('deadline')
  const [sortDirection, setSortDirection] = useState('asc')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const deleteMatter = useDeleteMatter()

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMatter.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch (error) {
      console.error('Failed to delete matter:', error)
    }
  }

  const sortedAndFilteredMatters = useMemo(() => {
    if (!matters) return []

    let filtered = [...matters]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.mark_text.toLowerCase().includes(term) ||
          m.serial_num.includes(term) ||
          (m.reg_num && m.reg_num.includes(term)) ||
          m.client?.name.toLowerCase().includes(term)
      )
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((m) => {
        const statusInfo = getStatusInfo(m.status_code)
        return statusInfo.category === filterStatus
      })
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'mark':
          comparison = a.mark_text.localeCompare(b.mark_text)
          break
        case 'serial':
          comparison = a.serial_num.localeCompare(b.serial_num)
          break
        case 'status':
          comparison = a.status_code - b.status_code
          break
        case 'deadline':
          const aDeadline = a.deadlines?.[0]?.due_date || '9999-12-31'
          const bDeadline = b.deadlines?.[0]?.due_date || '9999-12-31'
          comparison = aDeadline.localeCompare(bDeadline)
          break
        case 'client':
          comparison = (a.client?.name || '').localeCompare(b.client?.name || '')
          break
        default:
          comparison = 0
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [matters, sortField, sortDirection, filterStatus, searchTerm])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="h-10 w-64 animate-pulse rounded bg-muted" />
          <div className="h-10 w-40 animate-pulse rounded bg-muted" />
        </div>
        <div className="rounded-md border">
          <div className="h-[400px] animate-pulse bg-muted/50" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search marks, serial numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-8"
          />
          <Filter className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="application">Application</SelectItem>
            <SelectItem value="examination">Examination</SelectItem>
            <SelectItem value="office_action">Office Action</SelectItem>
            <SelectItem value="publication">Publication</SelectItem>
            <SelectItem value="registered">Registered</SelectItem>
            <SelectItem value="ttab">TTAB</SelectItem>
            <SelectItem value="abandoned">Abandoned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('mark')}
                >
                  Mark
                  <SortIcon field="mark" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('serial')}
                >
                  Serial / Reg #
                  <SortIcon field="serial" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('client')}
                >
                  Client
                  <SortIcon field="client" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('status')}
                >
                  Status
                  <SortIcon field="status" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('deadline')}
                >
                  Next Deadline
                  <SortIcon field="deadline" />
                </Button>
              </TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredMatters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <p className="text-muted-foreground">No matters found</p>
                </TableCell>
              </TableRow>
            ) : (
              sortedAndFilteredMatters.map((matter) => {
                const statusInfo = getStatusInfo(matter.status_code)
                const statusCategory = getStatusCategory(matter.status_code)
                const nextDeadline = matter.deadlines?.find(d => d.status === 'open')
                const basis = FILING_BASIS[matter.filing_basis]

                return (
                  <TableRow key={matter.id}>
                    <TableCell>
                      <div>
                        <Link
                          to={`/matters/${matter.id}`}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {matter.mark_text}
                        </Link>
                        {basis && (
                          <p className="text-xs text-muted-foreground">
                            {basis.label}
                            {matter.filing_basis === '66(a)' && (
                              <span className="ml-1 text-purple-600">(Madrid)</span>
                            )}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-mono text-sm">{matter.serial_num}</p>
                        {matter.reg_num && (
                          <p className="font-mono text-xs text-muted-foreground">
                            Reg: {matter.reg_num}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{matter.client?.name}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          statusCategory.bgColor,
                          statusCategory.textColor,
                          'dark:bg-opacity-30'
                        )}
                      >
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {nextDeadline ? (
                        <DeadlineIndicator
                          dueDate={nextDeadline.due_date}
                          status={nextDeadline.status}
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <a
                            href={`https://tsdr.uspto.gov/#caseNumber=${matter.serial_num}&caseType=SERIAL_NO&searchType=statusSearch`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View in TSDR"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(matter)}
                          title="Delete matter"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {sortedAndFilteredMatters.length} of {matters?.length || 0} matters
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Matter</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteTarget?.mark_text}"? This action cannot be undone and will also remove all associated deadlines.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMatter.isPending}
            >
              {deleteMatter.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
