/**
 * @author: @__Guillaume
 */
import fs from 'fs';
import path from 'path';

import cfg from './config.json';
import Engine from './Engine';

//File analyzor engine
const _engine = new Engine();
_engine.init();

//List of files to process
const srcCode = [];
//Grab the root of the project
const rootProjectPath = path.resolve(cfg.project_path);

/* ----------- UTILS ------------ */
const shouldSkipThisDirectory = (path) => {
   for(const excluded of cfg.excluded_directories ){
      if(path.indexOf(excluded) != -1) return true;
    }
    return false;
  }
  
  const hasValidExtension = (file) => {
    if(cfg.scan_extension.length === 0) return true;
    
    for(const ext of cfg.scan_extension ){
      if(file.substr(file.length - ext.length) === ext) return true;
    }
    return false;
  }

/* ---------------- FS walker --------------- */
const walk = (dir) => {
  
    fs.readdirSync(dir).forEach(file => {
  
        const filepath = path.join(dir, file);
        const stat =  fs.statSync(filepath);
  
       if (stat.isDirectory()) {
        if(!shouldSkipThisDirectory(filepath)){
          walk(filepath);
        }
      } else {
        if(hasValidExtension(file)){
          const fc = fs.readFileSync(filepath, 'utf8');
          srcCode.push({id:filepath, content:fc});
        }
      }
  
    });
  }

//RUN APP
let ngFilesCounter = 0;
let errorCounter = 0;
let unparseableCounter = 0;

console.time('walk');
walk(rootProjectPath);
console.timeEnd('walk');
console.time('process');
srcCode.forEach(element => {
   // console.log(element.id);
     const res = _engine.analyzeFile(element.content, element.id);
     if(res.angular) ngFilesCounter++;
     if(res.error) errorCounter++;
     if(res.unparseable) unparseableCounter++;
});
console.timeEnd('process');
console.log(`${srcCode.length} total files.`);
console.log(`${ngFilesCounter} angular related files.`);
console.log(`${errorCounter} invalid js files.`);
console.log(`${unparseableCounter} files could not be parsed.`);

// Make sure the output directory exists.
!fs.existsSync('./output/') && fs.mkdirSync('./output/');

fs.writeFileSync('./output/angular.json', JSON.stringify(_engine.getGraph().nodesMap));
fs.writeFileSync('./output/lookup.json', JSON.stringify(_engine.getLookupList()));
fs.writeFileSync('./output/analyse.json', JSON.stringify(_engine.getAnalyse()));
