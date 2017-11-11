showLoaderCheckNewReport(true);
const mainProcess = require('electron').remote.require('./main.js')
const separator = mainProcess.separator;
var folderEmail = mainProcess.getApplicationSupportFolderPath() + 'email' + separator;
var fileSystemEmail = require('fs');
var addressDirEmail = new Array();
var readEmail = new Array();
var unreadEmail = new Array();
var i = 0;
var z = 0;
//Memorizza i percorsi delle directory contenute nella directory email, nell'array addressDir
fileSystemEmail.readdirSync(folderEmail).forEach(file => {
    showLoaderCheckNewReport(true);
    // Ignora i file spazzatura tipici di MacOS (.DS_Store)
    if (file.charAt(0) != '.') {
        addressDirEmail[i] = folderEmail + file + separator;
        //console.log(addressDirEmail[i])
        i++;
    }
});

//Memorizza i percorsi delle directory delle singole email lette e non lette in due array distinti
var j = 0;
var k = 0;
for (z = 0; z < addressDirEmail.length; z++) {
    var newFolder = addressDirEmail[z];
    fileSystemEmail.readdirSync(newFolder).forEach(file => {
        //console.log('sono dentro il for')        
        showLoaderCheckNewReport(true);
        // Ignora i file spazzatura tipici di MacOS (.DS_Store)
        if (file.charAt(0) != '.') {
            if (fileSystemEmail.existsSync(newFolder + file + separator + "read.txt")) {
                readEmail[k] = newFolder + file + separator;
                //console.log(readEmail[k])
                k++;
            } else {
                unreadEmail[j] = newFolder + file + separator;
                //console.log(unreadEmail[j])
                j++;
            }
        }
    });
}

//Riempi la datatable report con le email non ancora lette
for (var i = 0; i < unreadEmail.length; i++) {
    showLoaderCheckNewReport(true);
    var emailInfo = fileSystemEmail.readFileSync(unreadEmail[i] + 'emailInfo.txt', 'utf8');
    var paziente = emailInfo.match("FROM:(.*) <");
    var emailAddress = emailInfo.match("<(.*)>");
    var info = emailInfo.match("BODY:(.*)\n");

    var reportTable = $('#report').DataTable();

    // Nascondo la prima colonna della tabella con gli ID
    reportTable.column(0).visible(false)

    // Creo l'ID della mail da inserire nella colonna nascosta con gli ID
    var id_mail = 'mailid' + getIDsenzaCaratteriSpeciali(unreadEmail[i])

    // Prendo tutti i valori della prima colonna con gli ID nascosti
    var valori_colonna = reportTable.column(0).data()

    // Se l'email è già visualizzata nella tabella, non aggiungere nessuna nuova riga
    if ($.inArray(id_mail, valori_colonna) != -1) {
        showLoaderCheckNewReport(false);
        continue;
    }

    var id_label = getIDsenzaCaratteriSpeciali(unreadEmail[i])

    reportTable.row.add([id_mail, paziente[1], emailAddress[1], info[1], '<span id="' + id_label + '" class="label label-success">Nuova</span>', '<button type="button" class="btn legitRipple" id="' + unreadEmail[i] + '" data-toggle="modal" data-target="#modal_emailInfo" onclick=setModalContent(this.id)><i class="icon-enlarge7 position-left"></i> Visualizza</button>', '']).draw();
    showLoaderCheckNewReport(false);

}

//Riempi la datatable report con le email già lette
for (var i = 0; i < readEmail.length; i++) {
    showLoaderCheckNewReport(true);
    var emailInfo = fileSystemEmail.readFileSync(readEmail[i] + 'emailInfo.txt', 'utf8');
    var paziente = emailInfo.match("FROM:(.*) <");
    var emailAddress = emailInfo.match("<(.*)>");
    var info = emailInfo.match("BODY:(.*)\n");

    var reportTable = $('#report').DataTable()

    // Nascondo la prima colonna della tabella con gli ID
    reportTable.column(0).visible(false)

    // Creo l'ID della mail da inserire nella colonna nascosta con gli ID
    var id_mail = 'mailid' + getIDsenzaCaratteriSpeciali(readEmail[i])

    // Prendo tutti i valori della prima colonna con gli ID nascosti
    var valori_colonna = reportTable.column(0).data()

    // Se l'email è già visualizzata nella tabella, non aggiungere nessuna nuova riga
    if ($.inArray(id_mail, valori_colonna) != -1) {
        showLoaderCheckNewReport(false);
        continue;
    }

    reportTable.row.add([id_mail, paziente[1], emailAddress[1], info[1], '<span class="label label-default">Letta</span>', '<button type="button" class="btn legitRipple" id="' + readEmail[i] + '" data-toggle="modal" data-target="#modal_emailInfo" onclick=setModalContent(this.id)><i class="icon-enlarge7 position-left"></i> Visualizza</button>', ]).draw();
    showLoaderCheckNewReport(false);

}

function setModalContent(path) {
    var emailInfo = fileSystemEmail.readFileSync(path + 'emailInfo.txt', 'utf8');
    var paziente = emailInfo.match("FROM:(.*) <");
    var intestazione = emailInfo.match("SUBJECT:(.*);");
    var emailAddress = emailInfo.match("<(.*)>");
    var info = emailInfo.match("BODY:((.|\n)*);");
    // info[1].html(obj.html().replace(/\n/g,'<br/>'));
    var imageArray = new Array();
    var i = 0;
    fileSystemEmail.readdirSync(path).forEach(file => {
        if (file != "read.txt" && file != "emailInfo.txt" && file.charAt(0) != '.') {
            imageArray[i] = file;
            i++;
        }
    });

    $("#modal_title").text(intestazione[1]);
    $("#modal_body").text(info[1]);

    $("#image1").attr("src", path + imageArray[0]);
    $("#image2").attr("src", path + imageArray[1]);

    // Segna report come letto
    fileSystemEmail.writeFile(path + "read.txt", "AT Software", function (err) {
        if (err) {
            return console.log(err);
        }
    });

    // Cambia a runtime il label della tabella
    $("#" + getIDsenzaCaratteriSpeciali(path))
        .removeClass('label-success')
        .addClass('label-default')
        .text('LETTA');
}

function getIDsenzaCaratteriSpeciali(id_con_caratteri_speciali) {
    return id_con_caratteri_speciali.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
}

function showLoaderCheckNewReport(boolean) {
    if (boolean) { // if true
        $('#check-new-report').show();
    } else { // if false
        $('#check-new-report').hide();
    }
}