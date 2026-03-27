const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers } = require("@whiskeysockets/baileys");
const pino = require('pino');
const fs = require('fs-extra');
const path = require('path');
const http = require('http');

// Render-কে সচল রাখার জন্য সার্ভার
http.createServer((req, res) => {
    res.write("Tom-Bot is Online!");
    res.end();
}).listen(process.env.PORT || 8080);

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        printQRInTerminal: false,
        browser: Browsers.macOS("Desktop")
    });

    // --- Pairing Code Logic (আপনার নম্বর যোগ করা হয়েছে) ---
    if (!sock.authState.creds.registered) {
        let num = "8801714821271"; 
        
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(num);
                console.log(`\n\n╭═══〘 🛡️ PAIRING CODE 🛡️ 〙═══⊷❍`);
                console.log(`┃ 🚀 আপনার কোডটি হলো: ${code}`);
                console.log(`╰══════════════════════════⊷❍\n\n`);
            } catch (err) {
                console.log("Pairing Error: ", err.message);
            }
        }, 5000); 
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const jid = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        
        // Plugins folder check
        const pluginDir = path.join(__dirname, 'plugins');
        if (fs.existsSync(pluginDir)) {
            const pluginFiles = fs.readdirSync(pluginDir).filter(file => file.endsWith('.js'));
            for (const file of pluginFiles) {
                const plugin = require(path.join(pluginDir, file));
                try {
                    if (plugin.execute) await plugin.execute(sock, jid, msg, text);
                } catch (e) { console.error(e); }
            }
        }
    });

    console.log(`🛡️ Bot Engine Started! Checking Pairing Code...`);
}

startBot().catch(err => console.log("Critical Error: ", err));
