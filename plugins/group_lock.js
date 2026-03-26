module.exports = {
    name: 'group_lock',
    command: ['mute', 'unmute'],
    async execute(sock, jid, msg, text, config) {
        if (text.includes('unmute')) {
            await sock.groupSettingUpdate(jid, 'not_announcement');
            await sock.sendMessage(jid, { text: '🔊 গ্রুপ আনলক! এখন সবাই মেসেজ দিতে পারবে।' });
        } else {
            await sock.groupSettingUpdate(jid, 'announcement');
            await sock.sendMessage(jid, { text: '🔇 গ্রুপ লক! শুধু অ্যাডমিনরা মেসেজ দিতে পারবে।' });
        }
    }
};
