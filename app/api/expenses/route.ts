import {NextResponse} from "next/server";
import {db,ensureSchema} from "../../../lib/db";
import {isAuthenticated} from "../../../lib/auth";
function sameOrigin(req:Request){const origin=req.headers.get("origin");if(!origin)return true;try{return new URL(origin).host===new URL(req.url).host}catch{return false}}
const indiaDate=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
export async function GET(req:Request){
 if(!(await isAuthenticated()))return NextResponse.json({error:"Unauthorized"},{status:401});
 await ensureSchema(); const s=db(),q=new URL(req.url).searchParams.get("q")?.trim()||"",p="%"+q+"%";
 const rows=q?await s.unsafe("SELECT id,title,category,amount::text,date::text,paid_by AS \"paidBy\",notes FROM collection_expenses WHERE title ILIKE $1 OR category ILIKE $1 OR paid_by ILIKE $1 OR notes ILIKE $1 ORDER BY date DESC,created_at DESC",[p]):await s.unsafe("SELECT id,title,category,amount::text,date::text,paid_by AS \"paidBy\",notes FROM collection_expenses ORDER BY date DESC,created_at DESC");
 return NextResponse.json(rows,{headers:{"Cache-Control":"private, no-store, max-age=0"}});
}
export async function POST(req:Request){
 if(!sameOrigin(req))return NextResponse.json({error:"Invalid request origin."},{status:403});
 if(!(await isAuthenticated()))return NextResponse.json({error:"Unauthorized"},{status:401});
 const x=await req.json().catch(()=>null),title=String(x?.title||"").trim(),category=String(x?.category||"Other").trim(),amount=x?.amount===""||x?.amount==null?0:Number(x?.amount),date=String(x?.date||indiaDate()).trim(),paidBy=String(x?.paidBy||"").trim(),notes=String(x?.notes||"").trim();
 if(!title||!Number.isFinite(amount)||amount<0||!/^\d{4}-\d{2}-\d{2}$/.test(date))return NextResponse.json({error:"Please enter a valid expense title, amount and date."},{status:400});
 await ensureSchema();const id=crypto.randomUUID();
 await db().unsafe("INSERT INTO collection_expenses (id,title,category,amount,date,paid_by,notes) VALUES ($1,$2,$3,$4,$5,$6,$7)",[id,title,category,amount,date,paidBy,notes]);
 return NextResponse.json({id},{status:201});
}