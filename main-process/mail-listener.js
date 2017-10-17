var Imap = require('imap'),
    inspect = require('util').inspect;

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
    imap.openBox('INBOX', true, cb);
}

imap.once('ready', function () {
    openInbox(function (err, box) {
        var dir = 'email';
        //Crea la cartella email se non esiste
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        if (err) throw err;
        imap.search(['ALL'], function (err, results) {
            if (err) throw err;
            var f = imap.fetch(results, {
                bodies: '',
                struct: true
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
                        var emailDir = 'email/' + messageID[1];
                        if (!fs.existsSync(emailDir)){
                            fs.mkdirSync(emailDir);
                            fs.writeFile(emailDir + '/msg-' + seqno + '-body.txt', buffer, function(err) {
                                if(err) {
                                    return console.log(err);
                                }
                            
                                console.log("The file was saved!");
                            }); 
                        }
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