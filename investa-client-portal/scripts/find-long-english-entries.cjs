const fs = require('fs');
const path = require('path');

const en = JSON.parse(fs.readFileSync(path.join(__dirname,'..','src','assets','i18n','en.json'),'utf8'));
const ar = JSON.parse(fs.readFileSync(path.join(__dirname,'..','src','assets','i18n','ar.json'),'utf8'));

function flatten(obj, prefix=''){
  let res={};
  for(const k of Object.keys(obj)){
    const val = obj[k];
    const key = prefix?`${prefix}.${k}`:k;
    if (val && typeof val==='object' && !Array.isArray(val)) Object.assign(res, flatten(val,key));
    else res[key]=val;
  }
  return res;
}
const enf = flatten(en);
const arf = flatten(ar);

const results=[];
for(const k of Object.keys(enf)){
  const v=enf[k];
  if(typeof v==='string' && v.length>120){
    const av=arf[k];
    const identical = String(v).trim()===String(av).trim();
    // detect if av is English-like
    const asciiLetters = (av && av.match(/[A-Za-z]/g)||[]).length;
    const asciiRatio = av? asciiLetters/av.length:0;
    if (identical || asciiRatio>0.2 || !av) results.push({key:k,len:v.length, en: v.slice(0,150).replace(/\n/g,' '), ar: av? av.slice(0,150).replace(/\n/g,' '):null, asciiRatio});
  }
}
console.log(JSON.stringify(results,null,2));
