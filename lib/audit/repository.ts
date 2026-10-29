import type { Database } from "@/lib/db/client";
import { openDatabase } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";
import type { AuditAction } from "@/lib/audit/types";

export interface AuditEntry { id:number; entityType:string; entityId:string; action:AuditAction; before:unknown; after:unknown; userId:number|null; username:string|null; createdAt:string; restorable:boolean }
export interface AuditFilters { entityType?:string; action?:AuditAction; limit?:number }

export function listAudit(filters:AuditFilters={},options:{db?:Database}={}):AuditEntry[]{
  const db=options.db??database(),where:string[]=[],args:Array<string|number>=[];
  if(filters.entityType){where.push("a.entity_type=?");args.push(filters.entityType);}
  if(filters.action){where.push("a.action=?");args.push(filters.action);}
  args.push(filters.limit??200);
  const rows=db.prepare(`SELECT a.*,u.username FROM audit_log a LEFT JOIN users u ON u.id=a.user_id ${where.length?`WHERE ${where.join(" AND ")}`:""} ORDER BY a.id DESC LIMIT ?`).all(...args) as Array<Record<string,unknown>>;
  return rows.map(row=>({id:Number(row.id),entityType:String(row.entity_type),entityId:String(row.entity_id),action:row.action as AuditAction,before:parse(row.before_json),after:parse(row.after_json),userId:row.user_id==null?null:Number(row.user_id),username:row.username==null?null:String(row.username),createdAt:String(row.created_at),restorable:Date.now()-asUtc(String(row.created_at)).getTime()<=30*86400000&&row.action!=="create"}));
}
export function getAudit(id:number,options:{db?:Database}={}):AuditEntry|undefined{return listAudit({limit:10000},{db:options.db}).find(entry=>entry.id===id);}
function parse(value:unknown):unknown{return value==null?null:JSON.parse(String(value)) as unknown;}
function asUtc(value:string):Date{return new Date(value.includes("T")?value:value.replace(" ","T")+"Z");}
function database():Database{const db=openDatabase();runMigrations(db);return db;}
