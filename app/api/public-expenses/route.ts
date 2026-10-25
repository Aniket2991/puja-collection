import {NextResponse} from "next/server";
import {db,ensureSchema} from "../../../lib/db";

export async function GET(){
 await ensureSchema();
 const rows=await db().unsafe("SELECT id,title,category,amount::text,date::text FROM collection_expenses ORDER BY date DESC,created_at DESC");
 return NextResponse.json(rows,{headers:{"Cache-Control":"no-store, max-age=0"}});
}
