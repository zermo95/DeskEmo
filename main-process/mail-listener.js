var Imap = require('imap'),
    inspect = require('util').inspect;

const simpleParser = require('mailparser').simpleParser;


var fs = require('fs'),
    fileStream;

var imap = new Imap({
    user: 'deskemo2017@gmail.com',
    password: '84Y-cAA-pTQ-F5W',
    host: 'imap.gmail.com',
    port: 993,
    tls: true
});

function openInbox(cb) {
    imap.openBox('INBOX', false, cb);
}

imap.once('ready', function () {
    openInbox(function (err, box) {
        var dir = 'email';
        //Crea la cartella email se non esiste
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        if (err) throw err;
        imap.search(['UNSEEN'], function (err, results) {
            if (err) throw err;
            var f = imap.fetch(results, {
                bodies: '',
                struct: true,
                markSeen: true
            });
            f.on('message', function (msg, seqno) {
                console.log('Message #%d', seqno);

                msg.on('body', function (stream, info) {
                    console.log( 'Body');
                    var buffer = '';
                    stream.on('data', function(chunk) {
                    buffer += chunk.toString('utf8');
                      });

                      stream.on('end', function() {
                        var messageID=buffer.match("Message-ID: <(.*)>");
                        console.log('STRING BUFFER:' + messageID[1]);
                        console.log('END BUFFER');
 
                            simpleParser(buffer, (err, mail)=>{
                                var emailAddress = mail.from.text.match("<(.*)>");
                                var emailAddressDir = 'email/' + emailAddress[1];
                                var emailDir = emailAddressDir + '/' + messageID[1];

                                console.log(emailAddressDir);

                                if (!fs.existsSync(emailAddressDir))
                                    fs.mkdirSync(emailAddressDir);
                                    
                                    if (!fs.existsSync(emailDir)){
                                        fs.mkdirSync(emailDir);
                                console.log(mail.headers.get('subject'));
                                var mailInfo = "FROM:" + mail.from.text + "\nSUBJECT:" + mail.subject + "\n\nBODY:" + mail.text;
                                console.log("MAIL INFO \n" + mailInfo);

                                //Salvataggio degli allegati
                                var arrayLength = mail.attachments.length;
                                for (var i = 0; i < arrayLength; i++){
                                console.log("Allegato SIZE:" + mail.attachments[i].size);   
                                console.log("Allegato NAME:" + mail.attachments[i].filename);
                                var filename = mail.attachments[i].filename;
                                var find = ':';
                                var re = new RegExp(find, 'g');
                                filename = filename.replace(re, '_');
                                console.log("Allegato name:" + filename);
                                fs.writeFile(emailDir +'/'+ filename, mail.attachments[i].content, function(err) {
                                    if(err) {
                                        return console.log("Errore nel salvataggio dell'allegato"+err);
                                    }
                                    console.log("The file was saved!");
                                });  

                                //Salvataggio del corpo dell'email
                                fs.writeFile(emailDir +'/emailInfo.txt', mailInfo, function(err) {
                                    if(err) {
                                        return console.log("Errore nel salvataggio dell'allegato"+err);
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

                msg.once('end', function () {
                    console.log('Finished');
                });
            
                

            });
            f.once('error', function (err) {
                console.log('Fetch error: ' + err);
            });
            f.once('end', function () {
                console.log('Done fetching all messages!');
                imap.end();
            });

        });
    });
});

imap.once('error', function (err) {
    console.log(err);
});

imap.once('end', function () {
    console.log('Connection ended');
});

imap.connect();