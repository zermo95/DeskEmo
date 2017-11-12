var cImap = require('imap'),
    inspect = require('util').inspect;


var email = $('#email').val();
var psw = $('#password').val();
var nomeCognome = $('#nomecognome').val();

var checkImap = new cImap({
    user: email,
    password: psw,
    host: 'imap.gmail.com',
    port: 993,
    tls: true
});

function openInbox(cb) {
    checkImap.openBox('INBOX', false, cb);

}

function checkEmail() {
    openInbox(function (err, box) {

    });
}


checkImap.once('error', function (err) {

    $.blockUI({
        message: '<div class="pace-demo" align=center><div class="pace_progress" data-progress-text="60%" data-progress="60"></div><div class="pace_activity"></div><i class="icon-alert"></i><br>Attenzione, le credenziali inserite non sono corrette!!</div>',
        timeout: 3000,
        overlayCSS: {
            backgroundColor: '#1b2024',
            opacity: 0.8,
            cursor: 'wait'
        },
        css: {
            border: 0,
            color: '#fff',
            padding: 0,
            backgroundColor: 'transparent'
        }
    });


});

checkImap.once('ready', function () {
    checkImap.end();
    createJson(nomeCognome, email, psw);
    $.blockUI({
        message: '<div class="pace-demo" align=center><div class="pace_progress" data-progress-text="60%" data-progress="60"></div><div class="pace_activity"></div><i class="icon-checkmark"></i><br>Login effettuato con successo</div>',
        timeout: 1000,
        overlayCSS: {
            backgroundColor: '#1b2024',
            opacity: 0.8,
            cursor: 'wait'
        },
        css: {
            border: 0,
            color: '#fff',
            padding: 0,
            backgroundColor: 'transparent'
        }
    });

    setTimeout(function () {
        window.location.href = "index.html";
    }, 1000);
});

checkImap.connect();