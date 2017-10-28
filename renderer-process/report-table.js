const folder = './email/';
const fs = require('fs');
var addressDir = new Array();
var readEmail = new Array();
var unreadEmail = new Array();
var i = 0;
var z = 0;
//Memorizza i percorsi delle directory contenute nella directory email, nell'array addressDir
fs.readdirSync(folder).forEach(file => {
    // Ignora i file spazzatura tipici di MacOS (.DS_Store)
    if (file.charAt(0) != '.') {
        addressDir[i] = folder + file + "/";
        i++;
    }
});

//Memorizza i percorsi delle directory delle singole email lette e non lette in due array distinti
var j = 0;
var k = 0;
for (z = 0; z < addressDir.length; z++) {
    var newFolder = addressDir[z];
    fs.readdirSync(newFolder).forEach(file => {
        if (fs.existsSync(newFolder + file + "/read.txt")) {
            readEmail[k] = newFolder + file + "/";
            k++;
        } else {
            unreadEmail[j] = newFolder + file + "/";
            j++;
        }
    });

}

//Riempi la datatable report con le email non ancora lette
for (var i = 0; i < unreadEmail.length; i++) {
    var emailInfo = fs.readFileSync(unreadEmail[i] + 'emailInfo.txt', 'utf8');
    var paziente = emailInfo.match("FROM:(.*) <");
    var emailAddress = emailInfo.match("<(.*)>");
    var info = emailInfo.match("BODY:(.*)\n");

    var reportTable = $('#report').DataTable();

    reportTable.row.add([paziente[1], emailAddress[1], info[1], '<span class="label label-success">Nuova</span>', '<button type="button" class="btn legitRipple" id="' + unreadEmail[i] + '" data-toggle="modal" data-target="#modal_emailInfo" onclick=setModalContent(this.id)><i class="icon-enlarge7 position-left"></i> Visualizza</button>', '']).draw();


}

//Riempi la datatable report con le email già lette
for (var i = 0; i < readEmail.length; i++) {
    var emailInfo = fs.readFileSync(readEmail[i] + 'emailInfo.txt', 'utf8');
    var paziente = emailInfo.match("FROM:(.*) <");
    var emailAddress = emailInfo.match("<(.*)>");
    var info = emailInfo.match("BODY:(.*)\n");

    var reportTable = $('#report').DataTable();

    reportTable.row.add([paziente[1], emailAddress[1], info[1], '<span class="label label-default">Letta</span>', '<button type="button" class="btn legitRipple" id="' + readEmail[i] + '" data-toggle="modal" data-target="#modal_emailInfo" onclick=setModalContent(this.id)><i class="icon-enlarge7 position-left"></i> Visualizza</button>', '']).draw();

    /* $('#report > tbody:last-child').append('<tr><td>' + paziente[1] + '</td><td>' + emailAddress[1] +
         '</td><td>' + info[1] +
         '</td><td><span class="label label-default">Letta</span></td><td class="text-center"><button type="button" class="btn legitRipple" onclick=setModalContent("Ciao")><i class="icon-enlarge7 position-left"></i> Visualizza</button></td></tr>'
     ); */
}


function setModalContent(path) {
    var emailInfo = fs.readFileSync(path + 'emailInfo.txt', 'utf8');
    var paziente = emailInfo.match("FROM:(.*) <");
    var intestazione = emailInfo.match("SUBJECT:(.*);");
    var emailAddress = emailInfo.match("<(.*)>");
    var info = emailInfo.match("BODY:((.|\n)*);");
    // info[1].html(obj.html().replace(/\n/g,'<br/>'));
    var imageArray = new Array();
    var i = 0;
    fs.readdirSync(path).forEach(file => {
        if (file != "read.txt" && file != "emailInfo.txt") {
            imageArray[i] = file;
            i++;
        }
    });

    $("#modal_title").text(intestazione[1]);
    $("#modal_body").text(info[1]);

    $("#image1").attr("src", path + imageArray[0]);
    $("#image2").attr("src", path + imageArray[1]);

}