import {NextResponse} from "next/server";
import {db,ensureSchema} from "../../../../lib/db";
import {isAuthenticated} from "../../../../lib/auth";
function sameOrigin(req:Request){const origin=req.headers.get("origin");if(!origin)return true;try{return new URL(origin).host===new URL(req.url).host}catch{return false}}
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 if(!sameOrigin(req))return NextResponse.json({error:"Invalid request origin."},{status:403});
 if(!(await isAuthenticated()))return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params,x=await req.json().catch(()=>null),title=String(x?.title||"").trim(),category=String(x?.category||"Other").trim(),amount=x?.amount===""||x?.amount==null?0:Number(x?.amount),date=String(x?.date||"").trim(),paidBy=String(x?.paidBy||"").trim(),notes=String(x?.notes||"").trim();
 if(!title||!Number.isFinite(amount)||amount<0||!/^\d{4}-\d{2}-\d{2}$/.test(date))return NextResponse.json({error:"Please enter a valid expense title, amount and date."},{status:400});
 await ensureSchema();const r=await db().unsafe("UPDATE collection_expenses SET title=$1,category=$2,amount=$3,date=$4,paid_by=$5,notes=$6,updated_at=NOW() WHERE id=$7 RETURNING id",[title,category,amount,date,paidBy,notes,id]);
 if(!r.length)return NextResponse.json({error:"Expense not found."},{status:404});return NextResponse.json({ok:true});
}
export async function DELETE(req:Request,{params}:{params:Promise<{id:string}>}){
 if(!sameOrigin(req))return NextResponse.json({error:"Invalid request origin."},{status:403});
 if(!(await isAuthenticated()))return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;await ensureSchema();const r=await db().unsafe("DELETE FROM collection_expenses WHERE id=$1 RETURNING id",[id]);
 if(!r.length)return NextResponse.json({error:"Expense not found."},{status:404});return NextResponse.json({ok:true});
}