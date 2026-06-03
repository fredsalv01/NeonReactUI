/**
 * Generates a unique filename using UUID + timestamp
 * Format: {uuid}-{YYYYMMDD-HHMMSS}.{extension}
 * Example: a1b2c3d4-e5f6-4g7h-8i9j-20260603-145930.png
 */
export const generateFileName = (file) => {
  if (!file || !file.type) {
    throw new Error('File object is required')
  }

  // Get file extension
  const extension = file.name.split('.').pop().toLowerCase()

  // Generate UUID using native crypto API
  const uuid = crypto.randomUUID()

  // Get current date and time
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  const dateTime = `${year}${month}${day}-${hours}${minutes}${seconds}`

  return `${uuid}-${dateTime}.${extension}`
}

/**
 * Alternative: Shorter version with just timestamp
 * Format: {uuid}-{timestamp}.{extension}
 * Example: a1b2c3d4-e5f6-4g7h-8i9j-1780517018801.png
 */
export const generateFileNameShort = (file) => {
  if (!file || !file.type) {
    throw new Error('File object is required')
  }

  const extension = file.name.split('.').pop().toLowerCase()
  const uuid = crypto.randomUUID().substring(0, 13) // First 13 chars of UUID
  const timestamp = Date.now()

  return `${uuid}-${timestamp}.${extension}`
}
