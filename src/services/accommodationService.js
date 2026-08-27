// Accommodations are served from Supabase (migrated from the legacy PHP backend).
import supabase from '../supabaseClient'

function applyFundingFilter(query, funding_type) {
  if (funding_type === 'nsfas') return query.eq('supports_nsfas', true)
  if (funding_type === 'other') return query.eq('supports_other', true)
  if (funding_type === 'self')  return query.eq('supports_self', true)
  return query
}

export const accommodationService = {
  /**
   * Count of Approved bookings per accommodation id.
   * Used to compute real availability: capacity - approved bookings.
   */
  async getApprovedBookingCounts() {
    const { data, error } = await supabase
      .from('bookings')
      .select('accommodation_id')
      .eq('booking_status', 'Approved')

    const counts = {}
    if (!error && data) {
      for (const b of data) {
        if (b.accommodation_id) {
          counts[b.accommodation_id] = (counts[b.accommodation_id] || 0) + 1
        }
      }
    }
    return counts
  },

  /**
   * Fetch all accommodations from Supabase.
   * Falls back to empty array so the UI can show an empty state gracefully.
   */
  async getAll(params = {}) {
    try {
      let query = applyFundingFilter(
        supabase.from('accommodations').select('*'),
        params.funding_type
      )
      if (params.search && params.search.trim() !== '') {
        query = query.or(
          `acc_name.ilike.%${params.search}%,acc_location.ilike.%${params.search}%,city.ilike.%${params.search}%`
        )
      }
      query = query.order('acc_name', { ascending: true })
        .limit(Number(params.limit) || 50)

      const { data, error } = await query
      if (error) throw error
      const approvedCounts = await this.getApprovedBookingCounts()
      return (data || []).map((row) => normalizeAccommodation(row, approvedCounts))
    } catch (err) {
      console.error('[accommodationService.getAll]', err)
      return []
    }
  },

  /**
   * Fetch a single accommodation by ID.
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('accommodations')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) throw error
      const approvedCounts = await this.getApprovedBookingCounts()
      return data ? normalizeAccommodation(data, approvedCounts) : null
    } catch (err) {
      console.error('[accommodationService.getById]', err)
      return null
    }
  },

  /**
   * Client-side filter + search on top of the DB results.
   */
  async search(filters = {}) {
    // Map funding filter to API param
    const funding_type = filters.funding && filters.funding !== 'all' ? filters.funding : undefined
    const list = await this.getAll({ funding_type, search: filters.query, limit: 100 })

    return list.filter((item) => {
      // Distance filter
      if (filters.maxDistance && Number(filters.maxDistance) > 0) {
        if ((item.distance_km || 0) > Number(filters.maxDistance)) return false
      }

      // Price filter — ONLY applies when viewing self-paying
      if (filters.funding === 'self' && filters.maxPrice && Number(filters.maxPrice) > 0) {
        if ((item.price_per_month || 0) > Number(filters.maxPrice)) return false
      }

      // Room type
      if (filters.roomType && filters.roomType !== 'all') {
        const types = item.room_types || []
        if (!types.some((t) => t.toLowerCase().includes(filters.roomType.toLowerCase()))) return false
      }

      // Amenities
      if (Array.isArray(filters.amenities) && filters.amenities.length > 0) {
        const itemAmenities = (item.amenities || []).map((a) => a.toLowerCase())
        if (!filters.amenities.every((req) => itemAmenities.some((ia) => ia.includes(req.toLowerCase())))) return false
      }

      // Verified only
      if (filters.verifiedOnly && !item.is_verified) return false

      return true
    })
  },

  /**
   * Create a new accommodation (called by Admin / Landlord portal).
   */
  async create(data) {
    const row = {
      fname: data.fname ?? '',
      lname: data.lname ?? '',
      phone: data.phone ?? '',
      email: data.email ?? '',
      address: data.address ?? null,
      city: data.city ?? null,
      acc_name: data.acc_name,
      acc_location: data.acc_location ?? '',
      acc_capacity: Number(data.acc_capacity) || 1,
      acc_contact: data.acc_contact ?? data.email ?? '',
      acc_description: data.acc_description ?? null,
      supports_nsfas: Boolean(data.supports_nsfas),
      supports_other: Boolean(data.supports_other),
      supports_self: Boolean(data.supports_self),
      price_per_month: data.price_per_month ? Number(data.price_per_month) : null,
      landlord_id: data.landlord_id ?? null
    }
    const { data: created, error } = await supabase
      .from('accommodations')
      .insert([row])
      .select()
      .single()
    if (error) throw new Error(error.message)
    const approvedCounts = await this.getApprovedBookingCounts()
    return normalizeAccommodation(created, approvedCounts)
  },

  /**
   * Update an existing accommodation (landlord / admin edits).
   */
  async update(id, patch) {
    const allowed = {}
    const fields = [
      'acc_name', 'acc_location', 'acc_capacity', 'acc_description',
      'address', 'city', 'supports_nsfas', 'supports_other', 'supports_self'
    ]
    for (const f of fields) {
      if (patch[f] !== undefined) allowed[f] = patch[f]
    }
    if (patch.price_per_month !== undefined) {
      allowed.price_per_month = patch.price_per_month ? Number(patch.price_per_month) : null
    }
    if (Object.keys(allowed).length === 0) return null

    const { data, error } = await supabase
      .from('accommodations')
      .update(allowed)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return normalizeAccommodation(data)
  },

  /**
   * All accommodations owned by a specific landlord.
   */
  async getByLandlordId(landlordId) {
    if (!landlordId) return []
    try {
      const { data, error } = await supabase
        .from('accommodations')
        .select('*')
        .eq('landlord_id', landlordId)
        .order('acc_name', { ascending: true })
      if (error) throw error
      const approvedCounts = await this.getApprovedBookingCounts()
      return (data || []).map((row) => normalizeAccommodation(row, approvedCounts))
    } catch (err) {
      console.error('[accommodationService.getByLandlordId]', err)
      return []
    }
  },

  /**
   * Delete an accommodation (admin / owner landlord).
   */
  async delete(id) {
    const { error } = await supabase
      .from('accommodations')
      .delete()
      .eq('id', id)
    if (error) console.error('[accommodationService.delete]', error)
    return !error
  }
}

/**
 * Normalise a raw DB row into the shape the UI expects.
 */
function normalizeAccommodation(row, approvedCounts = {}) {
  const capacity = Number(row.acc_capacity) || 0
  const approved = approvedCounts[row.id] || 0

  const images = []
  if (row.profile_img) images.push(row.profile_img)
  if (row.accommodation_images?.length) {
    row.accommodation_images.forEach((img) => {
      const src = img.image_path || img
      if (!images.includes(src)) images.push(src)
    })
  }
  if (images.length === 0) images.push('/images/main-res.jpg')

  return {
    ...row,
    id: String(row.id),
    // Real availability from the database: capacity minus approved bookings
    available_spaces: Math.max(0, capacity - approved),
    // Only expose a price when explicitly self-paying supported
    price_per_month: row.supports_self ? (row.price_per_month || null) : null,
    distance_km: row.distance_km || null,
    is_verified: true,
    is_accredited: Boolean(row.supports_nsfas),
    room_types: row.room_types || ['Single Room', '2-Sharing Room'],
    images,
    amenities: row.amenities || (row.accommodation_amenities?.map((a) => a.amenity) || [])
  }
}
