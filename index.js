const { default: makeWASocket, useMultiFileAuthState, Browsers } = require("@whiskeysockets/baileys");
const pino = require('pino');
const fs = require('fs-extra');
const http = require('http');

// Config ফাইল থেকে ডাটা পড়া
const config = JSON.parse(fs.readFileSync('./config.json'));

// সার্ভার চালু রাখা
http.createServer((req, res) => {
    res.write("Tom Bot is Active");
    res.end();
}).listen(process.env.PORT || config.PORT || 8080);

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: Browsers.macOS("Desktop")
    });

    if (!sock.authState.creds.registered) {
        let num = config.botNumber; // config.json থেকে নম্বর নিচ্ছে
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(num);
                console.log(`\n\n🚀 আপনার পেয়ারিং কোড: ${code}\n\n`);
            } catch (err) {
                console.log("Error requesting code: ", err.message);
            }
        }, 10000);
    }

    sock.ev.on('creds.update', saveCreds);
    console.log("🛡️ Bot started... Waiting for code...");
}

startBot();
