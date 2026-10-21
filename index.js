const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    jidNormalizedUser, 
    getContentType, 
    Browsers, 
    makeCacheableSignalKeyStore, 
    generateForwardMessageContent, 
    generateWAMessageFromContent, 
    prepareWAMessageMedia, 
    proto 
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const path = require('path');
const P = require('pino');
const NodeCache = require('node-cache');
const config = require('./config');
const qrcode = require('qrcode-terminal');
const util = require('util');
const express = require('express');

const prefix = '.';
const msgRetryCounterCache = new NodeCache();
const groupCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const ownerNumber = ['94788928386'];
const SUPER_LID = '48697127759935@s.whatsapp.net';
const SUPER_LID2 = '48697127759935@s.whatsapp.net';

const statusEmojis = ['💗', '🦋', '💐', '🌝', '🌈', '💫', '😊', '😱', '💀', '🩷', '❤️', '🧡', '💛', '💚', '🩵', '💙', '💜', '🖤', '🩶', '🤍', '🤎', '💔', '🔥'];
const newsletterEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '💯', '🎉', '😍'];
const NEWSLETTER_JIDS = ['120363423246894149@newsletter', '1203633965371245@newsletter'];
const AUTO_JOIN_LINKS = ['https://chat.whatsapp.com/DVsTjqCEj9r9lVAOzLmjum?s=cl&p=a&mlu=4&ilr=4'];

const msgStore = new Map();

console.log('CK MD WhatsApp Bot Initializing...');

const PLUGINS_DIR = './plugins/';
const LIB_DIR = './lib/';
const AUTH_DIR = './auth_info_baileys/';

// Express Server Setup
const app = express();
const port = process.env.PORT || 4000;

function runServer() {
    app.get('/', (req, res) => {
        res.send('CONNECTED SUCCESSFUL 🗿');
    });
    app.listen(port, () => console.log('Server running on port ' + port));
}

// WhatsApp සම්බන්ධතාවය සහ ප්ලගීන් ලෝඩ් කිරීම
async function connectToWA() {
    // අවශ්‍ය ෆෝල්ඩර නොමැති නම් ස්වයංක්‍රීයව සෑදීම
    if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
    }
    if (!fs.existsSync(PLUGINS_DIR)) {
        fs.mkdirSync(PLUGINS_DIR, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        browser: Browsers.macOS('Safari'),
        syncFullHistory: true,
        auth: state,
        version: version,
        msgRetryCounterCache: msgRetryCounterCache
    });

    // සම්බන්ධතා යාවත්කාලීන කිරීම් පරීක්ෂා කිරීම
    sock.ev.on('connection.update', async update => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) connectToWA();
        } else if (connection === 'open') {
            console.log('CK MD Connected Successfully! ✅');
            
            // plugins ෆෝල්ඩරයෙන් ප්ලගීන්ස් ලෝඩ් කිරීම
            let pluginCount = 0;
            try {
                fs.readdirSync(PLUGINS_DIR).forEach(file => {
                    if (path.extname(file).toLowerCase() === '.js') {
                        try {
                            require(path.join(__dirname, PLUGINS_DIR, file));
                            pluginCount++;
                        } catch (err) {
                            console.log('❌ ERROR IN ' + file + ':', err.message);
                        }
                    }
                });
                console.log('SUCCESSFULLY LOADED LOCAL PLUGINS: ' + pluginCount);
            } catch (err) {
                console.log('Error reading plugins directory:', err.message);
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // පණිවිඩ ලැබෙන විට ක්‍රියාත්මක වන කොටස
    sock.ev.on('messages.upsert', async chatUpdate => {
        let mek = chatUpdate.messages[0];
        if (!mek.message) return;
        
        mek.message = getContentType(mek.message) === 'ephemeralMessage' ? mek.message.ephemeralMessage.message : mek.message;
        
        const from = mek.key.remoteJid;
        const body = getContentType(mek.message) === 'conversation' ? mek.message.conversation : '';
        
        // අමතර විධාන සහ ක්‍රියාකාරකම් මෙහි ක්‍රියාත්මක වේ.
    });

    runServer();
}

connectToWA();
