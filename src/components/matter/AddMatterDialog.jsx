import { useState } from 'react'
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

const initialFormState = {
  mark_text: '',
  serial_num: '',
  reg_num: '',
  client_id: '',
  status_code: '220',
  filing_basis: '1(b)',
  filing_date: new Date().toISOString().split('T')[0],
  trademark_class: '',
  goods_services: '',
}

export function AddMatterDialog({ open, onOpenChange }) {
  const [formData, setFormData] = useState(initialFormState)
  const { data: clients } = useClients()
  const createMatter = useCreateMatter()

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
            Enter the details for the new trademark matter.
          </DialogDescription>
        </DialogHeader>

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
              <Label htmlFor="client_id">Client</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => handleChange('client_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
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
