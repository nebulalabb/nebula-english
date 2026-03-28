const fs = require('fs');
let c = fs.readFileSync('prisma/schema.prisma', 'utf8');
c = c.replace(/@default\(dbgenerated\(\"\'\{\}\'\"\)\)/g, `@default("{}")`);
c = c.replace(/@default\(dbgenerated\(\"\'\[\]\'\"\)\)/g, `@default("[]")`);
fs.writeFileSync('prisma/schema.prisma', c);
console.log('Restored JSON defaults for Postgres');
