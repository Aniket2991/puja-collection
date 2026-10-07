import {cookies} from "next/headers";
import {createHmac,timingSafeEqual} from "crypto";
const COOKIE="puja_admin_session";
function token(){const secret=process.env.ADMIN_PASSWORD;if(!secret)throw new Error("ADMIN_PASSWORD is not configured");return createHmac("sha256",secret).update("puja-admin-session").digest("hex")}
export function validPassword(password:string){const expected=process.env.ADMIN_PASSWORD;if(!expected)return false;const a=Buffer.from(password),b=Buffer.from(expected);return a.length===b.length&&timingSafeEqual(a,b)}
export async function isAuthenticated(){const c=await cookies();return c.get(COOKIE)?.value===token()}
export async function setSession(){const c=await cookies();c.set(COOKIE,token(),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:86400})}
export async function clearSession(){const c=await cookies();c.delete(COOKIE)}