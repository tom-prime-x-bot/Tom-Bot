const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ 
        auth: state, 
        printQRInTerminal: true,
        browser: ["Tom Bot", "Chrome", "1.0.0"]
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        if (qr) {
            console.log('নিচের QR Code টি আপনার WhatsApp দিয়ে স্ক্যান করুন:');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'open') console.log("অভিনন্দন টম ভাই! আপনার বট এখন অনলাইনে সচল। 🚀");
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        
        if (text === '!hi') {
            await sock.sendMessage(msg.key.remoteJid, { text: "হ্যালো! আমি টম ভাইয়ের স্মার্ট বট। আপনি কেমন আছেন? 😊" });
        }
        
        if (text === '!menu') {
            await sock.sendMessage(msg.key.remoteJid, { text: "১. !hi (শুভেচ্ছা)\n২. !info (বট সম্পর্কে)\n৩. !owner (মালিকের নাম)" });
        }
    });
}
startBot();
