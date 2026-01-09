/**
 * Mock USPTO Service
 * Provides realistic mock data for development and testing
 * Simulates TSDR v1.0, Assignment Search v1.4, and TTAB v3.0 APIs
 */

import { addDays, subDays, subMonths, subYears, format } from 'date-fns'

// Helper to generate dates relative to today
const today = new Date()
const formatDate = (date) => format(date, 'yyyy-MM-dd')

// Mock Clients
export const mockClients = [
  { id: 'client-001', name: 'Acme Corporation', contact_email: 'legal@acme.com' },
  { id: 'client-002', name: 'TechVenture Labs', contact_email: 'ip@techventure.io' },
  { id: 'client-003', name: 'Green Earth Foods', contact_email: 'trademark@greenearth.com' },
  { id: 'client-004', name: 'Luxe Fashion Group', contact_email: 'legal@luxefashion.com' },
  { id: 'client-005', name: 'Nordic Beverages AB', contact_email: 'ip@nordicbev.se' },
]

// Mock Matters (10 realistic trademark applications/registrations)
export const mockMatters = [
  {
    id: 'matter-001',
    serial_num: '97123456',
    reg_num: '6789012',
    mark_text: 'ACME ROCKET',
    client_id: 'client-001',
    status_code: 700,
    filing_date: formatDate(subYears(today, 2)),
    reg_date: formatDate(subMonths(today, 6)),
    filing_basis: '1(a)',
    image_url: null,
    goods_services: 'IC 007. US 013 019 021 023 031 034 035. G & S: Rocket engines; aerospace propulsion systems; jet engines for aircraft',
    trademark_class: '007',
    attorney_notes: null,
  },
  {
    id: 'matter-002',
    serial_num: '97234567',
    reg_num: null,
    mark_text: 'TECHVENTURE AI',
    client_id: 'client-002',
    status_code: 600, // Non-Final Office Action
    filing_date: formatDate(subMonths(today, 8)),
    reg_date: null,
    filing_basis: '1(b)',
    image_url: null,
    goods_services: 'IC 042. US 100 101. G & S: Software as a service (SAAS) featuring artificial intelligence for business analytics; cloud computing services',
    trademark_class: '042',
    attorney_notes: 'Office action received - likelihood of confusion with "TECHVENTURES". Need to prepare response with distinction arguments.',
  },
  {
    id: 'matter-003',
    serial_num: '97345678',
    reg_num: null,
    mark_text: 'GREEN EARTH ORGANIC',
    client_id: 'client-003',
    status_code: 730, // Published for Opposition
    filing_date: formatDate(subMonths(today, 10)),
    reg_date: null,
    filing_basis: '1(a)',
    image_url: null,
    goods_services: 'IC 029. US 046. G & S: Organic vegetable-based snack foods; organic fruit snacks; organic nut-based snack bars',
    trademark_class: '029',
    attorney_notes: null,
  },
  {
    id: 'matter-004',
    serial_num: '97456789',
    reg_num: '6890123',
    mark_text: 'LUXE COUTURE',
    client_id: 'client-004',
    status_code: 810, // Section 8 Due
    filing_date: formatDate(subYears(today, 6)),
    reg_date: formatDate(subYears(today, 5).setMonth(3)), // 5 years + 3 months ago
    filing_basis: '1(a)',
    image_url: null,
    goods_services: 'IC 025. US 022 039. G & S: Clothing, namely, dresses, shirts, pants, jackets, coats; footwear; headwear',
    trademark_class: '025',
    attorney_notes: 'Section 8 declaration coming due. Client confirmed continued use of mark.',
  },
  {
    id: 'matter-005',
    serial_num: '97567890',
    reg_num: null,
    mark_text: 'NORDIC FROST',
    client_id: 'client-005',
    status_code: 600, // Office Action - Madrid Protocol
    filing_date: formatDate(subMonths(today, 4)),
    reg_date: null,
    filing_basis: '66(a)', // Madrid Protocol
    image_url: null,
    goods_services: 'IC 032. US 045 046 048. G & S: Non-alcoholic beverages, namely, carbonated soft drinks, energy drinks, and flavored waters',
    trademark_class: '032',
    attorney_notes: 'WIPO designation. 6-month response deadline - NO EXTENSION AVAILABLE.',
  },
  {
    id: 'matter-006',
    serial_num: '97678901',
    reg_num: '6901234',
    mark_text: 'ACME THUNDERBOLT',
    client_id: 'client-001',
    status_code: 700,
    filing_date: formatDate(subYears(today, 3)),
    reg_date: formatDate(subYears(today, 1)),
    filing_basis: '1(a)',
    image_url: null,
    goods_services: 'IC 009. US 021 023 026 036 038. G & S: Electrical power supplies; batteries; battery chargers',
    trademark_class: '009',
    attorney_notes: null,
  },
  {
    id: 'matter-007',
    serial_num: '97789012',
    reg_num: null,
    mark_text: 'INNOVATE360',
    client_id: 'client-002',
    status_code: 740, // In Opposition Proceeding
    filing_date: formatDate(subMonths(today, 14)),
    reg_date: null,
    filing_basis: '1(b)',
    image_url: null,
    goods_services: 'IC 035. US 100 101 102. G & S: Business consulting services; business management consulting; marketing consulting services',
    trademark_class: '035',
    attorney_notes: 'Opposition filed by Innovation Holdings LLC. Discovery phase ongoing.',
  },
  {
    id: 'matter-008',
    serial_num: '97890123',
    reg_num: null,
    mark_text: 'PURE HARVEST',
    client_id: 'client-003',
    status_code: 250, // Intent-to-Use Processing
    filing_date: formatDate(subMonths(today, 12)),
    reg_date: null,
    filing_basis: '1(b)',
    image_url: null,
    goods_services: 'IC 031. US 001 046. G & S: Fresh fruits and vegetables; agricultural products, namely, grains and seeds',
    trademark_class: '031',
    attorney_notes: 'NOA issued. Statement of Use deadline approaching. Client preparing specimens.',
  },
  {
    id: 'matter-009',
    serial_num: '97901234',
    reg_num: '6912345',
    mark_text: 'VELVET TOUCH',
    client_id: 'client-004',
    status_code: 820, // Section 9 Due
    filing_date: formatDate(subYears(today, 11)),
    reg_date: formatDate(subYears(today, 10).setMonth(2)),
    filing_basis: '1(a)',
    image_url: null,
    goods_services: 'IC 003. US 001 004 006 050 051 052. G & S: Cosmetics; skin care preparations; body lotions; perfumes',
    trademark_class: '003',
    attorney_notes: 'Section 9 renewal due. Client confirmed intent to renew.',
  },
  {
    id: 'matter-010',
    serial_num: '97012345',
    reg_num: null,
    mark_text: 'CLOUDMESH',
    client_id: 'client-002',
    status_code: 610, // Final Office Action
    filing_date: formatDate(subMonths(today, 11)),
    reg_date: null,
    filing_basis: '1(b)',
    image_url: null,
    goods_services: 'IC 042. US 100 101. G & S: Computer network services; cloud storage services; data backup services',
    trademark_class: '042',
    attorney_notes: 'Final refusal issued. Consider appeal to TTAB or request for reconsideration.',
  },
]

// Mock Deadlines
export const mockDeadlines = [
  {
    id: 'deadline-001',
    matter_id: 'matter-002',
    deadline_type: 'office_action',
    due_date: formatDate(addDays(today, 12)), // Urgent - 12 days
    status: 'open',
    is_extended: false,
    notes: 'Response to Non-Final Office Action',
    issue_date: formatDate(subMonths(today, 2).setDate(15)),
  },
  {
    id: 'deadline-002',
    matter_id: 'matter-003',
    deadline_type: 'opposition',
    due_date: formatDate(addDays(today, 25)),
    status: 'open',
    is_extended: false,
    notes: 'Opposition period expires',
  },
  {
    id: 'deadline-003',
    matter_id: 'matter-004',
    deadline_type: 'section_8',
    due_date: formatDate(addDays(today, 45)),
    status: 'open',
    is_extended: false,
    notes: 'Section 8 & 15 Declaration due',
  },
  {
    id: 'deadline-004',
    matter_id: 'matter-005',
    deadline_type: 'office_action',
    due_date: formatDate(addDays(today, 5)), // Critical - Madrid
    status: 'open',
    is_extended: false,
    notes: 'Madrid Protocol - NO EXTENSION AVAILABLE',
    issue_date: formatDate(subMonths(today, 5).setDate(today.getDate())),
  },
  {
    id: 'deadline-005',
    matter_id: 'matter-007',
    deadline_type: 'ttab_deadline',
    due_date: formatDate(addDays(today, 30)),
    status: 'open',
    is_extended: false,
    notes: 'Discovery responses due',
  },
  {
    id: 'deadline-006',
    matter_id: 'matter-008',
    deadline_type: 'statement_of_use',
    due_date: formatDate(addDays(today, 60)),
    status: 'open',
    is_extended: true,
    notes: 'Statement of Use (1st Extension Filed)',
  },
  {
    id: 'deadline-007',
    matter_id: 'matter-009',
    deadline_type: 'section_9',
    due_date: formatDate(addDays(today, 90)),
    status: 'open',
    is_extended: false,
    notes: 'Section 9 Renewal due',
  },
  {
    id: 'deadline-008',
    matter_id: 'matter-010',
    deadline_type: 'office_action',
    due_date: formatDate(addDays(today, 3)), // Critical
    status: 'open',
    is_extended: true,
    notes: 'Response to Final Office Action (Extension Filed)',
    issue_date: formatDate(subMonths(today, 5).setDate(today.getDate() + 3)),
  },
]

// Mock TTAB Proceedings
export const mockTTABProceedings = [
  {
    id: 'ttab-001',
    matter_id: 'matter-007',
    proceeding_num: '91278456',
    type: 'opposition',
    current_phase: 'Discovery',
    opposer: 'Innovation Holdings LLC',
    filing_date: formatDate(subMonths(today, 6)),
    last_sync: formatDate(subDays(today, 1)),
    events: [
      { date: formatDate(subMonths(today, 6)), description: 'Notice of Opposition filed' },
      { date: formatDate(subMonths(today, 5)), description: 'Answer filed' },
      { date: formatDate(subMonths(today, 4)), description: 'Discovery conference held' },
      { date: formatDate(subMonths(today, 2)), description: 'Initial disclosures exchanged' },
    ],
  },
]

// Service methods mimicking USPTO API responses
export const mockUsptoService = {
  /**
   * Get all matters with joined data
   */
  async getMatters() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mattersWithClients = mockMatters.map(matter => ({
          ...matter,
          client: mockClients.find(c => c.id === matter.client_id),
          deadlines: mockDeadlines.filter(d => d.matter_id === matter.id),
          ttab_proceeding: mockTTABProceedings.find(p => p.matter_id === matter.id),
        }))
        resolve(mattersWithClients)
      }, 300)
    })
  },

  /**
   * Get a single matter by ID
   */
  async getMatterById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const matter = mockMatters.find(m => m.id === id)
        if (!matter) {
          reject(new Error('Matter not found'))
          return
        }
        resolve({
          ...matter,
          client: mockClients.find(c => c.id === matter.client_id),
          deadlines: mockDeadlines.filter(d => d.matter_id === id),
          ttab_proceeding: mockTTABProceedings.find(p => p.matter_id === id),
        })
      }, 200)
    })
  },

  /**
   * Get all clients
   */
  async getClients() {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockClients), 150)
    })
  },

  /**
   * Get deadlines, optionally filtered
   */
  async getDeadlines(filters = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let deadlines = [...mockDeadlines]

        if (filters.urgent) {
          const urgentDate = addDays(today, 30)
          deadlines = deadlines.filter(d =>
            new Date(d.due_date) <= urgentDate && d.status === 'open'
          )
        }

        if (filters.matterId) {
          deadlines = deadlines.filter(d => d.matter_id === filters.matterId)
        }

        // Sort by due date
        deadlines.sort((a, b) => new Date(a.due_date) - new Date(b.due_date))

        resolve(deadlines.map(d => ({
          ...d,
          matter: mockMatters.find(m => m.id === d.matter_id),
        })))
      }, 200)
    })
  },

  /**
   * Get TTAB proceedings
   */
  async getTTABProceedings(matterId = null) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let proceedings = [...mockTTABProceedings]
        if (matterId) {
          proceedings = proceedings.filter(p => p.matter_id === matterId)
        }
        resolve(proceedings)
      }, 200)
    })
  },

  /**
   * Simulate TSDR API call for trademark details
   */
  async getTSDRData(serialNumber) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const matter = mockMatters.find(m => m.serial_num === serialNumber)
        if (!matter) {
          reject(new Error('Serial number not found'))
          return
        }

        // Simulate TSDR response format
        resolve({
          serialNumber: matter.serial_num,
          registrationNumber: matter.reg_num,
          markText: matter.mark_text,
          status: matter.status_code,
          filingDate: matter.filing_date,
          registrationDate: matter.reg_date,
          filingBasis: matter.filing_basis,
          goodsAndServices: matter.goods_services,
          trademarkClass: matter.trademark_class,
          // TSDR-specific fields
          fileWrapperUrl: `https://tsdr.uspto.gov/#caseNumber=${matter.serial_num}&caseType=SERIAL_NO&searchType=statusSearch`,
          documentsUrl: `https://tsdr.uspto.gov/documentviewer?caseId=sn${matter.serial_num}`,
        })
      }, 300)
    })
  },

  /**
   * Get KPI summary statistics
   */
  async getKPISummary() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const urgentDate = addDays(today, 30)
        const urgentDeadlines = mockDeadlines.filter(d =>
          new Date(d.due_date) <= urgentDate && d.status === 'open'
        )

        resolve({
          totalMarks: mockMatters.length,
          urgentDeadlines: urgentDeadlines.length,
          activeTTABProceedings: mockTTABProceedings.length,
          registeredMarks: mockMatters.filter(m => m.reg_num).length,
          pendingApplications: mockMatters.filter(m => !m.reg_num && m.status_code < 700).length,
        })
      }, 150)
    })
  },

  /**
   * Update deadline status
   */
  async updateDeadline(deadlineId, updates) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockDeadlines.findIndex(d => d.id === deadlineId)
        if (index !== -1) {
          mockDeadlines[index] = { ...mockDeadlines[index], ...updates }
          resolve(mockDeadlines[index])
        }
      }, 200)
    })
  },

  /**
   * Update matter notes
   */
  async updateMatterNotes(matterId, notes) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockMatters.findIndex(m => m.id === matterId)
        if (index !== -1) {
          mockMatters[index] = { ...mockMatters[index], attorney_notes: notes }
          resolve(mockMatters[index])
        }
      }, 200)
    })
  },

  /**
   * Search matters by text
   */
  async searchMatters(query) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerQuery = query.toLowerCase()
        const results = mockMatters.filter(m =>
          m.mark_text.toLowerCase().includes(lowerQuery) ||
          m.serial_num.includes(query) ||
          (m.reg_num && m.reg_num.includes(query))
        )
        resolve(results.map(matter => ({
          ...matter,
          client: mockClients.find(c => c.id === matter.client_id),
        })))
      }, 200)
    })
  },

  /**
   * Check for conflicts (similar marks in same class)
   */
  async checkConflicts(markText, trademarkClass) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const words = markText.toLowerCase().split(' ')
        const conflicts = mockMatters.filter(m => {
          if (m.trademark_class !== trademarkClass) return false
          const markWords = m.mark_text.toLowerCase().split(' ')
          return words.some(word => markWords.includes(word))
        })
        resolve(conflicts)
      }, 300)
    })
  },
}

export default mockUsptoService
