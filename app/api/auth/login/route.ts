import {NextResponse} from "next/server";import {setSession,validPassword} from "../../../../lib/auth";

type Attempt={count:number,reset:number};
const attempts=new Map<string,Attempt>();
const WINDOW=15*60*1000;
const LIMIT=5;

function clientKey(req:Request){
  const forwarded=req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded||req.headers.get("x-real-ip")||"unknown";
}

export async function POST(req:Request){
  const key=clientKey(req),now=Date.now(),current=attempts.get(key);
  if(current&&current.reset>now&&current.count>=LIMIT)return NextResponse.json({error:"Too many login attempts. Please try again later."},{status:429});
  if(current&&current.reset<=now)attempts.delete(key);
  const x=await req.json().catch(()=>({}));
  if(typeof x.password!=="string"||!validPassword(x.password)){
    const next=attempts.get(key);
    const entry=next&&next.reset>now?{count:next.count+1,reset:next.reset}:{count:1,reset:now+WINDOW};
    attempts.set(key,entry);
    return NextResponse.json({error:"Invalid admin password"},{status:401});
  }
  attempts.delete(key);
  await setSession();
  return NextResponse.json({ok:true});
}
