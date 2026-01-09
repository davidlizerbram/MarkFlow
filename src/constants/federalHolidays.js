import { getYear, setMonth, setDate, getDay, addDays, subDays, isWeekend } from 'date-fns'

// US Federal Holidays
// Reference: https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/

/**
 * Get all federal holidays for a given year
 * @param {number} year
 * @returns {Date[]}
 */
export function getFederalHolidays(year) {
  const holidays = []

  // New Year's Day - January 1
  holidays.push(observedDate(new Date(year, 0, 1)))

  // Martin Luther King Jr. Day - Third Monday of January
  holidays.push(nthWeekdayOfMonth(year, 0, 1, 3))

  // Washington's Birthday (Presidents' Day) - Third Monday of February
  holidays.push(nthWeekdayOfMonth(year, 1, 1, 3))

  // Memorial Day - Last Monday of May
  holidays.push(lastWeekdayOfMonth(year, 4, 1))

  // Juneteenth - June 19
  holidays.push(observedDate(new Date(year, 5, 19)))

  // Independence Day - July 4
  holidays.push(observedDate(new Date(year, 6, 4)))

  // Labor Day - First Monday of September
  holidays.push(nthWeekdayOfMonth(year, 8, 1, 1))

  // Columbus Day - Second Monday of October
  holidays.push(nthWeekdayOfMonth(year, 9, 1, 2))

  // Veterans Day - November 11
  holidays.push(observedDate(new Date(year, 10, 11)))

  // Thanksgiving Day - Fourth Thursday of November
  holidays.push(nthWeekdayOfMonth(year, 10, 4, 4))

  // Christmas Day - December 25
  holidays.push(observedDate(new Date(year, 11, 25)))

  return holidays
}

/**
 * Get nth weekday of a month (e.g., 3rd Monday)
 * @param {number} year
 * @param {number} month - 0-indexed
 * @param {number} weekday - 0 = Sunday, 1 = Monday, etc.
 * @param {number} nth - 1st, 2nd, 3rd, etc.
 * @returns {Date}
 */
function nthWeekdayOfMonth(year, month, weekday, nth) {
  const firstDay = new Date(year, month, 1)
  const firstWeekday = getDay(firstDay)
  let dayOffset = weekday - firstWeekday
  if (dayOffset < 0) dayOffset += 7
  const date = 1 + dayOffset + (nth - 1) * 7
  return new Date(year, month, date)
}

/**
 * Get last weekday of a month (e.g., last Monday of May)
 * @param {number} year
 * @param {number} month - 0-indexed
 * @param {number} weekday - 0 = Sunday, 1 = Monday, etc.
 * @returns {Date}
 */
function lastWeekdayOfMonth(year, month, weekday) {
  const lastDay = new Date(year, month + 1, 0)
  const lastWeekday = getDay(lastDay)
  let dayOffset = lastWeekday - weekday
  if (dayOffset < 0) dayOffset += 7
  return new Date(year, month + 1, -dayOffset)
}

/**
 * Get observed date (if holiday falls on weekend, move to nearest weekday)
 * @param {Date} date
 * @returns {Date}
 */
function observedDate(date) {
  const day = getDay(date)
  if (day === 0) return addDays(date, 1) // Sunday -> Monday
  if (day === 6) return subDays(date, 1) // Saturday -> Friday
  return date
}

/**
 * Check if a date is a federal holiday
 * @param {Date} date
 * @returns {boolean}
 */
export function isFederalHoliday(date) {
  const year = getYear(date)
  const holidays = getFederalHolidays(year)

  return holidays.some(holiday =>
    holiday.getFullYear() === date.getFullYear() &&
    holiday.getMonth() === date.getMonth() &&
    holiday.getDate() === date.getDate()
  )
}

/**
 * Check if a date is a business day (not weekend, not federal holiday)
 * @param {Date} date
 * @returns {boolean}
 */
export function isBusinessDay(date) {
  return !isWeekend(date) && !isFederalHoliday(date)
}

/**
 * Get next business day (if date is not a business day)
 * @param {Date} date
 * @returns {Date}
 */
export function getNextBusinessDay(date) {
  let result = new Date(date)
  while (!isBusinessDay(result)) {
    result = addDays(result, 1)
  }
  return result
}
