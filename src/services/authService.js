// Admin + landlord auth go to Supabase (bcrypt verified inside Postgres via RPC).
// Student auth still goes to the local XAMPP PHP backend.
import supabase from '../supabaseClient'

const API = 'http://localhost/vut/backend'

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Request failed')
  return json.data ?? json
}

// ── Storage helpers ───────────────────────────────────────────────────────────
const KEYS = {
  student:  'vut_student_session',
  admin:    'vut_admin_session',
  landlord: 'vut_landlord_session'
}

function saveSession(role, data) {
  try { localStorage.setItem(KEYS[role], JSON.stringify(data)) } catch (_) {}
  window.dispatchEvent(new Event('vut_auth_changed'))
}

function clearSession(role) {
  try { localStorage.removeItem(KEYS[role]) } catch (_) {}
  window.dispatchEvent(new Event('vut_auth_changed'))
}

function getSession(role) {
  try {
    const raw = localStorage.getItem(KEYS[role])
    return raw ? JSON.parse(raw) : null
  } catch (_) { return null }
}

// ── Student Auth (Supabase Auth — sends a confirmation email on sign-up) ─────
export const studentAuth = {
  async register(formData) {
    const { data, error } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/student/login`
      }
    })
    if (error) throw new Error(error.message)

    const { error: profileError } = await supabase.from('students').insert([{
      auth_user_id: data.user?.id ?? null,
      name: formData.name.trim(),
      surname: formData.surname.trim(),
      student_number: formData.student_number.trim(),
      id_number: formData.id_number.trim(),
      phone: formData.phone.replace(/\D/g, ''),
      email: formData.email.trim().toLowerCase(),
      dob: formData.dob,
      gender: formData.gender || 'Not specified',
      year_of_study: formData.year_of_study,
      bursary_type: formData.bursary_type || 'NSFAS',
      bursary_other:
        formData.bursary_type === 'Other' ? (formData.bursary_other?.trim() || null) : null
    }])
    if (profileError) throw new Error(profileError.message)

    return { needs_confirmation: true }
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    })
    if (error) throw new Error(error.message)

    const { data: profile } = await supabase
      .from('students')
      .select('*')
      .eq('auth_user_id', data.user.id)
      .maybeSingle()

    const session = {
      id: data.user.id,
      email: data.user.email,
      role: 'student',
      ...(profile || {})
    }
    saveSession('student', session)
    return session
  },

  async logout() {
    try { await supabase.auth.signOut() } catch (_) {}
    clearSession('student')
  },

  getSession() {
    return getSession('student')
  },

  isLoggedIn() {
    return Boolean(getSession('student'))
  }
}

// ── Admin Auth (Supabase) ─────────────────────────────────────────────────────
export const adminAuth = {
  async login(username, password) {
    const { data, error } = await supabase.rpc('verify_admin', {
      p_username: username.trim(),
      p_password: password
    })
    if (error) throw new Error(error.message)
    if (!data) throw new Error('Invalid admin username or password.')
    saveSession('admin', data)
    return data
  },

  logout() {
    clearSession('admin')
  },

  /** Refresh the locally cached admin session (e.g. after profile edits). */
  updateSession(data) {
    saveSession('admin', data)
  },

  getSession() {
    return getSession('admin')
  },

  isLoggedIn() {
    return Boolean(getSession('admin'))
  }
}

// ── Landlord Auth (Supabase) ──────────────────────────────────────────────────
export const landlordAuth = {
  async register(formData) {
    const data = await postJSON(`${API}/landlord_auth.php`, { action: 'register', ...formData })
    saveSession('landlord', data)
    return data
  },

  async login(email, password) {
    const { data, error } = await supabase.rpc('verify_landlord', {
      p_email: email.trim(),
      p_password: password
    })
    if (error) throw new Error(error.message)
    if (!data) throw new Error('Invalid email or password.')
    saveSession('landlord', data)
    return data
  },

  logout() {
    clearSession('landlord')
  },

  getSession() {
    return getSession('landlord')
  },

  isLoggedIn() {
    return Boolean(getSession('landlord'))
  }
}

// ── Legacy compat (Navbar uses authService.getRole) ───────────────────────────
export const authService = {
  getRole() {
    if (adminAuth.isLoggedIn())    return 'admin'
    if (landlordAuth.isLoggedIn()) return 'landlord'
    if (studentAuth.isLoggedIn())  return 'student'
    return 'guest'
  }
}
