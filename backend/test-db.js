const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function checkConfig(url) {
    const prisma = new PrismaClient({ datasourceUrl: url });
    try {
        await prisma.$connect();
        console.log('SUCCESS: ' + url);
        await prisma.$disconnect();
        return true;
    } catch (err) {
        if (err.message.includes('does not exist')) {
            console.log('SUCCESS_DB_MISSING: ' + url);
            return true;
        }
        return false;
    }
}

async function main() {
    const users = ['postgres', 'englishmaster', 'root'];
    const passwords = ['root', 'postgres', 'password', '123456', 'admin', 'password123', 'admin123', ''];
    const ports = [5432, 5433];

    for (const port of ports) {
        for (const user of users) {
            for (const pass of passwords) {
                const url = `postgresql://${user}:${pass}@localhost:${port}/englishmaster?schema=public`;
                if (await checkConfig(url)) {
                    const envContent = fs.readFileSync('.env', 'utf8');
                    fs.writeFileSync('.env', envContent.replace(/DATABASE_URL=".+"/g, `DATABASE_URL="${url}"`));
                    console.log('Updated .env with ' + url);
                    return;
                }
            }
        }
    }
    console.log('ALL_LOCAL_IPS_FAILED');
}
main();
