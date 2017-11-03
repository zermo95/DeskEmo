const {
    app,
    BrowserWindow
} = require('electron')
const path = require('path')
const url = require('url')
const separator = setSeparator();
var fs = require('fs');

/**
 * Imposta il separatore delle directory in base al sistema operativo
 * WINDOWS = \
 * MAC,LINUX = /
 */
function setSeparator() {
    if (process.platform === 'win32')
        return '\\'
    return '/'
}

/**
 * Se non esiste la directory dell'application support --> creala
 * In questa directory verranno salvati tutti i file necessari
 * al corretto funzionamento dell'applicazione
 * 
 * Su Mac la directory è ~/Library/Application Support
 * Su Windows è %APPDATA%
 * Su Linux è $XDG_CONFIG_HOME oppure ~/.config
 */
function createApplicationSupportFolder() {
    if (!fs.existsSync(getApplicationSupportFolderPath())) {
        fs.mkdirSync(getApplicationSupportFolderPath());
    }
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
//let firstTimeWindows;

function createWindow() {

    createApplicationSupportFolder()

    // Create the browser window.
    win = new BrowserWindow({
        /*webPreferences: {
            nodeIntegration: false
        },*/
        width: 1220,
        height: 700
    })

    //Check if is the first time
    var filesDir = getApplicationSupportFolderPath() + 'files' + separator
    fs.stat(filesDir + 'info.json', function (err, stat) {
        if (err == null) {
            // file exists and load the index.html of the app.
            win.loadURL(url.format({
                pathname: path.join(__dirname, 'index.html'),
                protocol: 'file:',
                slashes: true
            }))

        } else if (err.code == 'ENOENT') {
            // file does not exist
            // and load the startup form
            // firstTimeWindows();
            win.loadURL(url.format({
                pathname: path.join(__dirname, 'start.html'),
                protocol: 'file:',
                slashes: true
            }))
        } else {
            console.log('Some other error: ', err.code);
        }
    });

    // Open the DevTools.
    //win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })
}

function firstTimeWindows() {

    let firstTimeWindows = new BrowserWindow({
        parent: win, // indica che win è la finestra genitore 
        modal: true, // disabilita momentanemente la finestra genitore finche' questa e' in vita
        width: 600,
        height: 600,
        /* qua andremo a mettere false nel momento in cui la pubblicheremo 
        per il momento lasciamo true così ci è più facile allargare la finestra 
        e usare l'ispezione web */
        resizable: true
    })

    firstTimeWindows.loadURL(url.format({
        pathname: path.join(__dirname, 'startup-new.html'),
        protocol: 'file:',
        slashes: true
    }))

    firstTimeWindows.on('ready-to-show', () => {
        firstTimeWindows.show()
    })

    firstTimeWindows.on('closed', () => {
        firstTimeWindows = null
    })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

/**
 * Ritorna il percorso della directory speciale
 * In cui sono collocati i file di supporto all'applicazione
 * 
 * Esempio di stringa ritornata:
 * /Users/zermo/Library/Application Support/deskemoalpha/
 */
function getApplicationSupportFolderPath() {
    return app.getPath('appData') + separator + app.getName() + separator
}

/**
 * Esporta la funzione così da poter essere utilizzata in altri script
 * quando viene chiamata con il require(main.js)
 */ 
module.exports = {
    getApplicationSupportFolderPath,
    separator
}

// Avvia processo client mail
require('./main-process/mail-listener')