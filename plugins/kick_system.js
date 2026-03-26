module.exports = {
    name: 'kick_system',
    command: ['kick', 'kickall'],
    async execute(sock, jid, msg, text, config) {
        const sender = msg.key.participant || msg.key.remoteJid;
        const isAdmin = config.admin.includes(sender.split('@')[0]) || sender.includes(config.ownerNumber);
        
        // শুধু আপনি (মালিক) বা অ্যাডমিনরাই এই পাওয়ার ব্যবহার করতে পারবেন
        if (!jid.endsWith('@g.us') || !isAdmin) return;

        const cmd = text.split(' ')[0].slice(config.PREFIX.length);
        const mention = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];

        // ১. একজনকে বের করা (Kick)
        if (cmd === 'kick') {
            if (mention.length === 0) return sock.sendMessage(jid, { text: '⚠️ কাকে বের করতে চান? তাকে মেনশন দিন!' });
            
            await sock.groupParticipantsUpdate(jid, mention, "remove");
            await sock.sendMessage(jid, { text: `👞 @${mention[0].split('@')[0]} কে গ্রুপ থেকে লাথি মেরে বের করা হলো!`, mentions: [mention[0]] });

        // ২. সবাইকে বের করা (Kickall) - সাবধান!
        } else if (cmd === 'kickall') {
            const meta = await sock.groupMetadata(jid);
            const participants = meta.participants;
            
            await sock.sendMessage(jid, { text: '🚨 *KICK ALL ACTIVATED!* ৫ সেকেন্ডের মধ্যে গ্রুপ খালি করা হচ্ছে...' });

            for (let i of participants) {
                // নিজেকে এবং মালিককে বাদ দিয়ে সবাইকে কিক করা
                if (!i.admin && i.id !== sock.user.id && !i.id.includes(config.ownerNumber)) {
                    await sock.groupParticipantsUpdate(jid, [i.id], "remove");
                }
            }
            await sock.sendMessage(jid, { text: '✅ মিশন সাকসেসফুল! গ্রুপ এখন ফাঁকা।' });
        }
    }
};
