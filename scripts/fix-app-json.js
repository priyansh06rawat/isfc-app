const fs = require('fs');
let code = fs.readFileSync('app.json', 'utf8');
code = code.replace('],\n      ],\n      "expo-secure-store",', '],\n      "expo-secure-store",');
fs.writeFileSync('app.json', code);
console.log('Fixed app.json');
