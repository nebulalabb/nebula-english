const nodemailer = require('nodemailer');
const fs = require('fs');

async function setupEthereal() {
    try {
        let testAccount = await nodemailer.createTestAccount();
        console.log('Ethereal Account Created: %s', testAccount.user);

        let envContent = fs.readFileSync('.env', 'utf8');

        envContent = envContent.replace(/SMTP_HOST=.+/g, 'SMTP_HOST="smtp.ethereal.email"');
        envContent = envContent.replace(/SMTP_PORT=.+/g, 'SMTP_PORT=587');
        envContent = envContent.replace(/SMTP_USER=.+/g, `SMTP_USER="${testAccount.user}"`);
        envContent = envContent.replace(/SMTP_PASS=.+/g, `SMTP_PASS="${testAccount.pass}"`);

        fs.writeFileSync('.env', envContent);
        console.log('Updated .env with Ethereal SMTP');
    } catch (err) {
        console.error('Failed to create Ethereal account', err);
    }
}

setupEthereal();
