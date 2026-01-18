/**
 * Check if the provided password matches the configured password
 */
export function isPasswordValid(password: string | null): boolean {
  const configuredPassword = process.env.PASSWORD
  
  // If no password is configured, allow all operations
  if (!configuredPassword) {
    console.log('[Auth] No PASSWORD env var configured, allowing all operations')
    return true
  }
  
  // If no password provided, deny access
  if (!password) {
    console.log('[Auth] No password provided, denying access')
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
      console.log('[Auth] Password length mismatch, denying access')
      return false
    }
    
    const isValid = crypto.timingSafeEqual(passwordBuffer, configuredBuffer)
    console.log('[Auth] Password comparison result:', isValid ? 'valid' : 'invalid')
    return isValid
  } catch (error) {
    console.error('[Auth] Error during password comparison:', error)
    // Fallback to simple comparison if crypto fails (shouldn't happen)
    return password === configuredPassword
  }
}

/**
 * Extract password from request URL search params
 */
export function extractPasswordFromRequest(request: Request): string | null {
  const url = new URL(request.url)
  const pw = url.searchParams.get('pw')
  // Don't log the full URL as it contains the password in query params
  console.log('[Auth] Extracting password from request path:', url.pathname)
  console.log('[Auth] Password extracted:', pw ? 'yes (length: ' + pw.length + ')' : 'no')
  return pw
}
