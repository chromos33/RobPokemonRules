/**
 * Check if the provided password matches the configured password
 */
export function isPasswordValid(password: string | null): boolean {
  const configuredPassword = process.env.PASSWORD
  
  // If no password is configured, allow all operations
  if (!configuredPassword) {
    return true
  }
  
  // Check if provided password matches
  return password === configuredPassword
}

/**
 * Extract password from request URL search params
 */
export function extractPasswordFromRequest(request: Request): string | null {
  const url = new URL(request.url)
  return url.searchParams.get('pw')
}
