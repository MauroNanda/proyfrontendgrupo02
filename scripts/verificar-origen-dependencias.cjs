'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source='https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz';
const expected='sha512-oLDq3jw7AcLqKWH2AhCpVTZl8mf6X2YReP+Neh0SJUzV/BdZYjth94tG5toiMB1PPrYtxOCfaoUCkvtuH+3AJA==';
const manifest=JSON.parse(fs.readFileSync(path.join(root,'package.json')));
const lock=JSON.parse(fs.readFileSync(path.join(root,'package-lock.json')));
for(const group of ['dependencies','devDependencies']) {
  for(const [name,value] of Object.entries(manifest[group]||{})) {
    if(/^(https?:|git|file:)/.test(value) && (name!=='xlsx'||value!==source)) throw new Error('Origen de dependencia no autorizado: '+name);
  }
}
for(const [name,data] of Object.entries(lock.packages)) {
  if(data.resolved && !data.resolved.startsWith('https://registry.npmjs.org/')) {
    if(name!=='node_modules/xlsx'||data.resolved!==source||data.version!=='0.20.3'||data.integrity!==expected) throw new Error('Integridad u origen no autorizado: '+name);
  }
}
console.log('Origenes verificados: unica excepcion SheetJS oficial 0.20.3, con integridad fijada.');
