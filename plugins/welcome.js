module.exports = {
    name: 'welcome_goodbye',
    async execute(sock, anu, config) {
        const { id, participants, action } = anu;
        try {
            const metadata = await sock.groupMetadata(id);
            for (let num of participants) {
                let user = num.split('@')[0];

                if (action === 'add') {
                    let welcome = `╭═══〘 ✨ *WELCOME* ✨ 〙═══⊷❍\n` +
                                 `┃✯ 👤 *User:* @${user}\n` +
                                 `┃✯ 🏡 *Group:* ${metadata.subject}\n` +
                                 `┃✯ 📜 *Note:* নিয়ম মেনে চলুন ভাই!\n` +
                                 `╰══════════════════════⊷❍`;
                    await sock.sendMessage(id, { 
                        image: { url: config.welPic }, 
                        caption: welcome, 
                        mentions: [num] 
                    });
                } else if (action === 'remove') {
                    let goodbye = `╭═══〘 💔 *GOODBYE* 💔 〙═══⊷❍\n` +
                                  `┃✯ @${user} বিদায় নিলেন।\n` +
                                  `┃✯ ভালো থাইকেন ভাই! ✨\n` +
                                  `╰══════════════════════⊷❍`;
                    await sock.sendMessage(id, { text: goodbye, mentions: [num] });
                }
            }
        } catch (e) { console.log("Error in Welcome Plugin:", e) }
    }
};
