import {NextResponse} from "next/server";import {db,ensureSchema} from "../../../../lib/db";import {isAuthenticated} from "../../../../lib/auth";
const audit=async(recordId:string,action:"UPDATE"|"DELETE")=>{await db().unsafe("INSERT INTO collection_audit (id,record_id,action) VALUES ($1,$2,$3)",[crypto.randomUUID(),recordId,action])};
function sameOrigin(req:Request){const origin=req.headers.get("origin");if(!origin)return true;try{return new URL(origin).host===new URL(req.url).host}catch{return false}}
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
  if(!sameOrigin(req))return NextResponse.json({error:"Invalid request origin."},{status:403});
  if(!(await isAuthenticated()))return NextResponse.json({error:"Unauthorized"},{status:401});
  const {id}=await params,x=await req.json().catch(()=>null),name=String(x?.name||"").trim(),mobile=String(x?.mobile||"").trim(),mode=String(x?.mode||"UPI"),utr=String(x?.utr||"").trim(),date=String(x?.date||new Date().toISOString().slice(0,10)).trim(),receivedBy=String(x?.receivedBy||"").trim(),purpose=String(x?.purpose||"Donation").trim(),notes=String(x?.notes||"").trim(),amount=x?.amount===""||x?.amount==null?0:Number(x?.amount);
  if(!Number.isFinite(amount)||amount<0||!["UPI","Cash","Bank"].includes(mode)||!/^d{4}-d{2}-d{2}$/.test(date))return NextResponse.json({error:"Please enter valid values."},{status:400});
  await ensureSchema();
  try{
    const r=await db().unsafe("UPDATE collection_records SET name=$1,mobile=$2,amount=$3,mode=$4,utr=$5,date=$6,received_by=$7,purpose=$8,notes=$9,updated_at=NOW() WHERE id=$10 RETURNING id",[name,mobile,amount,mode,utr,date,receivedBy,purpose,notes,id]);
    if(!r.length)return NextResponse.json({error:"Record not found."},{status:404});
    await audit(id,"UPDATE");
    return NextResponse.json({ok:true});
  }catch(e:any){
    if(e?.code==="23505")return NextResponse.json({error:"This UPI UTR is already recorded."},{status:409});
    throw e
  }
}
export async function DELETE(req:Request,{params}:{params:Promise<{id:string}>}){
  if(!sameOrigin(req))return NextResponse.json({error:"Invalid request origin."},{status:403});
  if(!(await isAuthenticated()))return NextResponse.json({error:"Unauthorized"},{status:401});
  const {id}=await params;await ensureSchema();
  const r=await db().unsafe("DELETE FROM collection_records WHERE id=$1 RETURNING id",[id]);
  if(!r.length)return NextResponse.json({error:"Record not found."},{status:404});
  await audit(id,"DELETE");
  return NextResponse.json({ok:true})
}
