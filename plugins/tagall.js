module.exports = {
    name: 'tagall',
    command: ['tagall'],
    async execute(sock, jid, msg, text, config) {
        const meta = await sock.groupMetadata(jid);
        let list = `╭══〘 📢 *সবাই শোনেন* 〙══⊷\n┃ 📝 ${text.split(' ').slice(1).join(' ') || 'জরুরি ঘোষণা!'}\n╰══════════════════⊷\n\n`;
        for (let i of meta.participants) list += ` @${i.id.split('@')[0]}`;
        await sock.sendMessage(jid, { text: list, mentions: meta.participants.map(a => a.id) });
    }
};
