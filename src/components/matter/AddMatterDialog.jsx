import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useClients, useCreateMatter } from '@/hooks/useMatters'
import { FILING_BASIS, STATUS_CODES } from '@/constants/statusCodes'
import { usptoService } from '@/services/usptoService'

const initialFormState = {
  mark_text: '',
  serial_num: '',
  reg_num: '',
  owner_name: '',
  client_id: '',
  status_code: '220',
  filing_basis: '1(b)',
  filing_date: new Date().toISOString().split('T')[0],
  trademark_class: '',
  goods_services: '',
}

export function AddMatterDialog({ open, onOpenChange }) {
  const [formData, setFormData] = useState(initialFormState)
  const [lookupSerial, setLookupSerial] = useState('')
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [lookupError, setLookupError] = useState(null)
  const { data: clients } = useClients()
  const createMatter = useCreateMatter()

  const handleLookup = async () => {
    if (!lookupSerial.trim()) return

    setIsLookingUp(true)
    setLookupError(null)

    try {
      const data = await usptoService.fetchTrademarkBySerial(lookupSerial.trim())

      // Auto-fill form with USPTO data
      setFormData((prev) => ({
        ...prev,
        mark_text: data.markText || prev.mark_text,
        serial_num: data.serialNumber || lookupSerial,
        reg_num: data.registrationNumber || '',
        owner_name: data.ownerName || '',
        status_code: String(data.statusCodeNumeric || 220),
        filing_basis: mapUsptoFilingBasis(data.filingBasis) || prev.filing_basis,
        filing_date: formatDate(data.filingDate) || prev.filing_date,
        trademark_class: data.trademarkClass || '',
        goods_services: data.goodsServices || '',
      }))
    } catch (error) {
      setLookupError(error.message || 'Failed to lookup trademark')
    } finally {
      setIsLookingUp(false)
    }
  }

  // Helper to map USPTO filing basis to our format
  function mapUsptoFilingBasis(basis) {
    if (!basis) return null
    const basisLower = basis.toLowerCase()
    if (basisLower.includes('1(a)') || basisLower.includes('use in commerce')) return '1(a)'
    if (basisLower.includes('1(b)') || basisLower.includes('intent')) return '1(b)'
    if (basisLower.includes('44(d)')) return '44(d)'
    if (basisLower.includes('44(e)')) return '44(e)'
    if (basisLower.includes('66(a)') || basisLower.includes('madrid')) return '66(a)'
    return null
  }

  // Helper to format date from USPTO
  function formatDate(dateStr) {
    if (!dateStr) return null
    // Handle various date formats
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return null
    return date.toISOString().split('T')[0]
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await createMatter.mutateAsync({
        ...formData,
        status_code: parseInt(formData.status_code, 10),
      })
      setFormData(initialFormState)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to create matter:', error)
    }
  }

  const handleClose = () => {
    setFormData(initialFormState)
    setLookupSerial('')
    setLookupError(null)
    onOpenChange(false)
  }

  // Filter status codes to show only common ones for new matters
  const newMatterStatuses = [100, 150, 200, 220, 250, 400, 500, 600, 700, 730]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Mark</DialogTitle>
          <DialogDescription>
            Enter a serial number to lookup from USPTO, or fill in the details manually.
          </DialogDescription>
        </DialogHeader>

        {/* USPTO Lookup Section */}
        <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
          <Label className="text-sm font-medium">Lookup from USPTO</Label>
          <div className="flex gap-2">
            <Input
              value={lookupSerial}
              onChange={(e) => setLookupSerial(e.target.value)}
              placeholder="Enter serial number (e.g., 97123456)"
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleLookup())}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleLookup}
              disabled={isLookingUp || !lookupSerial.trim()}
            >
              {isLookingUp ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="ml-2">{isLookingUp ? 'Looking up...' : 'Lookup'}</span>
            </Button>
          </div>
          {lookupError && (
            <p className="text-sm text-destructive">{lookupError}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="mark_text">Mark Text *</Label>
              <Input
                id="mark_text"
                value={formData.mark_text}
                onChange={(e) => handleChange('mark_text', e.target.value)}
                placeholder="e.g., ACME WIDGETS"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serial_num">Serial Number *</Label>
              <Input
                id="serial_num"
                value={formData.serial_num}
                onChange={(e) => handleChange('serial_num', e.target.value)}
                placeholder="e.g., 97123456"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg_num">Registration Number</Label>
              <Input
                id="reg_num"
                value={formData.reg_num}
                onChange={(e) => handleChange('reg_num', e.target.value)}
                placeholder="e.g., 6789012"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_name">Owner</Label>
              <Input
                id="owner_name"
                value={formData.owner_name}
                onChange={(e) => handleChange('owner_name', e.target.value)}
                placeholder="Auto-filled from USPTO lookup"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Associate with Client</Label>
              <Select
                value={formData.client_id || 'none'}
                onValueChange={(value) => handleChange('client_id', value === 'none' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Optional - select a client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filing_basis">Filing Basis *</Label>
              <Select
                value={formData.filing_basis}
                onValueChange={(value) => handleChange('filing_basis', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FILING_BASIS).map(([code, info]) => (
                    <SelectItem key={code} value={code}>
                      {code} - {info.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status_code">Status *</Label>
              <Select
                value={formData.status_code}
                onValueChange={(value) => handleChange('status_code', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {newMatterStatuses.map((code) => (
                    <SelectItem key={code} value={String(code)}>
                      {code} - {STATUS_CODES[code]?.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filing_date">Filing Date *</Label>
              <Input
                id="filing_date"
                type="date"
                value={formData.filing_date}
                onChange={(e) => handleChange('filing_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trademark_class">Class</Label>
              <Input
                id="trademark_class"
                value={formData.trademark_class}
                onChange={(e) => handleChange('trademark_class', e.target.value)}
                placeholder="e.g., 025"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="goods_services">Goods/Services</Label>
              <Input
                id="goods_services"
                value={formData.goods_services}
                onChange={(e) => handleChange('goods_services', e.target.value)}
                placeholder="e.g., IC 025. G & S: Clothing..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMatter.isPending}>
              {createMatter.isPending ? 'Adding...' : 'Add Mark'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
