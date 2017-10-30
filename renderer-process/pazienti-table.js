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

    pazientiTable.row.add([nomeCognome[1], codiceFiscale[1], bDay[1], email[1], '<button type="button" class="btn btn-info legitRipple" id="' + addressDir[i] + '" data-toggle="modal" data-target="#modal_pazientiInfo" onclick=setModalContent(this.id)><i class="icon-user position-left"></i> Visualizza</button>', '']).draw();

}

//Copia dell'altra funzione in report-table (rivista per i pazienti)
function setModalContent(path) {
    var pazienteInfo = fs.readFileSync(path + 'anagrafica.txt', 'utf8');
    var intestazione = pazienteInfo.match("NomeCognome:(.*);");
    var dataDiNascita = pazienteInfo.match("Bday:(.*);");
    var codiceFiscale = pazienteInfo.match("CodiceFiscale:(.*);");
    var indirizzoEmail = pazienteInfo.match("IndirizzoEmail:(.*);");

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
            pattern: ['#4CAF50', '#F4511E', '#1E88E5']
        },
        data: {
            x: 'x',
            //xFormat: '%Y%m%d', // 'xFormat' can be used as custom format of 'x'
            columns: [
                ['x', '2013-01-01', '2013-01-02', '2013-01-03', '2013-01-04', '2013-01-05', '2013-01-06'],
                ['A*', 30, 200, 100, 400, 150, 250],
            ],
            type: 'spline'
        },
        grid: {
            y: {
                show: true
            }
        },
        axis: {
            x: {
                type: 'timeseries',
                tick: {
                    format: '%Y-%m-%d'
                }
            }
        }
    });


    // Grandissima zozzeria per ridimensionare
    // il grafico in base alla grandezza della modal
    setTimeout(function () {
        line_chart.resize();
    }, 170);
}