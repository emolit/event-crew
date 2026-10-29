import type { Database } from "@/lib/db/client";
import { openDatabase } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";
import type { ActionResult } from "@/lib/admin/action-result";
import { getAudit } from "@/lib/audit/repository";
import { recordAudit } from "@/lib/audit/types";
import type { ClientRecord, FooterContent, HomepageContent, PersonnelRecord, ProjectRecord } from "@/lib/content/types";

interface Options { db?: Database }
export interface PurgeReport { projects:number; personnel:number; clients:number; projectImages:number; media:number }

export function restoreAuditEntry(id:number, actorId:number, options:Options={}):ActionResult<{restoredAuditId:number}>{
  const db=options.db??database(); const entry=getAudit(id,{db});
  if(!entry)return{ok:false,message:"Запись истории не найдена"};
  if(!entry.restorable)return{ok:false,message:"Срок восстановления истёк"};
  try{return transaction(db,()=>{verifyMedia(db,entry.before);applySnapshot(db,entry.entityType,entry.entityId,entry.before);const restoredAuditId=recordAudit(db,{entityType:entry.entityType,entityId:entry.entityId,action:"restore",before:entry.after,after:entry.before,userId:actorId});return{ok:true,data:{restoredAuditId}};});}
  catch(error){return{ok:false,message:error instanceof Error?error.message:"Не удалось восстановить"};}
}

function applySnapshot(db:Database,type:string,id:string,snapshot:unknown):void{
  if(type==="personnel"){const s=snapshot as PersonnelRecord;restoreOrderedRow(db,"personnel",Number(id),s.sortOrder);db.prepare("UPDATE personnel SET name=?,description=?,price=?,media_id=?,alt=?,deleted_at=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(s.name,s.description,s.price,s.mediaId,s.alt,Number(id));return;}
  if(type==="project"){const s=snapshot as ProjectRecord;restoreOrderedRow(db,"projects",Number(id),s.sortOrder);db.prepare("UPDATE projects SET title=?,type=?,roles_json=?,detail_title=?,description=?,size=?,deleted_at=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(s.title,s.type,JSON.stringify(s.roles),s.detailTitle,s.description,s.size,Number(id));db.prepare("UPDATE project_images SET deleted_at=CURRENT_TIMESTAMP WHERE project_id=? AND deleted_at IS NULL").run(Number(id));const q=db.prepare("INSERT INTO project_images(project_id,media_id,alt,sort_order)VALUES(?,?,?,?)");s.images.forEach((image,index)=>q.run(Number(id),image.mediaId,image.alt,index));return;}
  if(type==="client"){const s=snapshot as ClientRecord;restoreOrderedRow(db,"clients",Number(id),s.sortOrder);db.prepare("UPDATE clients SET name=?,media_id=?,alt=?,website_url=?,is_visible=?,deleted_at=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(s.name,s.mediaId,s.alt,s.websiteUrl,s.visible?1:0,Number(id));return;}
  if(type==="homepage"){const s=snapshot as HomepageContent;db.prepare("UPDATE site_content SET eyebrow=?,title=?,subtitle=?,primary_button_text=?,primary_button_href=?,secondary_button_text=?,secondary_button_href=?,hero_media_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=1").run(s.eyebrow,s.title,s.subtitle,s.primaryButtonText,s.primaryButtonHref,s.secondaryButtonText,s.secondaryButtonHref,s.heroMediaId);return;}
  if(type==="footer"){const s=snapshot as FooterContent;db.prepare("UPDATE footer_content SET contacts_json=?,promotion_json=?,copyright_text=?,updated_at=CURRENT_TIMESTAMP WHERE id=1").run(JSON.stringify(s.contacts),JSON.stringify(s.promotion),s.copyrightText);return;}
  if(type.endsWith("-list")){const table=type==="project-list"?"projects":type==="personnel-list"?"personnel":type==="client-list"?"clients":null;if(!table)throw new Error("Этот тип истории пока нельзя восстановить");restoreOrder(db,table,snapshot as number[]);return;}
  if(type==="project-gallery"){const ids=snapshot as number[];db.prepare("UPDATE project_images SET sort_order=sort_order+100000 WHERE project_id=? AND deleted_at IS NULL").run(Number(id));const q=db.prepare("UPDATE project_images SET sort_order=? WHERE id=? AND project_id=? AND deleted_at IS NULL");ids.forEach((imageId,index)=>q.run(index,imageId,Number(id)));return;}
  throw new Error("Этот тип истории пока нельзя восстановить");
}

function restoreOrderedRow(db:Database,table:"projects"|"personnel"|"clients",id:number,index:number):void{
  const ids=(db.prepare(`SELECT id FROM ${table} WHERE deleted_at IS NULL AND id<>? ORDER BY sort_order,id`).all(id) as Array<{id:number}>).map(row=>row.id);
  ids.splice(Math.max(0,Math.min(index,ids.length)),0,id);
  db.exec(`UPDATE ${table} SET sort_order=sort_order+100000 WHERE deleted_at IS NULL`);
  db.prepare(`UPDATE ${table} SET sort_order=200000 WHERE id=?`).run(id);
  const update=db.prepare(`UPDATE ${table} SET sort_order=? WHERE id=?`);ids.forEach((value,position)=>update.run(position,value));
}
function restoreOrder(db:Database,table:"projects"|"personnel"|"clients",ids:number[]):void{db.exec(`UPDATE ${table} SET sort_order=sort_order+100000 WHERE deleted_at IS NULL`);const q=db.prepare(`UPDATE ${table} SET sort_order=? WHERE id=? AND deleted_at IS NULL`);ids.forEach((value,index)=>q.run(index,value));}
function verifyMedia(db:Database,value:unknown):void{const ids=new Set<string>();const walk=(current:unknown)=>{if(!current||typeof current!=="object")return;for(const[key,nested]of Object.entries(current)){if((key==="mediaId"||key==="heroMediaId")&&typeof nested==="string")ids.add(nested);else walk(nested);}};walk(value);for(const mediaId of ids){const row=db.prepare("SELECT deleted_at FROM media_assets WHERE id=?").get(mediaId) as {deleted_at:string|null}|undefined;if(!row||row.deleted_at)throw new Error("Связанный файл больше недоступен");}}

export function purgeExpiredDeletedContent(now=new Date(),options:Options={}):PurgeReport{const db=options.db??database(),cutoff=new Date(now.getTime()-30*86400000).toISOString().slice(0,19).replace("T"," ");return transaction(db,()=>{const projectImages=Number(db.prepare("DELETE FROM project_images WHERE deleted_at IS NOT NULL AND deleted_at<?").run(cutoff).changes),projects=Number(db.prepare("DELETE FROM projects WHERE deleted_at IS NOT NULL AND deleted_at<?").run(cutoff).changes),personnel=Number(db.prepare("DELETE FROM personnel WHERE deleted_at IS NOT NULL AND deleted_at<?").run(cutoff).changes),clients=Number(db.prepare("DELETE FROM clients WHERE deleted_at IS NOT NULL AND deleted_at<?").run(cutoff).changes);return{projects,personnel,clients,projectImages,media:0};});}
function transaction<T>(db:Database,operation:()=>T):T{db.exec("BEGIN IMMEDIATE");try{const result=operation();db.exec("COMMIT");return result;}catch(error){db.exec("ROLLBACK");throw error;}}
function database():Database{const db=openDatabase();runMigrations(db);return db;}
