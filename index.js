const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers } = require("@whiskeysockets/baileys");
const pino = require('pino');
const fs = require('fs-extra');
const path = require('path');

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

    // --- Pairing Code Logic ---
    if (!sock.authState.creds.registered) {
        // নিচে আপনার নম্বরটি ৮৮০ দিয়ে শুরু করুন (যেমন: "88017XXXXXXXX")
        let num = "8801714821271"; 
        
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(num);
                console.log(`\n\n🔹 YOUR PAIRING CODE: ${code}\n\n`);
            } catch (err) {
                console.log("Pairing Error: ", err.message);
            }
        }, 10000); 
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const jid = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        
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

    console.log(`🛡️ Bot is online! Wait 10s for code...`);
}

startBot().catch(err => console.log("Error: ", err));
