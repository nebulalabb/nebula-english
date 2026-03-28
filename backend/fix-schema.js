const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
schema = schema.replace(/@db\.[A-Za-z0-9_()]+/g, '');
fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Schema fixed!');
