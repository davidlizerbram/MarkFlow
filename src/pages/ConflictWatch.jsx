import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Search, RefreshCw, ExternalLink } from 'lucide-react'
import { useMatters } from '@/hooks/useMatters'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function ConflictWatch() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: matters, isLoading } = useMatters()

  // Find potential conflicts (marks with shared literal elements in same class)
  const potentialConflicts = useMemo(() => {
    if (!matters) return []

    const conflicts = []
    const processedPairs = new Set()

    matters.forEach((matter1, i) => {
      const words1 = matter1.mark_text.toLowerCase().split(/\s+/)

      matters.forEach((matter2, j) => {
        if (i >= j) return // Avoid duplicates and self-comparison

        // Skip if different classes
        if (matter1.trademark_class !== matter2.trademark_class) return

        const words2 = matter2.mark_text.toLowerCase().split(/\s+/)
        const sharedWords = words1.filter((word) =>
          words2.includes(word) && word.length > 2
        )

        if (sharedWords.length > 0) {
          const pairKey = [matter1.id, matter2.id].sort().join('-')
          if (!processedPairs.has(pairKey)) {
            processedPairs.add(pairKey)
            conflicts.push({
              matter1,
              matter2,
              sharedWords,
              class: matter1.trademark_class,
            })
          }
        }
      })
    })

    return conflicts
  }, [matters])

  // Filter conflicts by search term
  const filteredConflicts = useMemo(() => {
    if (!searchTerm) return potentialConflicts

    const term = searchTerm.toLowerCase()
    return potentialConflicts.filter(
      (c) =>
        c.matter1.mark_text.toLowerCase().includes(term) ||
        c.matter2.mark_text.toLowerCase().includes(term) ||
        c.sharedWords.some((w) => w.includes(term))
    )
  }, [potentialConflicts, searchTerm])

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Conflict Watch</h1>
        <p className="text-muted-foreground">
          Monitor for potential conflicts between marks in your portfolio
        </p>
      </div>

      {/* Alert Banner */}
      {potentialConflicts.length > 0 && (
        <Card className="border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-400">
                {potentialConflicts.length} potential conflict
                {potentialConflicts.length !== 1 && 's'} detected
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-500">
                Marks sharing literal elements within the same trademark class
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conflicts..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Re-scan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conflicts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Potential Conflicts</CardTitle>
          <CardDescription>
            Marks with shared words in the same international class
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredConflicts.length === 0 ? (
            <div className="py-12 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No conflicts found</h3>
              <p className="mt-2 text-muted-foreground">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'No potential conflicts detected in your portfolio'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mark 1</TableHead>
                  <TableHead>Mark 2</TableHead>
                  <TableHead>Shared Elements</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConflicts.map((conflict, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Link
                        to={`/matters/${conflict.matter1.id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {conflict.matter1.mark_text}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {conflict.matter1.client?.name}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/matters/${conflict.matter2.id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {conflict.matter2.mark_text}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {conflict.matter2.client?.name}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {conflict.sharedWords.map((word) => (
                          <Badge key={word} variant="outline" className="text-amber-600">
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Class {conflict.class}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={`https://tmsearch.uspto.gov/bin/gate.exe?f=searchss&state=4804:1gxz6p.1.1`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          TESS
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How Conflict Watch Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Conflict Watch automatically scans your trademark portfolio for potential
            conflicts by analyzing:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Shared literal word elements between marks</li>
            <li>Marks in the same International Class</li>
            <li>Newly synced applications that may conflict with existing marks</li>
          </ul>
          <p className="mt-4">
            This feature helps identify potential issues early, but is not a substitute
            for professional trademark clearance searches.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
