import {cookies} from "next/headers";
import {createHmac,timingSafeEqual} from "node:crypto";
const COOKIE="puja_admin_session";
const SESSION_SECONDS=8*60*60;
function configuredPassword(){return process.env.ADMIN_PASSWORD||""}
function signature(timestamp:string){return createHmac("sha256",configuredPassword()).update("puja-admin-session:"+timestamp).digest("hex")}
export function validPassword(password:string){
 const configured=configuredPassword();
 if(!configured||typeof password!=="string")return false;
 const supplied=Buffer.from(password,"utf8"),expected=Buffer.from(configured,"utf8");
 return supplied.length===expected.length&&timingSafeEqual(supplied,expected);
}
export async function isAuthenticated(){
 if(!configuredPassword())return false;
 const store=await cookies(),value=store.get(COOKIE)?.value;
 if(!value)return false;
 const parts=value.split(".");if(parts.length!==2)return false;
 const [timestamp,provided]=parts;
 if(!/^\d{10,13}$/.test(timestamp)||!/^[a-f0-9]{64}$/.test(provided))return false;
 const issuedAt=Number(timestamp),now=Date.now();
 if(!Number.isSafeInteger(issuedAt)||issuedAt>now+60000||now-issuedAt>SESSION_SECONDS*1000)return false;
 const expected=Buffer.from(signature(timestamp),"hex"),actual=Buffer.from(provided,"hex");
 return expected.length===actual.length&&timingSafeEqual(expected,actual);
}
export async function setSession(){
 if(!configuredPassword())throw new Error("ADMIN_PASSWORD is not configured");
 const store=await cookies(),timestamp=String(Date.now()),token=timestamp+"."+signature(timestamp);
 store.set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:SESSION_SECONDS});
}
export async function clearSession(){
 const store=await cookies();
 store.set(COOKIE,"",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:0});
}