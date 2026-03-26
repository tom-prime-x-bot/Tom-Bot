module.exports = {
    name: 'menu',
    command: ['menu', 'help'],
    async execute(sock, jid, msg, text, config) {
        const menuText = `╭═══〘 🛡️ *${config.botName}* 🛡️ 〙═══⊷❍
┃✯ _*Owner:*_ ${config.botOwner}
┃✯ _*Prefix:*_ ${config.PREFIX}
╰═════════════════⊷

• !hi
• !alive
• !ping`;
        await sock.sendMessage(jid, { image: { url: config.helpPic }, caption: menuText });
    }
};
