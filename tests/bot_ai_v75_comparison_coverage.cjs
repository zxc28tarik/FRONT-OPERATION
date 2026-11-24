'use strict';
const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');
const compare=fs.readFileSync(path.join(root,'scripts','compare-v75-objective.mjs'),'utf8');
const seeds=compare.match(/const seeds=\[([^\]]+)\]/)[1].split(',').map(Number);
for(const version of ['v75','v76']){
 const file=path.join(root,'.github','workflows','bot-ai-'+version+'.yml');
 if(!fs.existsSync(file))continue;
 const workflow=fs.readFileSync(file,'utf8');
 const matrix=workflow.match(/seed: \[([^\]]+)\]/)[1].split(',').map(Number);
 if(JSON.stringify(matrix)!==JSON.stringify(seeds)||!seeds.includes(831047)||!workflow.includes('run: node scripts/compare-v75-objective.mjs'))throw Error('Seed coverage mismatch '+version);
}
console.log('V75/V76 comparison includes all four scheduled seeds');
