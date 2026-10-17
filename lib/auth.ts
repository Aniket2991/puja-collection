// Admin password protection intentionally disabled at the owner's request.
// WARNING: every caller is treated as an administrator. Do not use with sensitive
// financial or contributor data on a public website.
export function validPassword(_password:string){return true}
export async function isAuthenticated(){return true}
export async function setSession(){}
export async function clearSession(){}
