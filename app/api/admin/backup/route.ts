import {NextResponse} from "next/server";
import {db,ensureSchema} from "../../../../lib/db";
import {isAuthenticated} from "../../../../lib/auth";

export const dynamic="force-dynamic";

export async function GET(){
 if(!(await isAuthenticated()))return NextResponse.json({error:"Unauthorized"},{status:401});
 await ensureSchema();
 const s=db();
 const [records,expenses,collectionAudit,expenseAudit]=await Promise.all([
  s.unsafe("SELECT id,name,mobile,amount::text AS amount,mode,utr,date::text AS date,received_by AS \"receivedBy\",purpose,notes,created_at AS \"createdAt\",updated_at AS \"updatedAt\" FROM collection_records ORDER BY date,created_at"),
  s.unsafe("SELECT id,title,category,amount::text AS amount,date::text AS date,paid_by AS \"paidBy\",notes,created_at AS \"createdAt\",updated_at AS \"updatedAt\" FROM collection_expenses ORDER BY date,created_at"),
  s.unsafe("SELECT id,record_id AS \"recordId\",action,admin_label AS \"adminLabel\",created_at AS \"createdAt\" FROM collection_audit ORDER BY created_at"),
  s.unsafe("SELECT id,expense_id AS \"expenseId\",action,admin_label AS \"adminLabel\",created_at AS \"createdAt\" FROM expense_audit ORDER BY created_at")
 ]);
 const backup={format:"maa-laxmi-puja-collection-backup",version:1,generatedAt:new Date().toISOString(),counts:{records:records.length,expenses:expenses.length,collectionAudit:collectionAudit.length,expenseAudit:expenseAudit.length},records,expenses,collectionAudit,expenseAudit};
 const date=new Date().toISOString().slice(0,10);
 return new NextResponse(JSON.stringify(backup,null,2),{status:200,headers:{"Content-Type":"application/json; charset=utf-8","Content-Disposition":'attachment; filename="puja-collection-backup-'+date+'.json"',"Cache-Control":"private, no-store, max-age=0","X-Content-Type-Options":"nosniff"}});
}
