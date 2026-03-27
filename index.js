const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys");
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
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // --- Pairing Code Logic ---
    if (!sock.authState.creds.registered) {
        // এখানে সরাসরি আপনার নম্বরটি দিন (যেমন: 88017XXXXXXXX)
        let num = "8801714821271"; // <--- আপনার বটের নম্বরটি এখানে বসান
        
        setTimeout(async () => {
            let code = await sock.requestPairingCode(num);
            console.log(`\n🔹 PAIRING CODE: ${code?.match(/.{1,4}/g)?.join('-') || code}\n`);
        }, 5000);
    }

    sock.ev.on('creds.update', saveCreds);

    // --- Plugin Handler ---
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
                    else if (plugin.handle) await plugin.handle(sock, jid, msg, text);
                } catch (e) { console.error(e); }
            }
        }
    });

    console.log(`🛡️ Bot is online!`);
}

startBot().catch(err => console.log("Critical Error: ", err));
