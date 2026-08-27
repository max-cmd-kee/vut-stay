// Bookings live entirely in the Supabase `bookings` table. No local data.
import supabase from '../supabaseClient'

export const bookingService = {
  /**
   * Validate South African Student Booking payload
   */
  validatePayload(payload) {
    const errors = []

    if (!payload.name || payload.name.trim().length < 2) {
      errors.push('Please enter a valid first name.')
    }
    if (!payload.surname || payload.surname.trim().length < 2) {
      errors.push('Please enter a valid surname.')
    }
    if (!payload.student_number || !/^\d{9}$/.test(payload.student_number.trim())) {
      errors.push('Student number must be exactly 9 digits (e.g. 221045892).')
    }
    if (!payload.id_number || !/^\d{13}$/.test(payload.id_number.trim())) {
      errors.push('South African ID number must be exactly 13 digits.')
    }
    if (!payload.phone_number || !/^\d{10}$/.test(payload.phone_number.replace(/\D/g, ''))) {
      errors.push('Phone number must be a valid 10-digit South African mobile number.')
    }
    if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
      errors.push('Please enter a valid email address.')
    }
    if (!payload.dob) {
      errors.push('Please provide your date of birth.')
    }
    if (!payload.accommodation) {
      errors.push('Please choose a preferred accommodation residence.')
    }

    if (payload.bursary_type === 'NSFAS' && (!payload.nsfas_reference || payload.nsfas_reference.trim() === '')) {
      errors.push('NSFAS applicants must provide a valid NSFAS reference number or application ID.')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  /**
   * Resolve an accommodation name (from the booking wizard) to its DB id.
   */
  async resolveAccommodationId(accName) {
    if (!accName) return null
    const { data } = await supabase
      .from('accommodations')
      .select('id')
      .eq('acc_name', accName)
      .maybeSingle()
    return data?.id ?? null
  },

  /**
   * Submit new booking application — stored in Supabase.
   */
  async submit(data) {
    const validation = this.validatePayload(data)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(' '))
    }

    const studentNumber = data.student_number.trim()

    // Enforce "one active booking per student" in the database itself
    const { data: existing } = await supabase
      .from('bookings')
      .select('id, booking_ref')
      .eq('student_number', studentNumber)
      .in('booking_status', ['Pending', 'Approved'])
      .limit(1)

    if (existing && existing.length > 0) {
      throw new Error(
        `An active booking (${existing[0].booking_ref || '#' + existing[0].id.slice(0, 8)}) already exists for student number ${studentNumber}.`
      )
    }

    const accommodationId = data.accommodation_id || await this.resolveAccommodationId(data.accommodation)

    const year = new Date().getFullYear()
    const bookingRef = `VUT-${year}-${Math.floor(1000 + Math.random() * 9000)}`

    const row = {
      booking_ref: bookingRef,
      name: data.name.trim(),
      surname: data.surname.trim(),
      student_number: studentNumber,
      id_number: data.id_number.trim(),
      phone_number: data.phone_number.replace(/\D/g, ''),
      email: data.email.trim(),
      dob: data.dob,
      year_of_study: Number(data.year_of_study) || 1,
      bursary_type: data.bursary_type || 'NSFAS',
      nsfas_status: data.bursary_type === 'NSFAS' ? (data.nsfas_status || 'Pending') : null,
      nsfas_reference: data.bursary_type === 'NSFAS' ? (data.nsfas_reference || null) : null,
      accommodation_id: accommodationId,
      accommodation: data.accommodation || null,
      room_type: data.room_type || null,
      room_number: data.room_number || null,
      check_in: data.check_in || null,
      check_out: data.check_out || null,
      booking_status: 'Pending'
    }

    const { data: created, error } = await supabase
      .from('bookings')
      .insert([row])
      .select()
      .single()

    if (error) throw new Error(error.message)
    return created
  },

  /**
   * Get all bookings with filtering & search (server-side where possible).
   */
  async getAll(filters = {}) {
    let query = supabase
      .from('bookings')
      .select('*')
      .order('registered_at', { ascending: false })

    if (filters.status && filters.status !== 'all') {
      const s = filters.status.toLowerCase()
      query = query.eq(
        'booking_status',
        s.charAt(0).toUpperCase() + s.slice(1)
      )
    }

    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.trim()
      query = query.or(
        [
          `name.ilike.%${q}%`,
          `surname.ilike.%${q}%`,
          `student_number.eq.${q}`,
          `email.ilike.%${q}%`,
          `accommodation.ilike.%${q}%`,
          `booking_ref.ilike.%${q}%`
        ].join(',')
      )
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data || []
  },

  /**
   * Get bookings for a specific student number.
   */
  async getByStudentNumber(studentNumber) {
    if (!studentNumber) return []
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .ilike('student_number', String(studentNumber).trim())
      .order('registered_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data || []
  },

  /**
   * Get all bookings for the given accommodations (landlord applications view).
   */
  async getByAccommodationIds(accommodationIds) {
    if (!Array.isArray(accommodationIds) || accommodationIds.length === 0) return []
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .in('accommodation_id', accommodationIds)
      .order('registered_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data || []
  },

  /**
   * Update booking status & room assignment.
   */
  async updateStatus(id, { status, roomNumber, checkIn, checkOut }) {
    const patch = { updated_at: new Date().toISOString() }
    if (status !== undefined) patch.booking_status = status
    if (roomNumber !== undefined) patch.room_number = roomNumber
    if (checkIn !== undefined) patch.check_in = checkIn
    if (checkOut !== undefined) patch.check_out = checkOut

    const { data, error } = await supabase
      .from('bookings')
      .update(patch)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  /**
   * Delete or withdraw a booking.
   */
  async delete(id) {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)
    if (error) throw new Error(error.message)
    return true
  }
}
