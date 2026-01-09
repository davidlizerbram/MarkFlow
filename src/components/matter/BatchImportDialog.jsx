import { useState } from 'react'
import { Upload, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCreateMatter } from '@/hooks/useMatters'
import { usptoService } from '@/services/usptoService'

export function BatchImportDialog({ open, onOpenChange }) {
  const [inputText, setInputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState([])
  const [step, setStep] = useState('input') // 'input' | 'processing' | 'review'
  const createMatter = useCreateMatter()

  const parseSerialNumbers = (text) => {
    // Split by newlines, commas, or spaces and clean up
    return text
      .split(/[\n,\s]+/)
      .map(s => s.trim().replace(/\D/g, ''))
      .filter(s => s.length >= 7 && s.length <= 8)
  }

  const handleProcess = async () => {
    const serialNumbers = parseSerialNumbers(inputText)

    if (serialNumbers.length === 0) {
      return
    }

    setStep('processing')
    setIsProcessing(true)
    setResults([])

    const newResults = []

    for (const serial of serialNumbers) {
      // Update progress
      setResults([...newResults, { serial, status: 'loading', data: null, error: null }])

      try {
        const data = await usptoService.fetchTrademarkBySerial(serial)
        newResults.push({
          serial,
          status: 'success',
          data: {
            mark_text: data.markText || 'Unknown',
            serial_num: data.serialNumber || serial,
            reg_num: data.registrationNumber || '',
            owner_name: data.ownerName || '',
            status_code: data.statusCodeNumeric || 220,
            filing_basis: data.filingBasis || '1(b)',
            filing_date: data.filingDate || new Date().toISOString().split('T')[0],
            trademark_class: data.trademarkClass || '',
            goods_services: data.goodsServices || '',
          },
          error: null,
        })
      } catch (error) {
        newResults.push({
          serial,
          status: 'error',
          data: null,
          error: error.message || 'Failed to lookup',
        })
      }

      setResults([...newResults])

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsProcessing(false)
    setStep('review')
  }

  const handleImport = async () => {
    const successfulResults = results.filter(r => r.status === 'success' && r.data)

    setIsProcessing(true)

    for (const result of successfulResults) {
      try {
        await createMatter.mutateAsync(result.data)
        result.imported = true
      } catch (error) {
        result.imported = false
        result.importError = error.message
      }
    }

    setResults([...results])
    setIsProcessing(false)
  }

  const handleClose = () => {
    setInputText('')
    setResults([])
    setStep('input')
    setIsProcessing(false)
    onOpenChange(false)
  }

  const serialNumbers = parseSerialNumbers(inputText)
  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length
  const importedCount = results.filter(r => r.imported).length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Batch Import Marks</DialogTitle>
          <DialogDescription>
            {step === 'input' && 'Enter serial numbers (one per line) to lookup and import from USPTO.'}
            {step === 'processing' && 'Looking up trademarks from USPTO...'}
            {step === 'review' && 'Review the results and import the marks.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'input' && (
          <>
            <div className="space-y-3">
              <Label>Serial Numbers</Label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter serial numbers, one per line:&#10;97123456&#10;97234567&#10;97345678"
                className="w-full h-48 p-3 text-sm border rounded-md bg-background resize-none font-mono"
              />
              <p className="text-sm text-muted-foreground">
                {serialNumbers.length} valid serial number{serialNumbers.length !== 1 ? 's' : ''} detected
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleProcess}
                disabled={serialNumbers.length === 0}
              >
                <Upload className="mr-2 h-4 w-4" />
                Lookup {serialNumbers.length} Mark{serialNumbers.length !== 1 ? 's' : ''}
              </Button>
            </DialogFooter>
          </>
        )}

        {(step === 'processing' || step === 'review') && (
          <>
            <ScrollArea className="h-80 rounded-md border p-4">
              <div className="space-y-2">
                {results.map((result, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 rounded-md bg-muted/50"
                  >
                    {result.status === 'loading' && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {result.status === 'success' && !result.imported && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {result.status === 'success' && result.imported && (
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    )}
                    {result.status === 'error' && (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm">{result.serial}</p>
                      {result.data && (
                        <p className="text-sm text-muted-foreground truncate">
                          {result.data.mark_text} — {result.data.owner_name}
                        </p>
                      )}
                      {result.error && (
                        <p className="text-sm text-red-600">{result.error}</p>
                      )}
                      {result.imported && (
                        <p className="text-sm text-blue-600">Imported</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex items-center gap-4 text-sm">
              {isProcessing && step === 'processing' && (
                <span className="text-muted-foreground">
                  Processing {results.length} of {serialNumbers.length}...
                </span>
              )}
              {step === 'review' && (
                <>
                  <span className="text-green-600">{successCount} found</span>
                  {errorCount > 0 && <span className="text-red-600">{errorCount} failed</span>}
                  {importedCount > 0 && <span className="text-blue-600">{importedCount} imported</span>}
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                {importedCount > 0 ? 'Done' : 'Cancel'}
              </Button>
              {step === 'review' && successCount > 0 && importedCount === 0 && (
                <Button onClick={handleImport} disabled={isProcessing}>
                  {isProcessing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Import {successCount} Mark{successCount !== 1 ? 's' : ''}
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
