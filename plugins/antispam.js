let log = {}, status = {}; 

module.exports = {
    name: 'antispam',
    command: ['antispam'],
    async handle(sock, jid, msg, text, config) {
        const sender = msg.key.participant || msg.key.remoteJid;
        const isAdmin = config.admin.includes(sender.split('@')[0]) || sender.includes(config.ownerNumber);

        // অন/অফ কমান্ড
        if (text.startsWith(config.PREFIX + 'antispam')) {
            if (!isAdmin) return;
            status[jid] = text.includes('on');
            return sock.sendMessage(jid, { text: `Anti-Spam: ${status[jid] ? 'ON ✅' : 'OFF ❌'}` });
        }

        // স্প্যাম চেক (১০ সেকেন্ডে ৩ মেসেজ)
        if (status[jid] && !isAdmin) {
            let now = Date.now();
            log[sender] = (log[sender] || []).filter(t => now - t < 10000);
            log[sender].push(now);

            if (log[sender].length >= 3) {
                await sock.sendMessage(jid, { delete: msg.key });
                await sock.sendMessage(jid, { text: `⚠️ @${sender.split('@')[0]}, স্প্যাম করবেন না! নাহলে *KICK* দেওয়া হবে।`, mentions: [sender] });
                log[sender] = [];
            }
        }
    }
};
