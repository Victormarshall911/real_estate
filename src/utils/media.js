/**
 * Utility for normalizing media URLs (images, videos, documents) across local and production environments.
 * Prevents broken image references when local uploaded files are requested against cloud endpoints or vice versa.
 */

export function getMediaUrl(pathOrUrl) {
  if (!pathOrUrl) return null

  if (typeof pathOrUrl !== 'string') return null

  // If already full protocol URL or data URI, return directly
  if (
    pathOrUrl.startsWith('http://') ||
    pathOrUrl.startsWith('https://') ||
    pathOrUrl.startsWith('data:') ||
    pathOrUrl.startsWith('blob:')
  ) {
    // If it points to onrender.com/media/ but we are running locally against a local API, map it to local API host
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'
    if (apiBase.includes('localhost') && pathOrUrl.includes('real-estate-api-orbx.onrender.com/media/')) {
      const mediaPath = pathOrUrl.split('real-estate-api-orbx.onrender.com')[1]
      const origin = new URL(apiBase).origin
      return `${origin}${mediaPath}`
    }
    return pathOrUrl
  }

  // If relative path (e.g. /media/profile_photos/avatar.jpg), extract base host from VITE_API_URL
  if (pathOrUrl.startsWith('/')) {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1'
    try {
      const origin = new URL(apiBase).origin
      return `${origin}${pathOrUrl}`
    } catch {
      return `http://localhost:8001${pathOrUrl}`
    }
  }

  return pathOrUrl
}
