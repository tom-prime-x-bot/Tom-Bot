const axios = require('axios');

module.exports = {
    name: 'song_download',
    command: ['song', 'video'],
    async execute(sock, jid, msg, text, config) {
        const args = text.split(' ').slice(1).join(' ');
        if (!args) return sock.sendMessage(jid, { text: `🎵 গানের নাম লিখুন! যেমন: \n${config.PREFIX}song bhalobashi` });

        await sock.sendMessage(jid, { text: `⏳ *${args}* গানটি খোঁজা হচ্ছে... একটু অপেক্ষা করুন।` });

        try {
            // গান খোঁজা এবং ডাউনলোডের জন্য একটি ফ্রি এপিআই (API) ব্যবহার করা হয়েছে
            const res = await axios.get(`https://api.giftedtech.my.id/api/download/ytmp3?url=${args}`);
            const data = res.data.result;

            if (data && data.download_url) {
                await sock.sendMessage(jid, { 
                    audio: { url: data.download_url }, 
                    mimetype: 'audio/mp4',
                    fileName: `${args}.mp3`
                }, { quoted: msg });
                
                await sock.sendMessage(jid, { text: `✅ আপনার গান রেডি, বস!` });
            } else {
                await sock.sendMessage(jid, { text: '❌ দুঃখিত, গানটি পাওয়া যায়নি।' });
            }
        } catch (e) {
            await sock.sendMessage(jid, { text: '❌ কোনো একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।' });
        }
    }
};
