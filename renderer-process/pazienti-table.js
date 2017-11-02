const mainProcess = require('electron').remote.require('./main.js')
const separator = mainProcess.separator;
var folder = mainProcess.getApplicationSupportFolderPath() + 'anagrafiche' + separator
var fs = require('fs');
var addressDir = new Array();
var i = 0;
//Memorizza i percorsi delle directory contenute nella directory anagrafiche, nell'array addressDir
fs.readdirSync(folder).forEach(file => {
    // Ignora i file spazzatura tipici di MacOS (.DS_Store)
    if (file.charAt(0) != '.') {
        addressDir[i] = folder + file + separator;
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

    pazientiTable.row.add([nomeCognome[1], codiceFiscale[1], bDay[1], email[1], '<button type="button" class="btn btn-info legitRipple" id="' + addressDir[i] + '" data-toggle="modal" data-target="#modal_pazientiInfo" onclick=setModalContent(this.id)><i class="icon-user position-left"></i> Visualizza</button>', '']).draw();

}

//Copia dell'altra funzione in report-table (rivista per i pazienti)
function setModalContent(path) {
    var pazienteInfo = fs.readFileSync(path + 'anagrafica.txt', 'utf8');
    var intestazione = pazienteInfo.match("NomeCognome:(.*);");
    var dataDiNascita = pazienteInfo.match("Bday:(.*);");
    var codiceFiscale = pazienteInfo.match("CodiceFiscale:(.*);");
    var indirizzoEmail = pazienteInfo.match("IndirizzoEmail:(.*);");

    var email = path.match(separator + 'anagrafiche' + separator + '(.*)');
    var emailPath = mainProcess.getApplicationSupportFolderPath() + 'email' + separator + email[1];
    var emailDir = new Array();
    var analysis = new Array();

    var i = 0;
    var z = 0;

    //Memorizza i percorsi di tutte le mail ricevute dall'indirizzo corrente, nell'array emailDir
    fs.readdirSync(emailPath).forEach(file => {
        // Ignora i file spazzatura tipici di MacOS (.DS_Store)
        if (file.charAt(0) != '.') {
            emailDir[i] = emailPath + file + separator;
            i++;
        }
    });

    for (var j = 0; j < emailDir.length; j++) {
        var emailInfo = fs.readFileSync(emailDir[j] + 'emailInfo.txt', 'utf8');
        var date = emailInfo.match(/\d{2}([\/.-])\d{2}\1\d{4}/g);
        var aStar = emailInfo.match('[*]: (.*)\n');
        analysis[z] = new Array();
        analysis[z][0] = date[0];
        analysis[z][1] = Number(aStar[1]);
        z++;
    }
    analysis.sort(sortFunction);

    var xArray = [];
    var yArray = [];

    $.each(analysis, function (index, value) {
        xArray.push(value[0]);
        yArray.push(value[1]);
    });
    yArray.unshift('data');
    $("#modal_title").text(intestazione[1]);
    $('#nomeCognomeModalPaziente').text(intestazione[1]);
    $('#dataNascitaModalPaziente').text(dataDiNascita[1]);
    $('#codiceFiscaleModalPaziente').text(codiceFiscale[1]);
    $('#indirizzoEmailModalPaziente').text(indirizzoEmail[1]);

    // Generate chart
    var line_chart = c3.generate({
        bindto: '#c3-grafico-astar',
        point: {
            r: 4
        },
        size: {
            height: 400
        },
        color: {
            pattern: ['#F4511E']
        },
        data: {
            columns: [yArray],
            names: {
                data: 'A*'
            }
        },
        axis: {
            x: {
                label: 'Tempo',
                type: 'category',
                categories: xArray
            },
            y: {
                label: 'A*'
            }
        },
        grid: {
            y: {
                show: true
            }
        },
        legend: {
            show: false
        }
    });

    // Grandissima zozzeria per ridimensionare
    // il grafico in base alla grandezza della modal
    setTimeout(function () {
        line_chart.resize();
    }, 170);
}

function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    } else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}