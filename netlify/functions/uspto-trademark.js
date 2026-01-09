/**
 * Netlify Function: USPTO Trademark Data Proxy
 * Fetches trademark data from USPTO TSDR API and returns parsed JSON
 */

const USPTO_API_BASE = 'https://tsdrapi.uspto.gov'

// Extract text content between tags (handles nested content)
function extractBetweenTags(xml, tagName) {
  // Try with namespace first
  const nsPatterns = [
    new RegExp(`<[^:]+:${tagName}[^>]*>([\\s\\S]*?)</[^:]+:${tagName}>`, 'i'),
    new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, 'i'),
  ]

  for (const pattern of nsPatterns) {
    const match = xml.match(pattern)
    if (match) {
      // Strip any nested tags and return text content
      return match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    }
  }
  return null
}

// Extract simple text value (no nested tags) - handles tags with attributes
function extractSimpleValue(xml, tagName) {
  const patterns = [
    // With namespace and possible attributes
    new RegExp(`<ns\\d+:${tagName}[^>]*>([^<]+)</ns\\d+:${tagName}>`, 'i'),
    new RegExp(`<[^:>]+:${tagName}[^>]*>([^<]+)</[^:>]+:${tagName}>`, 'i'),
    // Without namespace
    new RegExp(`<${tagName}[^>]*>([^<]+)</${tagName}>`, 'i'),
  ]

  for (const pattern of patterns) {
    const match = xml.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }
  return null
}

// Clean date string (remove timezone suffix like -04:00)
function cleanDate(dateStr) {
  if (!dateStr) return null
  // Remove timezone offset like -04:00 or +00:00
  return dateStr.replace(/[+-]\d{2}:\d{2}$/, '').trim()
}

// Parse USPTO XML response into structured data
function parseTrademarkXml(xml) {
  try {
    const data = {}

    // Serial Number - look for ApplicationNumberText
    data.serialNumber = extractSimpleValue(xml, 'ApplicationNumberText')

    // Registration Number
    data.registrationNumber = extractSimpleValue(xml, 'RegistrationNumber') ||
                              extractSimpleValue(xml, 'RegistrationNumberText')

    // Mark Text - try multiple possible locations
    data.markText = extractSimpleValue(xml, 'MarkVerbalElementText') ||
                    extractSimpleValue(xml, 'MarkSignificantVerbalElementText') ||
                    extractSimpleValue(xml, 'MarkLiteralElementText')

    // Filing Date (clean timezone)
    const rawFilingDate = extractSimpleValue(xml, 'ApplicationDate') ||
                          extractSimpleValue(xml, 'NationalApplicationDate') ||
                          extractSimpleValue(xml, 'FilingDate')
    data.filingDate = cleanDate(rawFilingDate)

    // Registration Date
    const rawRegDate = extractSimpleValue(xml, 'RegistrationDate') ||
                       extractSimpleValue(xml, 'NationalRegistrationDate')
    data.registrationDate = cleanDate(rawRegDate)

    // Status - get both code and description
    data.statusCode = extractSimpleValue(xml, 'MarkCurrentStatusCode')
    data.statusExternalDescription = extractSimpleValue(xml, 'MarkCurrentStatusExternalDescriptionText')
    data.statusDate = cleanDate(extractSimpleValue(xml, 'MarkCurrentStatusDate'))

    // Class - get the first ClassNumber (usually Primary or Nice class)
    const classMatches = xml.match(/<ns\d+:ClassNumber>(\d+)<\/ns\d+:ClassNumber>/i)
    data.trademarkClass = classMatches ? classMatches[1] : null

    // Goods/Services description
    data.goodsServices = extractSimpleValue(xml, 'GoodsServicesDescriptionText') ||
                         extractBetweenTags(xml, 'ClassDescriptionText')

    // Filing Basis - check the indicator flags
    if (xml.includes('BasisUseIndicator>true')) {
      data.filingBasis = '1(a)'
    } else if (xml.includes('BasisIntentToUseIndicator>true')) {
      data.filingBasis = '1(b)'
    } else if (xml.includes('BasisForeignApplicationIndicator>true')) {
      data.filingBasis = '44(d)'
    } else if (xml.includes('BasisForeignRegistrationIndicator>true')) {
      data.filingBasis = '44(e)'
    }

    // Owner/Applicant Name
    data.ownerName = extractSimpleValue(xml, 'EntityName') ||
                     extractSimpleValue(xml, 'OrganizationName') ||
                     extractSimpleValue(xml, 'PersonFullName')

    // Attorney/Correspondent
    data.correspondentName = extractSimpleValue(xml, 'PersonFullName') ||
                             extractSimpleValue(xml, 'RepresentativeName')

    return data
  } catch (error) {
    console.error('Error parsing XML:', error)
    return null
  }
}

// Map USPTO status code or text to our internal codes
function mapStatusToCode(statusCodeOrText) {
  if (!statusCodeOrText) return 220

  // If it's a numeric code, map it
  const numericCode = parseInt(statusCodeOrText, 10)
  if (!isNaN(numericCode)) {
    // USPTO status codes - map to our simplified codes
    if (numericCode >= 800 && numericCode < 900) return 700 // Registered
    if (numericCode >= 700 && numericCode < 800) return 730 // Published
    if (numericCode >= 600 && numericCode < 700) return 600 // Office action/examination
    if (numericCode >= 900) return 900 // Abandoned
    if (numericCode >= 300 && numericCode < 400) return 220 // Pending
    return 220
  }

  // Text-based matching
  const statusLower = statusCodeOrText.toLowerCase()

  if (statusLower.includes('registered') && !statusLower.includes('not')) return 700
  if (statusLower.includes('published for opposition')) return 730
  if (statusLower.includes('opposition')) return 740
  if (statusLower.includes('final')) return 610
  if (statusLower.includes('non-final') || statusLower.includes('office action')) return 600
  if (statusLower.includes('abandoned')) return 900
  if (statusLower.includes('cancelled') || statusLower.includes('canceled')) return 910
  if (statusLower.includes('expired')) return 920
  if (statusLower.includes('pending')) return 220
  if (statusLower.includes('new application')) return 100

  return 220
}

export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    const params = event.queryStringParameters || {}
    const { serialNumber, registrationNumber, action, debug } = params

    if (!serialNumber && !registrationNumber) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Serial number or registration number required' }),
      }
    }

    const identifier = serialNumber ? `sn${serialNumber}` : `rn${registrationNumber}`
    const apiKey = process.env.USPTO_API_KEY

    const requestHeaders = {
      'Accept': 'application/xml',
    }

    if (apiKey) {
      requestHeaders['USPTO-API-KEY'] = apiKey
    }

    // Fetch trademark status
    if (action === 'status' || !action) {
      const url = `${USPTO_API_BASE}/ts/cd/casestatus/${identifier}/info.xml`

      console.log('Fetching:', url)
      console.log('Has API Key:', !!apiKey)

      const response = await fetch(url, { headers: requestHeaders })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('USPTO Error Response:', errorText.substring(0, 500))

        if (response.status === 404) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Trademark not found' }),
          }
        }
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({ error: `USPTO API error: ${response.status}`, details: errorText.substring(0, 200) }),
        }
      }

      const xml = await response.text()

      // Debug mode - return raw XML
      if (debug === 'true') {
        return {
          statusCode: 200,
          headers: { ...headers, 'Content-Type': 'text/xml' },
          body: xml,
        }
      }

      console.log('XML length:', xml.length)
      console.log('XML preview:', xml.substring(0, 500))

      const parsed = parseTrademarkXml(xml)

      if (!parsed) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to parse USPTO response' }),
        }
      }

      // Add computed status code
      parsed.statusCodeNumeric = mapStatusToCode(parsed.statusCode || parsed.statusExternalDescription)

      // Add image URL
      const sn = serialNumber || parsed.serialNumber
      if (sn) {
        parsed.imageUrl = `${USPTO_API_BASE}/img/${sn}/large`
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(parsed),
      }
    }

    if (action === 'image') {
      const sn = serialNumber || registrationNumber
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          imageUrl: `${USPTO_API_BASE}/img/${sn}/large`,
          thumbnailUrl: `${USPTO_API_BASE}/img/${sn}/small`,
        }),
      }
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid action' }),
    }

  } catch (error) {
    console.error('USPTO API Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    }
  }
}
