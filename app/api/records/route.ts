import {NextResponse} from "next/server";import {db,ensureSchema} from "../../../lib/db";import {isAuthenticated} from "../../../lib/auth";
const audit=async(recordId:string,action:"CREATE"|"UPDATE"|"DELETE")=>{await db().unsafe("INSERT INTO collection_audit (id,record_id,action) VALUES ($1,$2,$3)",[crypto.randomUUID(),recordId,action])};
export async function GET(req:Request){
  await ensureSchema();
  const admin=await isAuthenticated(),s=db(),q=new URL(req.url).searchParams.get("q")?.trim()||"",p="%"+q+"%";
  const cols=admin
    ?"id,name,mobile,amount::text,mode,utr,date::text,received_by AS \"receivedBy\",purpose,notes"
    :"id,name,CASE WHEN mobile<>'' THEN CASE WHEN length(mobile)>4 THEN repeat('•',4)||right(mobile,4) ELSE repeat('•',4) END ELSE '' END AS mobile,amount::text,mode,CASE WHEN utr<>'' THEN CASE WHEN length(utr)>4 THEN repeat('•',4)||right(utr,4) ELSE repeat('•',4) END ELSE '' END AS utr,date::text,received_by AS \"receivedBy\",purpose,notes";
  const where=admin
    ?"name ILIKE $1 OR mobile ILIKE $1 OR utr ILIKE $1 OR received_by ILIKE $1 OR purpose ILIKE $1"
    :"name ILIKE $1 OR purpose ILIKE $1";
  const rows=q
    ?await s.unsafe(`SELECT ${cols} FROM collection_records WHERE ${where} ORDER BY date DESC,created_at DESC`,[p])
    :await s.unsafe(`SELECT ${cols} FROM collection_records ORDER BY date DESC,created_at DESC`);
  return NextResponse.json(rows);
}
export async function POST(req:Request){
  if(!(await isAuthenticated()))return NextResponse.json({error:"Unauthorized"},{status:401});
  const x=await req.json().catch(()=>null),name=String(x?.name||"").trim(),mobile=String(x?.mobile||"").trim(),mode=String(x?.mode||"UPI"),utr=String(x?.utr||"").trim(),date=String(x?.date||new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata"}).format(new Date())).trim(),receivedBy=String(x?.receivedBy||"").trim(),purpose=String(x?.purpose||"Donation").trim(),notes=String(x?.notes||"").trim(),amount=x?.amount===""||x?.amount==null?0:Number(x?.amount);
  if(!Number.isFinite(amount)||amount<0||!["UPI","Cash","Bank"].includes(mode)||!/^\d{4}-\d{2}-\d{2}$/.test(date))return NextResponse.json({error:"Please enter valid values."},{status:400});
  await ensureSchema();
  const id=crypto.randomUUID();
  try{
    await db().unsafe("INSERT INTO collection_records (id,name,mobile,amount,mode,utr,date,received_by,purpose,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",[id,name,mobile,amount,mode,utr,date,receivedBy,purpose,notes]);
    await audit(id,"CREATE");
    return NextResponse.json({id},{status:201});
  }catch(e:any){
    if(e?.code==="23505")return NextResponse.json({error:"This UPI UTR is already recorded."},{status:409});
    throw e;
  }
}
