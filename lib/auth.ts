/**
 * Check if the provided password matches the configured password
 */
export function isPasswordValid(password: string | null): boolean {
  const configuredPassword = process.env.PASSWORD
  
  // If no password is configured, allow all operations
  if (!configuredPassword) {
    return true
  }
  
  // If no password provided, deny access
  if (!password) {
    return false
  }
  
  // Use constant-time comparison to prevent timing attacks
  // Both strings are converted to buffers for comparison
  try {
    const crypto = require('crypto')
    const passwordBuffer = Buffer.from(password, 'utf8')
    const configuredBuffer = Buffer.from(configuredPassword, 'utf8')
    
    // Ensure buffers are same length before comparison
    if (passwordBuffer.length !== configuredBuffer.length) {
      return false
    }
    
    return crypto.timingSafeEqual(passwordBuffer, configuredBuffer)
  } catch (error) {
    // Fallback to simple comparison if crypto fails (shouldn't happen)
    return password === configuredPassword
  }
}

/**
 * Extract password from request URL search params
 */
export function extractPasswordFromRequest(request: Request): string | null {
  const url = new URL(request.url)
  return url.searchParams.get('pw')
}
