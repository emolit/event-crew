import type { Database } from "@/lib/db/client";
import { existsSync, unlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { openDatabase } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";
import type { ActionResult } from "@/lib/admin/action-result";
import { getAudit } from "@/lib/audit/repository";
import { recordAudit } from "@/lib/audit/types";
import type { ClientRecord, FooterContent, HomepageContent, PersonnelRecord, ProjectRecord } from "@/lib/content/types";
import { getFooter, getHomepage, listClients, listPersonnel, listProjects } from "@/lib/content/repository";

interface Options { db?: Database }
export interface PurgeReport { projects:number; personnel:number; clients:number; projectImages:number; media:number }

export function restoreAuditEntry(id:number, actorId:number, options:Options={}):ActionResult<{restoredAuditId:number}>{
  const db=options.db??database(); const entry=getAudit(id,{db});
  if(!entry)return{ok:false,message:"Запись истории не найдена"};
  if(!entry.restorable)return{ok:false,message:"Срок восстановления истёк"};
  try{return transaction(db,()=>{const before=currentSnapshot(db,entry.entityType,entry.entityId);verifyMedia(db,entry.before);applySnapshot(db,entry.entityType,entry.entityId,entry.before);const after=currentSnapshot(db,entry.entityType,entry.entityId);const restoredAuditId=recordAudit(db,{entityType:entry.entityType,entityId:entry.entityId,action:"restore",before,after,userId:actorId});return{ok:true,data:{restoredAuditId}};});}
  catch(error){return{ok:false,message:error instanceof Error?error.message:"Не удалось восстановить"};}
}

function applySnapshot(db:Database,type:string,id:string,snapshot:unknown):void{
  if(snapshot===null&&["personnel","project","client"].includes(type)){const table=type==="project"?"projects":type==="client"?"clients":"personnel";db.prepare(`UPDATE ${table} SET deleted_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(Number(id));return;}
  if(type==="personnel"){const s=snapshot as PersonnelRecord;restoreOrderedRow(db,"personnel",Number(id),s.sortOrder);db.prepare("UPDATE personnel SET name=?,description=?,price=?,media_id=?,alt=?,deleted_at=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(s.name,s.description,s.price,s.mediaId,s.alt,Number(id));return;}
  if(type==="project"){const s=snapshot as ProjectRecord;restoreOrderedRow(db,"projects",Number(id),s.sortOrder);db.prepare("UPDATE projects SET title=?,type=?,roles_json=?,detail_title=?,description=?,size=?,deleted_at=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(s.title,s.type,JSON.stringify(s.roles),s.detailTitle,s.description,s.size,Number(id));db.prepare("UPDATE project_images SET deleted_at=CURRENT_TIMESTAMP WHERE project_id=? AND deleted_at IS NULL").run(Number(id));const q=db.prepare("INSERT INTO project_images(project_id,media_id,alt,sort_order)VALUES(?,?,?,?)");s.images.forEach((image,index)=>q.run(Number(id),image.mediaId,image.alt,index));return;}
  if(type==="client"){const s=snapshot as ClientRecord;restoreOrderedRow(db,"clients",Number(id),s.sortOrder);db.prepare("UPDATE clients SET name=?,media_id=?,alt=?,website_url=?,is_visible=?,deleted_at=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(s.name,s.mediaId,s.alt,s.websiteUrl,s.visible?1:0,Number(id));return;}
  if(type==="homepage"){const s=snapshot as HomepageContent;db.prepare("UPDATE site_content SET eyebrow=?,title=?,subtitle=?,primary_button_text=?,primary_button_href=?,secondary_button_text=?,secondary_button_href=?,hero_media_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=1").run(s.eyebrow,s.title,s.subtitle,s.primaryButtonText,s.primaryButtonHref,s.secondaryButtonText,s.secondaryButtonHref,s.heroMediaId);return;}
  if(type==="footer"){const s=snapshot as FooterContent;db.prepare("UPDATE footer_content SET contacts_json=?,promotion_json=?,copyright_text=?,updated_at=CURRENT_TIMESTAMP WHERE id=1").run(JSON.stringify(s.contacts),JSON.stringify(s.promotion),s.copyrightText);return;}
  if(type.endsWith("-list")){const table=type==="project-list"?"projects":type==="personnel-list"?"personnel":type==="client-list"?"clients":null;if(!table)throw new Error("Этот тип истории пока нельзя восстановить");restoreOrder(db,table,snapshot as number[]);return;}
  if(type==="project-gallery"){const images=snapshot as ProjectRecord["images"];db.prepare("UPDATE project_images SET deleted_at=CURRENT_TIMESTAMP WHERE project_id=? AND deleted_at IS NULL").run(Number(id));const q=db.prepare("INSERT INTO project_images(project_id,media_id,alt,sort_order)VALUES(?,?,?,?)");images.forEach((image,index)=>q.run(Number(id),image.mediaId,image.alt,index));return;}
  throw new Error("Этот тип истории пока нельзя восстановить");
}

function restoreOrderedRow(db:Database,table:"projects"|"personnel"|"clients",id:number,index:number):void{
  const ids=(db.prepare(`SELECT id FROM ${table} WHERE deleted_at IS NULL AND id<>? ORDER BY sort_order,id`).all(id) as Array<{id:number}>).map(row=>row.id);
  ids.splice(Math.max(0,Math.min(index,ids.length)),0,id);
  db.exec(`UPDATE ${table} SET sort_order=sort_order+100000 WHERE deleted_at IS NULL`);
  db.prepare(`UPDATE ${table} SET sort_order=200000 WHERE id=?`).run(id);
  const update=db.prepare(`UPDATE ${table} SET sort_order=? WHERE id=?`);ids.forEach((value,position)=>update.run(position,value));
}
function restoreOrder(db:Database,table:"projects"|"personnel"|"clients",ids:number[]):void{const current=(db.prepare(`SELECT id FROM ${table} WHERE deleted_at IS NULL`).all()as Array<{id:number}>).map(x=>x.id);if(ids.length!==current.length||[...ids].sort().join()!==current.sort().join())throw new Error("Состав списка изменился; порядок нельзя восстановить");db.exec(`UPDATE ${table} SET sort_order=sort_order+100000 WHERE deleted_at IS NULL`);const q=db.prepare(`UPDATE ${table} SET sort_order=? WHERE id=? AND deleted_at IS NULL`);ids.forEach((value,index)=>q.run(index,value));}
function verifyMedia(db:Database,value:unknown):void{const ids=new Set<string>();const walk=(current:unknown)=>{if(!current||typeof current!=="object")return;for(const[key,nested]of Object.entries(current)){if((key==="mediaId"||key==="heroMediaId")&&typeof nested==="string")ids.add(nested);else walk(nested);}};walk(value);for(const mediaId of ids){const row=db.prepare("SELECT filename,deleted_at FROM media_assets WHERE id=?").get(mediaId) as {filename:string;deleted_at:string|null}|undefined;const location=((db as Database&{location:()=>string|null}).location()??resolve(process.cwd(),"event-crew.sqlite"));const path=row?.filename.startsWith("/")?resolve(process.cwd(),"public",row.filename.slice(1)):resolve(dirname(location),"uploads",row?.filename??"");if(!row||row.deleted_at||!existsSync(path))throw new Error("Связанный файл больше недоступен");}}

function currentSnapshot(db:Database,type:string,id:string):unknown{if(type==="personnel")return listPersonnel({db,includeDeleted:true}).find(x=>x.id===Number(id)&&!x.deletedAt)??null;if(type==="project")return listProjects({db,includeDeleted:true}).find(x=>x.id===Number(id)&&!x.deletedAt)??null;if(type==="client")return listClients({db,includeDeleted:true,includeHidden:true}).find(x=>x.id===Number(id)&&!x.deletedAt)??null;if(type==="homepage")return getHomepage({db});if(type==="footer")return getFooter({db});if(type==="project-list")return listProjects({db}).map(x=>x.id);if(type==="personnel-list")return listPersonnel({db}).map(x=>x.id);if(type==="client-list")return listClients({db,includeHidden:true}).map(x=>x.id);if(type==="project-gallery")return listProjects({db}).find(x=>x.id===Number(id))?.images??[];return null;}

export function purgeExpiredDeletedContent(now=new Date(),options:Options={}):PurgeReport{const db=options.db??database(),cutoff=new Date(now.getTime()-30*86400000).toISOString().slice(0,19).replace("T"," ");return transaction(db,()=>{const projectImages=Number(db.prepare("DELETE FROM project_images WHERE deleted_at IS NOT NULL AND deleted_at<?").run(cutoff).changes),projects=Number(db.prepare("DELETE FROM projects WHERE deleted_at IS NOT NULL AND deleted_at<?").run(cutoff).changes),personnel=Number(db.prepare("DELETE FROM personnel WHERE deleted_at IS NOT NULL AND deleted_at<?").run(cutoff).changes),clients=Number(db.prepare("DELETE FROM clients WHERE deleted_at IS NOT NULL AND deleted_at<?").run(cutoff).changes);const unused=db.prepare(`SELECT m.id,m.filename FROM media_assets m WHERE m.filename NOT LIKE '/%' AND m.created_at<? AND NOT EXISTS(SELECT 1 FROM site_content s WHERE s.hero_media_id=m.id) AND NOT EXISTS(SELECT 1 FROM clients c WHERE c.media_id=m.id) AND NOT EXISTS(SELECT 1 FROM personnel p WHERE p.media_id=m.id) AND NOT EXISTS(SELECT 1 FROM project_images p WHERE p.media_id=m.id) AND NOT EXISTS(SELECT 1 FROM audit_log a WHERE a.created_at>=? AND (a.before_json LIKE '%'||m.id||'%' OR a.after_json LIKE '%'||m.id||'%'))`).all(cutoff,cutoff)as Array<{id:string;filename:string}>;const remove=db.prepare("DELETE FROM media_assets WHERE id=?");const uploads=resolve(dirname(((db as Database&{location:()=>string|null}).location()??resolve(process.cwd(),"event-crew.sqlite"))),"uploads");for(const asset of unused){try{unlinkSync(resolve(uploads,asset.filename));}catch{}remove.run(asset.id);}return{projects,personnel,clients,projectImages,media:unused.length};});}
function transaction<T>(db:Database,operation:()=>T):T{db.exec("BEGIN IMMEDIATE");try{const result=operation();db.exec("COMMIT");return result;}catch(error){db.exec("ROLLBACK");throw error;}}
function database():Database{const db=openDatabase();runMigrations(db);return db;}
