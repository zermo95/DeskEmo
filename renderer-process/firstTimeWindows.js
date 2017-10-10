function closefirstTimeWindows(){
    require('electron').remote.getCurrentWindow().close();
}

// Per il momento il button di submit chiude la finestra di prima configurazione
// L'intenzione è quindi di associare successivamente al button una funzione che crea i dati del medico
// ed esegua il primo accesso alla casella email 
document.querySelector('#closeButton').addEventListener('click', closefirstTimeWindows)