import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for reference
/**
 * @typedef {Object} Matter
 * @property {string} id
 * @property {string} serial_num
 * @property {string} [reg_num]
 * @property {string} mark_text
 * @property {string} client_id
 * @property {number} status_code
 * @property {string} filing_date
 * @property {string} [reg_date]
 * @property {string} filing_basis - e.g., '1(a)', '1(b)', '44(d)', '44(e)', '66(a)'
 * @property {string} [image_url]
 * @property {string} [goods_services]
 * @property {string} [attorney_notes]
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Deadline
 * @property {string} id
 * @property {string} matter_id
 * @property {string} deadline_type - e.g., 'office_action', 'section_8', 'section_9', 'opposition'
 * @property {string} due_date
 * @property {'open' | 'completed'} status
 * @property {boolean} is_extended
 * @property {string} [notes]
 * @property {string} created_at
 */

/**
 * @typedef {Object} TTABProceeding
 * @property {string} id
 * @property {string} matter_id
 * @property {string} proceeding_num
 * @property {'opposition' | 'cancellation'} type
 * @property {string} current_phase - e.g., 'Pleadings', 'Discovery', 'Trial', 'Appeal'
 * @property {string} last_sync
 * @property {string} created_at
 */

/**
 * @typedef {Object} Client
 * @property {string} id
 * @property {string} name
 * @property {string} contact_email
 * @property {string} created_at
 */
