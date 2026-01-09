/**
 * USPTO Service
 * Fetches real trademark data from USPTO via Netlify Functions
 */

const API_BASE = '/api/uspto-trademark'

/**
 * Fetch trademark data by serial number
 */
export async function fetchTrademarkBySerial(serialNumber) {
  const response = await fetch(`${API_BASE}?serialNumber=${serialNumber}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `Failed to fetch trademark: ${response.status}`)
  }

  return response.json()
}

/**
 * Fetch trademark data by registration number
 */
export async function fetchTrademarkByRegistration(registrationNumber) {
  const response = await fetch(`${API_BASE}?registrationNumber=${registrationNumber}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `Failed to fetch trademark: ${response.status}`)
  }

  return response.json()
}

/**
 * Lookup a trademark by serial or registration number
 */
export async function lookupTrademark(identifier) {
  // Determine if it's a serial or registration number
  // Serial numbers are typically 8 digits starting with 7, 8, or 9
  // Registration numbers are typically 7 digits or less
  const cleaned = identifier.replace(/\D/g, '')

  if (cleaned.length === 8 && ['7', '8', '9'].includes(cleaned[0])) {
    return fetchTrademarkBySerial(cleaned)
  } else if (cleaned.length <= 7) {
    return fetchTrademarkByRegistration(cleaned)
  } else {
    // Default to serial number lookup
    return fetchTrademarkBySerial(cleaned)
  }
}

/**
 * Transform USPTO API response to our internal format
 */
export function transformToMatter(usptoData, clientId = null) {
  return {
    id: `matter-${Date.now()}`,
    serial_num: usptoData.serialNumber || '',
    reg_num: usptoData.registrationNumber || null,
    mark_text: usptoData.markText || 'Unknown Mark',
    client_id: clientId,
    status_code: usptoData.statusCodeNumeric || 220,
    filing_date: usptoData.filingDate || new Date().toISOString().split('T')[0],
    reg_date: usptoData.registrationDate || null,
    filing_basis: mapFilingBasis(usptoData.filingBasis),
    image_url: usptoData.imageUrl || null,
    goods_services: usptoData.goodsServices || '',
    trademark_class: usptoData.trademarkClass || '',
    attorney_notes: null,
    // Additional fields from USPTO
    owner_name: usptoData.ownerName || null,
    correspondent_name: usptoData.correspondentName || null,
    status_description: usptoData.statusExternalDescription || null,
  }
}

/**
 * Map USPTO filing basis text to our codes
 */
function mapFilingBasis(basisText) {
  if (!basisText) return '1(b)'

  const basisLower = basisText.toLowerCase()

  if (basisLower.includes('use in commerce') || basisLower.includes('1(a)')) return '1(a)'
  if (basisLower.includes('intent to use') || basisLower.includes('1(b)')) return '1(b)'
  if (basisLower.includes('44(d)') || basisLower.includes('foreign application')) return '44(d)'
  if (basisLower.includes('44(e)') || basisLower.includes('foreign registration')) return '44(e)'
  if (basisLower.includes('66(a)') || basisLower.includes('madrid')) return '66(a)'

  return '1(b)' // Default
}

/**
 * Check if USPTO API is available
 */
export async function checkApiStatus() {
  try {
    // Try to fetch a known trademark to check API status
    const response = await fetch(`${API_BASE}?serialNumber=97123456`, {
      method: 'HEAD',
    })
    return response.ok || response.status === 404 // 404 means API is working, just trademark not found
  } catch {
    return false
  }
}

export const usptoService = {
  fetchTrademarkBySerial,
  fetchTrademarkByRegistration,
  lookupTrademark,
  transformToMatter,
  checkApiStatus,
}

export default usptoService
