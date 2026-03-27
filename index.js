const client = require('./lib/client');
let _baileys = null;

const connect = async () => {
    try {
        if (!_baileys) {
            _baileys = await import('@whiskeysockets/baileys');
            global.Baileys = _baileys;
        }
        console.log("Starting Tom-Official-Bot...");
        await client.connect();
    } catch (error) {
        console.error("Connection Error:", error);
    }
}
connect();
