// Immutable audit trail: records which admin did what, and when.
import supabase from '../supabaseClient'

export const auditService = {
  /**
   * Record an admin action.
   * @param {object} admin  session object from adminAuth.getSession()
   * @param {string} action e.g. 'APPROVE_BOOKING' | 'DELETE_LANDLORD'
   * @param {string} entityType 'booking' | 'accommodation' | 'student' | 'landlord' | 'admin'
   * @param {string|null} entityId
   * @param {string|null} entityLabel human-friendly name (student no, residence name...)
   * @param {string|null} details extra context
   */
  async log(admin, action, entityType, entityId = null, entityLabel = null, details = null) {
    try {
      await supabase.from('audit_logs').insert([{
        admin_id: admin?.id ?? null,
        admin_username: admin?.username || admin?.email || 'unknown-admin',
        action,
        entity_type: entityType,
        entity_id: entityId ? String(entityId) : null,
        entity_label: entityLabel,
        details
      }])
    } catch (err) {
      // Never block the actual action because logging failed
      console.warn('[auditService.log]', err)
    }
  },

  async getAll(limit = 200) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw new Error(error.message)
    return data || []
  }
}
