module.exports = {
    name: 'info',
    command: ['alive', 'owner'],
    async execute(sock, jid, msg, text, config) {
        if (text.includes('alive')) {
            await sock.sendMessage(jid, { text: `🛡️ *${config.botName}* অনলাইনে সচল আছে!` });
        } else if (text.includes('owner')) {
            await sock.sendMessage(jid, { text: `👑 আমার মালিকের নাম: *${config.botOwner}*` });
        }
    }
};
