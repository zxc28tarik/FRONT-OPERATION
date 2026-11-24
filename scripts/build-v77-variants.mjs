import fs from 'node:fs';
const raw=fs.readFileSync('index.html','utf8');
for(const [name,passage,rally] of [['passage',true,false],['rally',false,true],['both',true,true]]){
 let source=raw;
 for(const [key,value] of [['PASSAGE',passage],['RALLY',rally]]){
   const anchor='const BOT_V77_'+key+'_CHECK=false;';
   if(source.split(anchor).length!==2)throw Error('Variant source drift '+key);
   source=source.replace(anchor,'const BOT_V77_'+key+'_CHECK='+value+';');
 }
 fs.writeFileSync('/tmp/front-operation-v77-'+name+'.html',source);
}
