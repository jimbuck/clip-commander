const crypto = require('crypto');

function randomString(length) {
    let str = crypto.randomBytes(length / 2).toString('hex');
    
    if (length % 2 === 1) {
        str = str.substring(1);
    }

    return str;
}

module.exports = { randomString };