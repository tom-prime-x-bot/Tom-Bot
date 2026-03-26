const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const os = require("os");

// ডায়েরি (config.json) পড়ার অনুমতি নেওয়া
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ 
        auth: state, 
        printQRInTerminal: true,
        browser: [config.botName, "Chrome", "1.0.0"]
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        if (qr) qrcode.generate(qr, { small: true });
        if (connection === 'open') console.log(`${config.botName} এখন অনলাইনে সচল! 🚀`);
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const jid = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const sender = msg.key.participant || msg.key.remoteJid;
        const senderNumber = sender.split('@')[0];

        // অ্যাডমিন চেক (config.json থেকে আপনার নম্বর মিলিয়ে দেখা)
        const isAdmin = config.admin.includes(senderNumber) || senderNumber === config.ownerNumber;

        // মেনু কমান্ড (config.json থেকে নাম ও ছবি নিয়ে)
        if (text === `${config.PREFIX}menu`) {
            const menu = `╭═══〘 🔮 *${config.botName}* 🔮 〙═══⊷❍
┃✯ _*Owner:*_ ${config.botOwner}
┃✯ _*Prefix:*_ ${config.PREFIX}
┃✯ _*Mode:*_ ${config.commandMode}
╰═════════════════⊷

*───「 COMMANDS 」───*
• \`${config.PREFIX}hi\`
• \`${config.PREFIX}alive\`
• \`${config.PREFIX}owner\`
${isAdmin ? "• `" + config.PREFIX + "admininfo`" : ""}`;

            await sock.sendMessage(jid, { image: { url: config.helpPic }, caption: menu });
        }

        // অ্যাডমিন কমান্ড
        if (text === `${config.PREFIX}admininfo` && isAdmin) {
            await sock.sendMessage(jid, { text: `বস! আপনার ইউআইডি: ${config.botUid}\nসব কন্ট্রোল আপনার হাতে।` });
        }
    });
}

startBot();
