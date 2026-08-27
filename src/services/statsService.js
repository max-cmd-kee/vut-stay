import { accommodationService } from './accommodationService'
import { bookingService } from './bookingService'

export const statsService = {
  async getDashboardStats() {
    const [accommodations, bookings] = await Promise.all([
      accommodationService.getAll(),
      bookingService.getAll()
    ])

    const totalAccommodations = accommodations.length
    const totalBookings = bookings.length

    const approvedBookings = bookings.filter((b) => b.booking_status === 'Approved')
    const pendingBookings = bookings.filter((b) => b.booking_status === 'Pending')
    const rejectedBookings = bookings.filter((b) => b.booking_status === 'Rejected')

    const nsfasStudents = bookings.filter((b) => b.bursary_type === 'NSFAS').length
    const privateStudents = bookings.filter((b) => b.bursary_type === 'Private').length
    const selfPayingStudents = bookings.filter((b) => b.bursary_type === 'Self-paying' || b.bursary_type === 'Self paying' || b.bursary_type === 'Other').length

    // Calculate total beds capacity & occupied beds
    const totalCapacity = accommodations.reduce((acc, curr) => acc + (Number(curr.acc_capacity) || 0), 0)
    const occupiedCapacity = approvedBookings.length
    const occupancyRate = totalCapacity > 0 ? Math.min(100, Math.round((occupiedCapacity / totalCapacity) * 100)) : 0

    // Unique student count
    const uniqueStudents = new Set(bookings.map((b) => b.student_number)).size

    return {
      total_bookings: totalBookings,
      total_students: uniqueStudents || totalBookings,
      nsfas_students: nsfasStudents,
      private_students: privateStudents,
      self_paying_students: selfPayingStudents,
      total_accommodations: totalAccommodations,
      total_capacity: totalCapacity,
      occupied_capacity: occupiedCapacity,
      occupancy_rate: occupancyRate,
      status_counts: {
        Approved: approvedBookings.length,
        Pending: pendingBookings.length,
        Rejected: rejectedBookings.length
      },
      funding_breakdown: {
        nsfas_accredited: accommodations.filter((a) => a.supports_nsfas).length,
        other_bursaries: accommodations.filter((a) => a.supports_other).length,
        self_paying: accommodations.filter((a) => a.supports_self).length
      },
      recent_bookings: bookings.slice(0, 6)
    }
  }
}
