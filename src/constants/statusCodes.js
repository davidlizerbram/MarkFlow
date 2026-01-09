// USPTO Trademark Status Codes mapped to human-readable labels
// Reference: https://www.uspto.gov/trademarks/process/status

export const STATUS_CODES = {
  // Application Processing
  100: { label: 'New Application', category: 'application', color: 'blue' },
  150: { label: 'New Application - Record Initialized', category: 'application', color: 'blue' },
  200: { label: 'Abandoned - Incomplete', category: 'abandoned', color: 'gray' },
  220: { label: 'Awaiting Examination', category: 'application', color: 'blue' },
  250: { label: 'Intent-to-Use Processing', category: 'application', color: 'blue' },

  // Examination
  400: { label: 'Assigned to Examiner', category: 'examination', color: 'yellow' },
  500: { label: 'Initial Examination', category: 'examination', color: 'yellow' },
  600: { label: 'Non-Final Action Issued', category: 'office_action', color: 'orange' },
  605: { label: 'Response After Non-Final Action', category: 'office_action', color: 'orange' },
  610: { label: 'Final Action Issued', category: 'office_action', color: 'red' },
  615: { label: 'Response After Final Action', category: 'office_action', color: 'red' },
  620: { label: 'Appeal Pending', category: 'appeal', color: 'purple' },
  630: { label: 'Suspended', category: 'suspended', color: 'gray' },

  // Publication
  700: { label: 'Registered', category: 'registered', color: 'green' },
  710: { label: 'Registered - Maintenance Due', category: 'registered', color: 'amber' },
  730: { label: 'Published for Opposition', category: 'publication', color: 'blue' },
  740: { label: 'In Opposition Proceeding', category: 'ttab', color: 'red' },
  750: { label: 'Opposition Period Expired', category: 'publication', color: 'blue' },

  // Registration
  800: { label: 'Registered', category: 'registered', color: 'green' },
  810: { label: 'Registered - Section 8 Due', category: 'registered', color: 'amber' },
  820: { label: 'Registered - Section 9 Due', category: 'registered', color: 'amber' },
  830: { label: 'Registered - Renewal Filed', category: 'registered', color: 'green' },

  // Abandonment/Cancellation
  900: { label: 'Abandoned - Failure to Respond', category: 'abandoned', color: 'gray' },
  901: { label: 'Abandoned - Express Abandonment', category: 'abandoned', color: 'gray' },
  902: { label: 'Abandoned - Failure to File Statement of Use', category: 'abandoned', color: 'gray' },
  910: { label: 'Cancelled - Section 8', category: 'cancelled', color: 'gray' },
  911: { label: 'Cancelled - Section 71', category: 'cancelled', color: 'gray' },
  920: { label: 'Expired', category: 'expired', color: 'gray' },
}

export const STATUS_CATEGORIES = {
  application: { label: 'Application', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  examination: { label: 'Examination', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
  office_action: { label: 'Office Action', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
  publication: { label: 'Publication', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  ttab: { label: 'TTAB', bgColor: 'bg-red-100', textColor: 'text-red-800' },
  registered: { label: 'Registered', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  abandoned: { label: 'Abandoned', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
  cancelled: { label: 'Cancelled', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
  expired: { label: 'Expired', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
  appeal: { label: 'Appeal', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
  suspended: { label: 'Suspended', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
}

export function getStatusInfo(code) {
  return STATUS_CODES[code] || { label: `Unknown (${code})`, category: 'unknown', color: 'gray' }
}

export function getStatusCategory(code) {
  const status = getStatusInfo(code)
  return STATUS_CATEGORIES[status.category] || STATUS_CATEGORIES.unknown
}

// Filing Basis codes
export const FILING_BASIS = {
  '1(a)': { label: 'Use in Commerce', description: 'Currently using the mark' },
  '1(b)': { label: 'Intent to Use', description: 'Bona fide intent to use' },
  '44(d)': { label: 'Foreign Priority', description: 'Based on foreign application' },
  '44(e)': { label: 'Foreign Registration', description: 'Based on foreign registration' },
  '66(a)': { label: 'Madrid Protocol', description: 'International registration via WIPO' },
}

export function isMadridProtocol(basis) {
  return basis === '66(a)'
}
