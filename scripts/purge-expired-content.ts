import{resolve}from"node:path";import{pathToFileURL}from"node:url";import{purgeExpiredDeletedContent}from"@/lib/audit/restore";
function main(){console.log(JSON.stringify(purgeExpiredDeletedContent(),null,2));}if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)try{main()}catch(error){console.error(error instanceof Error?error.message:error);process.exitCode=1;}
