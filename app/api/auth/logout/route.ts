import {NextResponse} from "next/server";
import {clearSession} from "../../../../lib/auth";

function sameOrigin(req:Request){
  const origin=req.headers.get("origin");
  if(!origin)return false;
  try{return new URL(origin).host===new URL(req.url).host}catch{return false}
}

export async function POST(req:Request){
  if(!sameOrigin(req))return NextResponse.json({error:"Invalid request origin."},{status:403});
  await clearSession();
  return NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}});
}
