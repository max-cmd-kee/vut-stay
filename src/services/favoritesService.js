const FAVORITES_KEY = 'vut_favorite_accommodations'

export const favoritesService = {
  getFavorites() {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  },

  isFavorite(id) {
    const list = this.getFavorites()
    return list.includes(String(id))
  },

  toggleFavorite(id) {
    const idStr = String(id)
    const list = this.getFavorites()
    let updated
    if (list.includes(idStr)) {
      updated = list.filter((item) => item !== idStr)
    } else {
      updated = [...list, idStr]
    }
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('vut_favorites_changed', { detail: updated }))
    } catch (e) {
      console.error('Failed to save favorite', e)
    }
    return updated.includes(idStr)
  }
}
