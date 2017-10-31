// Nodejs encryption with CTR


function encrypt(text, algorithm, password){
    var crypto = require('crypto');
var cipher = crypto.createCipher(algorithm,password)
var crypted = cipher.update(text,'utf8','hex')
crypted += cipher.final('hex');
return crypted;
}

function decrypt(text, algorithm, password){
    var crypto = require('crypto');
var decipher = crypto.createDecipher(algorithm,password)
var dec = decipher.update(text,'hex','utf8')
dec += decipher.final('utf8');
return dec;
}
