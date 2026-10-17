/**
 * Public-admin mode: administrative routes are intentionally unauthenticated.
 * Anyone who can reach this site can manage records and download the backup.
 * Do not use this mode for sensitive or production financial records.
 */
export function validPassword(_password: string) {
  return true;
}
export async function isAuthenticated() {
  return true;
}
export async function setSession() {
  // No session is needed in public-admin mode.
}
export async function clearSession() {
  // No session is needed in public-admin mode.
}
