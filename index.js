const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, jidDecode } = require("@whiskeysockets/baileys");
const pino = require('pino');
const fs = require('fs');
const path = require('path');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const config = JSON.parse(fs.readFileSync('./config.json'));

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
        let num = config.botNumber.replace(/[^0-9]/g, '');
        setTimeout(async () => {
            let code = await sock.requestPairingCode(num);
            console.log(`\n🔹 PAIRING CODE: ${code?.match(/.{1,4}/g)?.join('-') || code}\n`);
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    // --- Plugin Handler ---
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const jid = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        
        // প্লাগইন ফোল্ডার থেকে ফাইল লোড করা
        const pluginDir = path.join(__dirname, 'plugins');
        const pluginFiles = fs.readdirSync(pluginDir).filter(file => file.endsWith('.js'));

        for (const file of pluginFiles) {
            const plugin = require(path.join(pluginDir, file));
            try {
                // কিছু প্লাগইন 'handle' আর কিছু 'execute' নাম দিয়েছেন, তাই দুটোই চেক করবে
                if (plugin.execute) await plugin.execute(sock, jid, msg, text, config);
                if (plugin.handle) await plugin.handle(sock, jid, msg, text, config);
            } catch (e) {
                console.error(`Error in ${file}:`, e);
            }
        }
    });

    console.log(`🛡️ ${config.botName} সচল আছে!`);
}

startBot();
