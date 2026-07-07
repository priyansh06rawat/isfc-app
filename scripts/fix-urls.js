const fs = require('fs');
const path = require('path');
const apiPath = path.join(__dirname, '../src/services/api.ts');

let code = fs.readFileSync(apiPath, 'utf8');
code = code.replace(/fetch\(`\/services\//g, 'fetch(`${getInstanceUrl()}/services/');

fs.writeFileSync(apiPath, code);
console.log('Fixed URLs successfully!');
