const fs = require('fs');
let c = fs.readFileSync('prisma/schema.prisma', 'utf8');
c = c.replace(/@default\(\"{}\"\)/g, `@default(dbgenerated("'{}'"))`);
c = c.replace(/@default\(\"\[\]\"\)/g, `@default(dbgenerated("'[]'"))`);
fs.writeFileSync('prisma/schema.prisma', c);
console.log('Fixed schema.prisma defaults');
