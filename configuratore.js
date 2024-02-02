/*********************** ToDo ***********************
- Rifare tutto da zero con la calma necessaria (=codice pulito e ottimizzato)
- Aggiungere tasto per eliminare grafica e resettare tutto
- Gestire file clear(esempio clicchi su sfoglia e non carichi nulla)
- Gestire quantità <= 0 altrimenti € negativo
- Gestire limiti dimensioni file es. 20mb
- Abilitare drag'n'drop
- Jimmy deve aggiungere CSS perchè è inguardabile
- Aggiungere qualche catch per i var casi limite
*/

//Variabili d'appoggio DOM
const dom__altezza = document.getElementById("conf_altezza");
const dom__larghezza = document.getElementById("conf_larghezza");
const dom__preview = document.getElementById('conf_preview');
const dom__file = document.getElementById('conf_file');
const dom__quantita = document.getElementById('conf_quantita');
const dom__metri_necessari = document.getElementById("metri_necessari");
const dom__totale_preventivo = document.getElementById("totale_preventivo");

//Costanti
const larghezza_rullo = 550;
const offset = 0; //al momento considerato solo a destra e sotto
const costo_metro = 30;

//Globali
var width_mm = 0;
var height_mm = 0;

//Imposto gli event listener che avviano il tutto
dom__file.addEventListener("change", function () {
    dom__preview.classList.add("invisibile");
    readFile(this.files[0]);
}, false);

dom__quantita.addEventListener("change", function () {
    calcola_nesting(width_mm, height_mm, dom__quantita.value);
});

//Funzione per leggere file caricato e inserirlo in DOM
function readFile(file) {
    //Preparo lettura file
    const reader = new FileReader();
    reader.onload = async (event) => {
        let imgPath = event.target.result;
        dom__preview.setAttribute('src', imgPath);
        getImgSize(imgPath);
    }
    //Leggo i file
    reader.readAsDataURL(file);
}

//Funzione per inserire l'immagine in pagina
function getImgSize(imgSrc) {
    //Preparo la creazione dell'image
    let newImg = new Image();
    newImg.onload = function () {
        useImgSize(newImg.height, newImg.width)
    }
    //Carico l'image
    newImg.src = imgSrc;
}

//Funzione per recuperare larghezza in pixel e mm da un'immagine del DOM
function useImgSize(width, height) {
    //calcolo in mm (30 invece di 300)
    width_mm = Math.round((width * 2.54) / 30);
    height_mm = Math.round((height * 2.54) / 30);
    //imposto UI
    dom__larghezza.value = width_mm;
    dom__altezza.value = height_mm;
    dom__preview.classList.remove("invisibile");

    calcola_nesting(width_mm, height_mm, dom__quantita.value);
}

//Funzione per la scelta del nesting e il calcolo metri lineare
function calcola_nesting(larghezza_grafica, altezza_grafica, numero_copie) {

    //Preparo i risultati
    let altezza_affiancati = 0;
    let altezza_ruotati = 0;
    let metri = 0;
    let costo = 0;

    //Uso floor per considerare solo un numero INTERO di item/riga.
    //Es. grafica da 20 su rullo 50 => 2,5/riga => 2/riga, su 2 righe
    const quanti_su_riga_affiancati = Math.floor(larghezza_rullo / (larghezza_grafica + offset));
    const quanti_su_riga_ruotati = Math.floor(larghezza_rullo / (altezza_grafica + offset));

    //Calcolo Affiancati
    if (quanti_su_riga_affiancati >= 1) {
        let quante_righe = Math.ceil(numero_copie / quanti_su_riga_affiancati); //ceil per calcolare la riga intera anche se poco usata (es. 11/2)
        altezza_affiancati = altezza_grafica * quante_righe;
    }

    //Calcolo Ruotati 90°
    if (quanti_su_riga_ruotati >= 1) {
        let quante_righe = Math.ceil(numero_copie / quanti_su_riga_ruotati); //ceil per calcolare la riga intera anche se poco usata (es. 11/2)
        altezza_ruotati = larghezza_grafica * quante_righe;
    }

    //Calcolo finale
    if (altezza_affiancati < altezza_ruotati) {
        metri = (altezza_affiancati / 1000);
    } else {
        metri = (altezza_ruotati / 1000);
    }

    //Arrotondamento manuale
    metri = Math.round(metri * 100) / 100;
    costo = Math.round((metri * costo_metro) * 100) / 100;

    //Imposto risultati nel DOM
    dom__metri_necessari.value = metri + " m";
    dom__totale_preventivo.value = costo + " €";
    console.log("Preventivo aggiornato. Metri: ", metri);
}