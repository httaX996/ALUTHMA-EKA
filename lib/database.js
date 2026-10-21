const mongoose = require('mongoose');
const fs = require('fs').promises; 
const path = require('path');
const config = require('../config');

const databaseFolder = path.join(__dirname, 'database');
const filePath = path.join(databaseFolder, 'data.json');

if (!require('fs').existsSync(databaseFolder)) {
    require('fs').mkdirSync(databaseFolder);
}

const settingsSchema = new mongoose.Schema({
    OWNER_NUMBER: { type: String, default: "94787518010" },
    MV_SIZE: { type: String, default: "0" },
    NAME: { type: String, default: "" },
    JID: { type: String, default: "" },
    SEEDR_MAIL: { type: String, default: "" },
    SEEDR_PASSWORD: { type: String, default: "" },
    LANG: { type: String, default: "SI" },
    SUDO: { type: [String], default: [] },
    JID_BLOCK: { type: [String], default: [] },
    ANTI_BAD: { type: String, default: "" },
    MAX_SIZE: { type: Number, default: 150 },
    ANTI_CALL: { type: String, default: "false" },
    AUTO_READ_STATUS: { type: String, default: "false" },
    AUTO_STICKER: { type: String, default: "false" },
    AUTO_VOICE: { type: String, default: "false" }, 
    AUTO_REACT: { type: String, default: "false" },
    CMD_ONLY_READ: { type: String, default: "true" },
    WORK_TYPE: { type: String, default: "public" },
    XNXX_BLOCK: { type: String, default: "true" },
    AUTO_MSG_READ: { type: String, default: "false" },
    AUTO_TYPING: { type: String, default: "false" },
    AUTO_RECORDING: { type: String, default: "false" },
    AUTO_WELCOME_LEAVE: { type: [String], default: [] },
    ANTI_LINK: { type: String, default: "false" },
    ANTI_BOT: { type: String, default: "false" },
    ALIVE: { type: String, default: "default" },
    PREFIX: { type: String, default: "." },
    CHAT_BOT: { type: String, default: "false" },
    ALLWAYS_OFFLINE: { type: String, default: "false" },
    MV_BLOCK: { type: String, default: "true" },
    BUTTON: { type: String, default: "false" },
    ACTION: { type: String, default: "delete" },
    ANTILINK_ACTION: { type: String, default: "delete" },
    VALUES: { type: [String], default: [] }, 
    ANTI_DELETE: { type: String, default: "off" },
    LEAVE_MSG: { type: String, default: "" },
    AUTO_STATUS_REACT: { type: String, default: "true" },
    MOVIE_FOOTER: { type: String, default: "*⏤ ͟͞ ❮❮ SANDES MOVIES ツ ❯❯ ⏤ ヤ*" }, 
    CUSTOM_REACT: { type: String, default: "" },
});

const Settings = mongoose.model(config.SESSION_ID || 'Settings', settingsSchema);

const userSettingSchema = new mongoose.Schema({
    jid: { type: String, required: true, unique: true },
    settings: { type: Map, of: String, default: {} }
});

const UserSetting = mongoose.model('UserSetting', userSettingSchema);

async function connectdb() {
    try {
        await mongoose.connect('mongodb+srv://chamafreehosting:Chamindu47%4021@freechama.moe3veb.mongodb.net/?retryWrites=true&w=majority');
        console.log("DATABASE CONNECTED ⚡");

        const settingsCount = await Settings.countDocuments();
        if (settingsCount === 0) {
            await new Settings().save();
            console.log("SETTINGS INISIALIZED ✅ ... ");
        }
    } catch (error) {
        console.error(" ├ Database connection error:", error);
    }
}

async function readJsonFile() {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

async function writeJsonFile(data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function updateCMDStore(MsgID, CmdID) {
    try {
        const olds = await readJsonFile();
        olds.push({ [MsgID]: CmdID });
        await writeJsonFile(olds);
        return true;
    } catch (e) {
        return false;
    }
}

async function isbtnID(MsgID) {
    const olds = await readJsonFile();
    return olds.some(item => item[MsgID]);
}

async function getCMDStore(MsgID) {
    const olds = await readJsonFile();
    const foundItem = olds.find(item => item[MsgID]);
    return foundItem ? foundItem[MsgID] : null;
}

async function input(setting, data) {
    await Settings.findOneAndUpdate({}, { [setting]: data }, { upsert: true });
}

async function get(setting) {
    const settings = await Settings.findOne();
    return settings ? settings[setting] : null;
}

async function updb() {
    const settings = await Settings.findOne();
    if (settings) {
        Object.assign(config, settings.toObject());
        console.log("DATABASE UPDATED ✅ ...");
    }
}

async function setUserSetting(jid, key, value) {
    await UserSetting.findOneAndUpdate(
        { jid: jid },
        { $set: { [`settings.${key}`]: value } },
        { upsert: true }
    );
}

async function getUserSetting(jid, key, defaultValue) {
    const userDoc = await UserSetting.findOne({ jid: jid });
    if (userDoc && userDoc.settings && userDoc.settings.has(key)) {
        return userDoc.settings.get(key);
    }
    return defaultValue;
}

async function updfb() {
    await Settings.deleteMany();
    await new Settings().save();
    console.log("Database reset ✅");
}

async function upresbtn() {
    await writeJsonFile([]);
    console.log(" ├ Command store reset ✅");
}

function getCmdForCmdId(CMD_ID_MAP, cmdId) {
    const result = CMD_ID_MAP.find(entry => entry.cmdId === cmdId);
    return result ? result.cmd : null;
}

async function getalls() {
    const settings = await Settings.findOne();
    return settings ? settings.toJSON() : null;
}

connectdb().catch(console.error);

module.exports = {
    updateCMDStore, isbtnID, getCMDStore, input, get, 
    getalls, updb, updfb, upresbtn, getCmdForCmdId, connectdb,
    setUserSetting, getUserSetting 
};