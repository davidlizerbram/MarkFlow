/**
 * Netlify Function: USPTO Trademark Data Proxy
 * Fetches trademark data from USPTO TSDR API and returns parsed JSON
 */

const USPTO_API_BASE = 'https://tsdrapi.uspto.gov'

// Simple XML text extraction helper
function extractXmlValue(xml, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([^<]*)</${tagName}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1].trim() : null
}

// Extract value from namespaced tag
function extractNamespacedValue(xml, namespace, tagName) {
  const regex = new RegExp(`<${namespace}:${tagName}[^>]*>([^<]*)</${namespace}:${tagName}>`, 'gi')
  const match = xml.match(regex)
  return match ? match[0].replace(/<[^>]+>/g, '').trim() : null
}

// Parse USPTO XML response into structured data
function parseTrademarkXml(xml) {
  try {
    // Extract key trademark information
    const data = {
      serialNumber: extractNamespacedValue(xml, 'tm', 'ApplicationNumber') ||
                    extractXmlValue(xml, 'ApplicationNumber'),
      registrationNumber: extractNamespacedValue(xml, 'tm', 'RegistrationNumber') ||
                          extractXmlValue(xml, 'RegistrationNumber'),
      markText: extractNamespacedValue(xml, 'tm', 'MarkVerbalElementText') ||
                extractXmlValue(xml, 'MarkVerbalElementText'),
      filingDate: extractNamespacedValue(xml, 'tm', 'ApplicationDate') ||
                  extractXmlValue(xml, 'ApplicationDate'),
      registrationDate: extractNamespacedValue(xml, 'tm', 'RegistrationDate') ||
                        extractXmlValue(xml, 'RegistrationDate'),
      statusCode: extractNamespacedValue(xml, 'tm', 'MarkCurrentStatusInternalDescriptionText') ||
                  extractXmlValue(xml, 'MarkCurrentStatusInternalDescriptionText'),
      statusDate: extractNamespacedValue(xml, 'tm', 'MarkCurrentStatusDate') ||
                  extractXmlValue(xml, 'MarkCurrentStatusDate'),
      statusExternalDescription: extractNamespacedValue(xml, 'tm', 'MarkCurrentStatusExternalDescriptionText') ||
                                  extractXmlValue(xml, 'MarkCurrentStatusExternalDescriptionText'),
    }

    // Extract goods and services
    const gsMatch = xml.match(/<tm:GoodsServicesClassificationBag>([\s\S]*?)<\/tm:GoodsServicesClassificationBag>/i)
    if (gsMatch) {
      const gsXml = gsMatch[1]
      data.trademarkClass = extractNamespacedValue(gsXml, 'tm', 'ClassificationKindCode') ||
                            extractXmlValue(gsXml, 'ClassNumber')
      data.goodsServices = extractNamespacedValue(gsXml, 'tm', 'GoodsServicesDescriptionText') ||
                           extractXmlValue(gsXml, 'GoodsServicesDescriptionText')
    }

    // Extract filing basis
    const basisMatch = xml.match(/<tm:FilingBasisText>([^<]*)<\/tm:FilingBasisText>/i)
    if (basisMatch) {
      data.filingBasis = basisMatch[1].trim()
    }

    // Extract attorney info
    const attorneyMatch = xml.match(/<tm:CorrespondentName>([^<]*)<\/tm:CorrespondentName>/i)
    if (attorneyMatch) {
      data.correspondentName = attorneyMatch[1].trim()
    }

    // Extract owner info
    const ownerMatch = xml.match(/<tm:ApplicantName>([^<]*)<\/tm:ApplicantName>/i)
    if (ownerMatch) {
      data.ownerName = ownerMatch[1].trim()
    }

    return data
  } catch (error) {
    console.error('Error parsing XML:', error)
    return null
  }
}

// Map USPTO status text to status codes
function mapStatusToCode(statusText) {
  if (!statusText) return 220

  const statusLower = statusText.toLowerCase()

  if (statusLower.includes('registered')) return 700
  if (statusLower.includes('published for opposition')) return 730
  if (statusLower.includes('opposition')) return 740
  if (statusLower.includes('final')) return 610
  if (statusLower.includes('non-final') || statusLower.includes('office action')) return 600
  if (statusLower.includes('abandoned')) return 900
  if (statusLower.includes('cancelled')) return 910
  if (statusLower.includes('expired')) return 920
  if (statusLower.includes('pending')) return 220
  if (statusLower.includes('new application')) return 100

  return 220 // Default to awaiting examination
}

export async function handler(event) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    const params = event.queryStringParameters || {}
    const { serialNumber, registrationNumber, action } = params

    // Validate input
    if (!serialNumber && !registrationNumber) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Serial number or registration number required' }),
      }
    }

    const identifier = serialNumber ? `sn${serialNumber}` : `rn${registrationNumber}`
    const apiKey = process.env.USPTO_API_KEY

    // Build request headers
    const requestHeaders = {
      'Accept': 'application/xml',
    }

    if (apiKey) {
      requestHeaders['USPTO-API-KEY'] = apiKey
    }

    // Fetch trademark status
    if (action === 'status' || !action) {
      const url = `${USPTO_API_BASE}/ts/cd/casestatus/${identifier}/info.xml`

      const response = await fetch(url, { headers: requestHeaders })

      if (!response.ok) {
        if (response.status === 404) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Trademark not found' }),
          }
        }
        throw new Error(`USPTO API error: ${response.status}`)
      }

      const xml = await response.text()
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

    // Fetch trademark image URL
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
