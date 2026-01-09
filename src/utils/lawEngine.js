/**
 * MarkFlow Law Engine
 * Critical deadline calculation logic for trademark prosecution
 */

import { addMonths, addYears, differenceInDays, parseISO, format, isAfter, isBefore } from 'date-fns'
import { getNextBusinessDay, isBusinessDay } from '../constants/federalHolidays'
import { isMadridProtocol } from '../constants/statusCodes'

// Dec 3, 2022 - Date when USPTO changed to 3-month response period
const THREE_MONTH_RULE_EFFECTIVE_DATE = new Date(2022, 11, 3)

/**
 * Deadline types supported by the Law Engine
 */
export const DEADLINE_TYPES = {
  OFFICE_ACTION: 'office_action',
  STATEMENT_OF_USE: 'statement_of_use',
  SECTION_8: 'section_8',
  SECTION_8_15: 'section_8_15',
  SECTION_9: 'section_9',
  OPPOSITION: 'opposition',
  RESPONSE_TO_OPPOSITION: 'response_to_opposition',
  TTAB_DEADLINE: 'ttab_deadline',
}

/**
 * Calculate the response deadline for an Office Action
 *
 * Rules:
 * - For Office Actions issued after Dec 3, 2022: 3-month initial deadline
 * - If extension filed: extends to 6 months total
 * - Madrid Protocol (66(a)): Always 6 months, no extension available
 * - If deadline falls on weekend/holiday: Push to next business day
 *
 * @param {string | Date} issueDate - The Office Action mailing date
 * @param {string} filingBasis - The filing basis (e.g., '1(a)', '66(a)')
 * @param {boolean} extensionFiled - Whether an extension has been filed
 * @returns {{ deadline: Date, isExtendable: boolean, maxDeadline: Date, daysRemaining: number }}
 */
export function calculateOfficeActionDeadline(issueDate, filingBasis, extensionFiled = false) {
  const issue = typeof issueDate === 'string' ? parseISO(issueDate) : issueDate
  const today = new Date()

  // Madrid Protocol: Always 6 months, no extension
  if (isMadridProtocol(filingBasis)) {
    const deadline = getNextBusinessDay(addMonths(issue, 6))
    return {
      deadline,
      isExtendable: false,
      maxDeadline: deadline,
      daysRemaining: Math.max(0, differenceInDays(deadline, today)),
      isMadrid: true,
    }
  }

  // Check if 3-month rule applies (Office Actions after Dec 3, 2022)
  const uses3MonthRule = isAfter(issue, THREE_MONTH_RULE_EFFECTIVE_DATE)

  if (uses3MonthRule) {
    // New rule: 3 months initial, extendable to 6 months
    const initialDeadline = addMonths(issue, 3)
    const extendedDeadline = addMonths(issue, 6)

    const currentDeadline = extensionFiled ? extendedDeadline : initialDeadline
    const adjustedDeadline = getNextBusinessDay(currentDeadline)

    return {
      deadline: adjustedDeadline,
      isExtendable: !extensionFiled,
      maxDeadline: getNextBusinessDay(extendedDeadline),
      daysRemaining: Math.max(0, differenceInDays(adjustedDeadline, today)),
      isMadrid: false,
    }
  } else {
    // Old rule: 6 months total
    const deadline = getNextBusinessDay(addMonths(issue, 6))
    return {
      deadline,
      isExtendable: false,
      maxDeadline: deadline,
      daysRemaining: Math.max(0, differenceInDays(deadline, today)),
      isMadrid: false,
    }
  }
}

/**
 * Calculate post-registration maintenance deadlines
 *
 * Section 8 & 15 Combined Declaration: Due between 5th and 6th year after registration
 * Section 9 Renewal: Due every 10 years from registration date
 *
 * @param {string | Date} registrationDate
 * @returns {{ section8: { windowStart: Date, windowEnd: Date, gracePeriodEnd: Date }, section9: { dueDate: Date, gracePeriodEnd: Date } }}
 */
export function calculateMaintenanceDeadlines(registrationDate) {
  const regDate = typeof registrationDate === 'string' ? parseISO(registrationDate) : registrationDate

  // Section 8 & 15: Window is between year 5 and year 6, with 6-month grace period
  const section8WindowStart = addYears(regDate, 5)
  const section8WindowEnd = addYears(regDate, 6)
  const section8GracePeriodEnd = addMonths(section8WindowEnd, 6)

  // Section 9: Due at year 10, with 6-month grace period
  const section9DueDate = addYears(regDate, 10)
  const section9GracePeriodEnd = addMonths(section9DueDate, 6)

  return {
    section8: {
      windowStart: getNextBusinessDay(section8WindowStart),
      windowEnd: getNextBusinessDay(section8WindowEnd),
      gracePeriodEnd: getNextBusinessDay(section8GracePeriodEnd),
    },
    section9: {
      dueDate: getNextBusinessDay(section9DueDate),
      gracePeriodEnd: getNextBusinessDay(section9GracePeriodEnd),
    },
  }
}

/**
 * Calculate Statement of Use deadline for Intent-to-Use applications
 *
 * Initial deadline: 6 months from Notice of Allowance
 * Extensions: Up to 5 additional 6-month extensions available (total 36 months)
 *
 * @param {string | Date} noaDate - Notice of Allowance date
 * @param {number} extensionsUsed - Number of extensions already filed (0-5)
 * @returns {{ deadline: Date, extensionsRemaining: number, maxDeadline: Date, daysRemaining: number }}
 */
export function calculateStatementOfUseDeadline(noaDate, extensionsUsed = 0) {
  const noa = typeof noaDate === 'string' ? parseISO(noaDate) : noaDate
  const today = new Date()

  const monthsExtended = Math.min(extensionsUsed, 5) * 6
  const currentDeadline = addMonths(noa, 6 + monthsExtended)
  const maxDeadline = addMonths(noa, 36) // Maximum 36 months total

  return {
    deadline: getNextBusinessDay(currentDeadline),
    extensionsRemaining: Math.max(0, 5 - extensionsUsed),
    maxDeadline: getNextBusinessDay(maxDeadline),
    daysRemaining: Math.max(0, differenceInDays(currentDeadline, today)),
  }
}

/**
 * Calculate opposition period deadline
 *
 * Standard opposition period: 30 days from publication
 * Extensions: Available with good cause
 *
 * @param {string | Date} publicationDate
 * @param {number} extensionDays - Additional days from extension requests
 * @returns {{ deadline: Date, daysRemaining: number }}
 */
export function calculateOppositionDeadline(publicationDate, extensionDays = 0) {
  const pubDate = typeof publicationDate === 'string' ? parseISO(publicationDate) : publicationDate
  const today = new Date()

  const baseDeadline = new Date(pubDate)
  baseDeadline.setDate(baseDeadline.getDate() + 30 + extensionDays)

  const adjustedDeadline = getNextBusinessDay(baseDeadline)

  return {
    deadline: adjustedDeadline,
    daysRemaining: Math.max(0, differenceInDays(adjustedDeadline, today)),
  }
}

/**
 * Get deadline urgency level for UI heatmap coloring
 *
 * @param {number} daysRemaining
 * @param {string} status - 'open' or 'completed'
 * @returns {'urgent' | 'warning' | 'normal' | 'completed'}
 */
export function getDeadlineUrgency(daysRemaining, status = 'open') {
  if (status === 'completed') return 'completed'
  if (daysRemaining <= 7) return 'urgent'
  if (daysRemaining <= 30) return 'warning'
  return 'normal'
}

/**
 * Format deadline with urgency indicator
 *
 * @param {Date} deadline
 * @param {string} status
 * @returns {{ formatted: string, urgency: string, daysRemaining: number }}
 */
export function formatDeadlineWithUrgency(deadline, status = 'open') {
  const today = new Date()
  const daysRemaining = differenceInDays(deadline, today)
  const urgency = getDeadlineUrgency(daysRemaining, status)

  let formatted = format(deadline, 'MMM d, yyyy')
  if (status === 'open') {
    if (daysRemaining < 0) {
      formatted += ` (${Math.abs(daysRemaining)} days overdue)`
    } else if (daysRemaining === 0) {
      formatted += ' (Due today!)'
    } else if (daysRemaining === 1) {
      formatted += ' (Tomorrow)'
    } else if (daysRemaining <= 7) {
      formatted += ` (${daysRemaining} days)`
    }
  }

  return {
    formatted,
    urgency,
    daysRemaining,
  }
}

/**
 * Calculate all relevant deadlines for a matter
 *
 * @param {Object} matter - The matter object
 * @param {Object[]} deadlines - Existing deadline records
 * @returns {Object[]} Array of calculated deadlines
 */
export function calculateAllDeadlines(matter, existingDeadlines = []) {
  const calculatedDeadlines = []

  // If registered, calculate maintenance deadlines
  if (matter.reg_date) {
    const maintenance = calculateMaintenanceDeadlines(matter.reg_date)

    // Section 8 & 15
    calculatedDeadlines.push({
      type: DEADLINE_TYPES.SECTION_8_15,
      label: 'Section 8 & 15 Declaration',
      windowStart: maintenance.section8.windowStart,
      dueDate: maintenance.section8.windowEnd,
      gracePeriodEnd: maintenance.section8.gracePeriodEnd,
    })

    // Section 9
    calculatedDeadlines.push({
      type: DEADLINE_TYPES.SECTION_9,
      label: 'Section 9 Renewal',
      dueDate: maintenance.section9.dueDate,
      gracePeriodEnd: maintenance.section9.gracePeriodEnd,
    })
  }

  // Add existing deadlines with calculations
  existingDeadlines.forEach(deadline => {
    const info = formatDeadlineWithUrgency(parseISO(deadline.due_date), deadline.status)
    calculatedDeadlines.push({
      ...deadline,
      ...info,
    })
  })

  return calculatedDeadlines
}
