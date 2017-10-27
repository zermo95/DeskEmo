const folder = './anagrafiche/';
const fs = require('fs');
var addressDir = new Array();
var i = 0;
//Memorizza i percorsi delle directory contenute nella directory anagrafiche, nell'array addressDir
fs.readdirSync(folder).forEach(file => {
    // Ignora i file spazzatura tipici di MacOS (.DS_Store)
    if (file.charAt(0) != '.') {
        addressDir[i] = folder + file + "/";
        i++;
    }
});


//Riempi la datatable pazienti
for (var i = 0; i < addressDir.length; i++) {
    var anagrafica = fs.readFileSync(addressDir[i] + 'anagrafica.txt', 'utf8');
    var nomeCognome = anagrafica.match('NomeCognome:(.*) ;');
    var bDay = anagrafica.match('Bday:(.*);');
    var codiceFiscale = anagrafica.match('CodiceFiscale:(.*);');
    var email = anagrafica.match('IndirizzoEmail:(.*);');

  var pazientiTable = $('#pazienti').DataTable();
    
   pazientiTable.row.add( [nomeCognome[1], codiceFiscale[1], bDay[1], email[1], '<button type="button" class="btn btn-info legitRipple" id="'+addressDir[i]+'" data-toggle="modal" data-target="#modal_emailInfo" onclick=setModalContent(this.id)><i class="icon-user position-left"></i> Visualizza</button>', '']).draw();


}

//Copia dell'altra funzione in report-table (DA RISCRIVERE)
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
            imageArray[i]=file;
            i++;
        } 
    });

    $("#modal_title").text(intestazione[1]);
    $("#modal_body").text(info[1]);
 
    $("#image1").attr("src", path  +imageArray[0]);
    $("#image2").attr("src", path  +imageArray[1]);

}