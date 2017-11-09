var mainProcess = require('../main.js')
const separator =  mainProcess.separator;

var Imap = require('imap'),
    inspect = require('util').inspect;

const simpleParser = require('mailparser').simpleParser;

var fs = require('fs'),
    fileStream;

var firstStart = false;


//Decriptazione del file json 
var filesDir = mainProcess.getApplicationSupportFolderPath() + 'files' + separator;
var encryptedJson = fs.readFileSync(filesDir+'info.json', 'utf8');
var algorithm = 'aes-256-ctr';
var password = 'd6F3Efeq';
var json = JSON.parse(decrypt(encryptedJson, algorithm, password));


var imap = new Imap({
    user: json['email'],
    password: json['password'],
    host: 'imap.gmail.com',
    port: 993,
    tls: true
});

function openInbox(cb) {
    imap.openBox('INBOX', false, cb);
}


imap.once('ready', function () {
    firstStart = true;
    checkEmail();

});

    function checkEmail(){
    openInbox(function (err, box) {
        
        var dir = mainProcess.getApplicationSupportFolderPath() + 'email';
        var dir_anagrafiche = mainProcess.getApplicationSupportFolderPath() + 'anagrafiche';
        //Crea la cartella email se non esiste
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        //Crea la cartella anagrafiche se non esiste
        if (!fs.existsSync(dir_anagrafiche)) {
            fs.mkdirSync(dir_anagrafiche);
        }
        if (err) throw err;
        imap.search(['UNSEEN'], function (err, results) {
            if (err) throw err;
            if (results.length != 0) {
                var f = imap.fetch(results, {
                    bodies: '',
                    struct: true,
                    markSeen: true
                });
                f.on('message', function (msg, seqno) {
                    console.log('Message #%d', seqno);

                    msg.on('body', function (stream, info) {
                        console.log('Body');
                        var buffer = '';
                        stream.on('data', function (chunk) {
                            buffer += chunk.toString('utf8');
                        });

                        stream.on('end', function () {
                            var messageID = buffer.match("Message-ID: <(.*)>");
                            console.log('STRING BUFFER:' + messageID[1]);
                            console.log('END BUFFER');

                            simpleParser(buffer, (err, mail) => {
                                var emailAddress = mail.from.text.match("<(.*)>");
                                var emailAddressDir = mainProcess.getApplicationSupportFolderPath() + 'email' + separator + emailAddress[1];
                                var anagraficaDir = mainProcess.getApplicationSupportFolderPath() + 'anagrafiche' + separator + emailAddress[1];
                                var emailDir = emailAddressDir + separator + messageID[1];

                                //Controlla esistenza cartella indirizzo email
                                if (!fs.existsSync(emailAddressDir))
                                    fs.mkdirSync(emailAddressDir);

                                    var html = mail.html;
                                    
                                     //Sostituisci<br> con \n 
                                    var brRegex = /<br\s*[\/]?>/gi;
                                    html = html.replace(brRegex, "\n");
                                                                             
                                    //Rimuovi il resto del codice html dalla stringa
                                    var regex = /(<([^>]+)>)/ig
                                    ,   result = html.replace(regex, "");
                                    result = result.trim();
                                    
                                //Controlla esistenza cartella anagrafica
                                if (!fs.existsSync(anagraficaDir)) {
                                    fs.mkdirSync(anagraficaDir);

                                    //Creazione stringa anagrafica da salvare su file
                                    console.log("HTML:"+mail.html);
                                    var bDay = mail.html.match(/\d{2}([\/.-])\d{2}\1\d{4}/g);
                                    var nomeCognome = mail.from.text.match('(.*)<');
                                    var email = mail.from.text.match('<(.*)>');
                                    var codiceFiscale = result.match('Fiscale: (.*)\n');
                                    var anagrafica = "NomeCognome:" + nomeCognome[1] + ";\n" + "Bday:" + bDay[1] + ";\n" + "CodiceFiscale:" + codiceFiscale[1] + ";\n" + "IndirizzoEmail:" + email[1] + ";";

                                    //Salvataggio dell'anagrafica nella directory corrispondente
                                    fs.writeFile(anagraficaDir + separator + 'anagrafica.txt', anagrafica, function (err) {
                                        if (err) {
                                            return console.log("Errore nel salvataggio dell'allegato" + err);
                                        }
                                        console.log("The file was saved!");
                                    });

                                } 
                                //Verifica cartella email corrispondente al message id
                                if (!fs.existsSync(emailDir)) {
                                    fs.mkdirSync(emailDir);
                                    console.log(mail.headers.get('subject'));
                                  
                                    
                                    var mailInfo = "FROM:" + mail.from.text + ";\nSUBJECT:" + mail.subject + ";\n\nBODY:" + result + ";";

                                    //Salvataggio degli allegati
                                    var arrayLength = mail.attachments.length;
                                    for (var i = 0; i < arrayLength; i++) {
                                        var filename = mail.attachments[i].filename;
                                        var find = ':';
                                        var re = new RegExp(find, 'g');
                                        filename = filename.replace(re, '_');
                                        fs.writeFile(emailDir + separator + filename, mail.attachments[i].content, function (err) {
                                            if (err) {
                                                return console.log("Errore nel salvataggio dell'allegato" + err);
                                            }
                                            console.log("The file was saved!");
                                        });

                                        //Salvataggio del corpo dell'email
                                        fs.writeFile(emailDir + separator + 'emailInfo.txt', mailInfo, function (err) {
                                            if (err) {
                                                return console.log("Errore nel salvataggio dell'allegato" + err);
                                            }
                                            console.log("The file was saved!");
                                        });
                                    }
                                }
                            });
                            
                            /* SALVATAGGIO DELL'INTERO FILE EMAIL -- INUTILE AL MOMENTO 
                            fs.writeFile(emailDir + '/msg-' + seqno + '-body.txt', buffer, function(err) {
                                if(err) {
                                    return console.log(err);
                                }
                            
                                console.log("The file was saved!");
                            }); */

                        });
                    });
                });
                f.once('error', function (err) {
                    console.log('Fetch error: ' + err);
                });
                f.once('end', function () {
                    console.log('Done fetching all messages!');
                    //imap.end();
                });
            }
        });
    });

    }
imap.once('error', function (err) {
    console.log("\nERRORE CREDENZIALI")
    console.log(err);
});

imap.once('end', function () {
    console.log('Connection ended');
});

imap.on('mail', function (numNewMsgs) {
    console.log('New Mail');
    if(firstStart != true)
    checkEmail();
    firstStart = false;
});

imap.connect();

function decrypt(text, algorithm, password) {
    var crypto = require('crypto');
    var decipher = crypto.createDecipher(algorithm, password)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}
   