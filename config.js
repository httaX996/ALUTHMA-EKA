const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "RN0UgToJ#ukAIEq4AUssPgZ0sqBsIno50t3XTj__66Fnp3v_VXDw",
ALIVE_IMG : process.env.ALIVE_IMG || "https://i.ibb.co/fd7v5197/6xs-BKLp911.jpg",
AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "false", 
};
