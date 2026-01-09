import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileText, Plus } from 'lucide-react'
import { useMatters, useSearchMatters } from '@/hooks/useMatters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MattersTable } from '@/components/dashboard/MattersTable'
import { AddMatterDialog } from '@/components/matter/AddMatterDialog'

export function Matters() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  const clientFilter = searchParams.get('client') || ''

  const { data: allMatters, isLoading: allLoading } = useMatters()
  const { data: searchResults, isLoading: searchLoading } = useSearchMatters(searchQuery)

  const isLoading = searchQuery ? searchLoading : allLoading

  // Apply filters
  let matters = searchQuery ? searchResults : allMatters

  if (clientFilter && matters) {
    matters = matters.filter((m) => m.client_id === clientFilter)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Matters</h1>
          <p className="text-muted-foreground">
            {searchQuery
              ? `Search results for "${searchQuery}"`
              : 'View and manage all trademark matters'}
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Mark
        </Button>
      </div>

      {/* Matters Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Matters
            {matters && (
              <span className="text-sm font-normal text-muted-foreground">
                ({matters.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MattersTable matters={matters} isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Add Matter Dialog */}
      <AddMatterDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  )
}
