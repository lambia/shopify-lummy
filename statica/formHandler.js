function formHandlerInit(scope, productID, prices) {

    let wrapper = document.getElementById(`gfxWrapper-${scope}`);

    //Variabili d'appoggio DOM
    const dom__dimensioni = wrapper.querySelector('#conf_dimensioni');
    const dom__preview = wrapper.querySelector('#conf_preview');
    const dom__preview_wrapper = wrapper.querySelector('#conf_preview_wrapper');
    const dom__nome_grafica = wrapper.querySelector('#conf_name');
    const dom__note_grafica = wrapper.querySelector('#conf_note');
    const dom__microid = wrapper.querySelector('#microid');
    const dom__file = wrapper.querySelector('#conf_file');
    const dom__file_hq = wrapper.querySelector('#conf_file_hq');
    const dom__quantita = wrapper.querySelector('#conf_quantita');
    const dom__metri_necessari = wrapper.querySelector('#metri_necessari');
    const dom__totale_preventivo = wrapper.querySelector('#totale_preventivo');
    const dom__costo_al_pezzo = wrapper.querySelector('#costo_al_pezzo');
    const dom__costo_al_metro = wrapper.querySelector('#costo_al_metro');
    const dom__closeBtn = wrapper.querySelector(".graficCloseBtn");

    // const customProductsIDs = {
    //     8577508802828: "base",
    //     11634085363980: "uv",
    //     11634082447628: "fluo",
    // };

    //Costanti
    const placeholder_img =
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/619px-Placeholder_view_vector.svg.png';
    const larghezza_rullo = 570;
    const offset = 5; //al momento considerato solo a destra e sotto
    const price_increments = 0.3;

    //Globali
    let width_mm = 0;
    let height_mm = 0;
    let quantita = 1;

    //Resetto eventuali valori in cache per il form
    reset(true);

    //Imposto gli event listener che avviano il tutto    
    dom__closeBtn.addEventListener("click", async function (e) {
        //recupero gli elementi non nulli

        if (scopeContainer[scope]) {
            delete scopeContainer[scope];
        }

        wrapper.remove();

        let grafiche = scopeContainer.filter(item => item);
        if (!grafiche.length) {
            //aggiungi wrapper in dom
            window.newGfx(window.partial);
        }

        /*
        let grafiche = scopeContainer.filter(item => item);
        if (grafiche && grafiche.length > 1) {
            reset(true);
            wrapper.remove();
            delete scopeContainer[scope];
        } else {
            reset(true);
            scopeContainer[scope] = {};
        }
        */
    });

    dom__file.addEventListener('change', function () {

        dom__preview.setAttribute('src', placeholder_img);
        dom__dimensioni.value = '';
        dom__metri_necessari.value = '';
        dom__costo_al_metro.value = prices[0].price + ' €/m'
        dom__totale_preventivo.value = '';
        dom__costo_al_pezzo.value = '';
        width_mm = 0;
        height_mm = 0;

        // if(!this.files[0]) {
        //     message("Errore irreversibile", "Si è verificato un errore durante l'elaborazione del file.<br>Assicurarsi che il file sia corretto e riprovare.");
        //     return reset(true);
        // } else if(!this.files[0].size || !this.files[0].type) {
        //     message("Errore irreversibile", "Il browser non è supportato.<br>Assicurati di utilizzare un PC o MAC e non uno smartphone.");
        //     return reset(true);
        // } else if(this.files[0].size > 20 * 1024 * 1024) {
        //     //ToDo: dovrebbe essere 20-0.1 oppure 25-0.1 (v. altri dati payload)
        //     message("Attenzione", "Il file non verrà caricato perchè supera le dimensioni massime consentite.<br>Si prega di rispettare le indicazioni fornite.");
        //     return reset(true);
        // } else if(this.files[0].type != "image/png") {
        //     message("Errore", "Selezionare un file in formato PNG e riprovare.");
        //     return reset(false);
        // } else {
        //     return readFile(this.files[0]);
        // }

        // //reset();
        if (this.files[0] && this.files[0].size && this.files[0].size <= 20 * 1024 * 1024) {
            readFile(this.files[0]);
        } else if (this.files[0] && this.files[0].size) {
            message("Attenzione", "Il file non verrà caricato perchè supera le dimensioni massime consentite.<br>Si prega di rispettare le indicazioni fornite.");
            reset(true);
        } else {
            message("Errore", "Si è verificato un errore durante l'elaborazione del file.<br>Assicurarsi che il file sia corretto e riprovare.");
            reset(true);
        }

    }, false);

    // dom__quantita.addEventListener('input', function (e) {
    //     quantita = e.target.value;
    //     if (quantita == 0 || quantita == "" || isNaN(quantita)) {
    //         dom__quantita.value = 1;
    //         quantita = 1;
    //     }

    //     calcola_nesting();
    // });

    dom__quantita.addEventListener('change', function (e) {
        quantita = e.target.value;
        if (quantita < 1 || quantita == "" || isNaN(quantita)) {
            dom__quantita.value = 1;
            quantita = 1;
        }

        calcola_nesting();
    });

    dom__nome_grafica.addEventListener('focus', function (e) {
        dom__nome_grafica.value = dom__nome_grafica.value.slice(0, dom__nome_grafica.value.lastIndexOf("#"))
    });
    dom__nome_grafica.addEventListener('blur', function (e) {
        dom__nome_grafica.value = generaIncrementale(dom__nome_grafica.value);
    });

    //Gestione zoom
    let isZoomed = false;

    //Attiva e disattiva al click
    dom__preview_wrapper.addEventListener("click", function (e) {
        if (isZoomed) {
            dom__preview.style["transform"] = "unset";
            dom__preview.style["transform-origin"] = "50% 50%";
        }

        isZoomed = !isZoomed;
    });

    dom__preview_wrapper.addEventListener("mousemove", function (e) {
        if (isZoomed) {
            const imgBox = dom__preview_wrapper.getBoundingClientRect();
            const imgStepY = imgBox.height / 100;
            const imgStepX = imgBox.width / 100;
            const relativeTop = e.clientY - imgBox.top;
            const relativeLeft = e.clientX - imgBox.left;

            const percentageY = Math.round(relativeTop / imgStepY);
            const percentageX = Math.round(relativeLeft / imgStepX);
            const position = percentageX + "% " + percentageY + "%";

            dom__preview.style["transform"] = "scale(3)";
            dom__preview.style["transform-origin"] = position;
        }
    })

    dom__preview_wrapper.addEventListener("mouseleave", function (e) {
        if (isZoomed) {
            isZoomed = !isZoomed;
            dom__preview.style["transform"] = "unset";
            dom__preview.style["transform-origin"] = "50% 50%";
        }
    });

    function generaIncrementale(testo = "") {
        let risultato = testo;
        risultato += "#";

        if (scope < 10) {
            risultato += "0";
        }

        risultato += scope;

        return risultato;
    }

    function reset(initialLoad = false) {
        console.log('Lummy.configuratore: Resetto il form');

        if (!scope || !productID) {
            message("Errore irreversibile", "Si è verificato un errore durante l'avvio del configuratore.<br>Si prega di ricaricare la pagina e riprovare.");
            return;
        }

        dom__microid.value = `${productID}##${scope}`;

        dom__preview.setAttribute('src', placeholder_img);
        dom__dimensioni.value = '';
        dom__metri_necessari.value = '';
        dom__totale_preventivo.value = '';
        dom__costo_al_pezzo.value = '';
        dom__nome_grafica.value = generaIncrementale();
        dom__costo_al_metro.value = prices[0].price + ' €/m'
        quantita = 1;
        dom__quantita.value = 1;
        dom__quantita.disabled = true;

        width_mm = 0;
        height_mm = 0;

        //Il file caricato viene resettato solo al load iniziale
        if (initialLoad) {
            dom__file_hq.value = '';
            let newFileContainer = new DataTransfer();
            dom__file_hq.files = newFileContainer.files;
        }

        getMetriTotaliScope();
        ricalcolaCostoMetro();
        ricalcolaCostiTutteLeGrafiche();
    }

    //Funzione per leggere file caricato e inserirlo in DOM
    async function readFile(file) {
        //Debuggo
        //console.log(`${file.name} is ${file.type}`);

        //prendo i dati
        const newArrayBuffer = await file.arrayBuffer();

        //creo uno zip
        const zip = new JSZip();
        zip.file(file.name, newArrayBuffer, { binary: true });

        //ToDO gestire: catch (se si rompe) + async (se uno va avanti mentre carica)
        zip.generateAsync({ type: 'blob' }).then(function (content) {
            //Prendo il nuovo blob converto in file
            const newFile = new File([content], `${file.name}.zip`, { type: 'application/zip' });
            console.log(`Zip generated: ${newFile.name} is ${newFile.type}`);

            //Sposto il file binario nel secondo input
            let newFileContainer = new DataTransfer();
            newFileContainer.items.add(newFile);
            dom__file_hq.files = newFileContainer.files;
        });

        //Preparo lettura file
        const reader = new FileReader();
        reader.onload = async (event) => {
            let imgPath = event.target.result;
            dom__preview.setAttribute('src', imgPath);
            getImgSize(imgPath);
        };
        //Leggo i file
        reader.readAsDataURL(file);
    }

    //Funzione per inserire l'immagine in pagina
    function getImgSize(imgSrc) {
        //Preparo la creazione dell'image
        let newImg = new Image();
        newImg.onload = function () {
            useImgSize(newImg.width, newImg.height);
        };
        //Carico l'image
        newImg.src = imgSrc;
    }

    //Funzione per recuperare larghezza in pixel e mm da un'immagine del DOM
    function useImgSize(width, height) {
        //calcolo in mm (30 invece di 300)
        width_mm = Math.round((width * 2.54) / 30);
        height_mm = Math.round((height * 2.54) / 30);
        console.log('dimensioni immagine', `${width_mm} x ${height_mm} mm`);
        //imposto UI
        dom__dimensioni.value = `${width_mm} x ${height_mm} mm`;

        calcola_nesting();
    }

    //Funzione per la scelta del nesting e il calcolo metri lineare
    function calcola_nesting(chiamataInterna = true) {

        let larghezza_grafica = width_mm;
        let altezza_grafica = height_mm;
        let numero_copie = quantita;

        //Preparo i risultati
        let altezza_affiancati = 0;
        let altezza_ruotati = 0;
        let metri = 0;
        let costo = 0;

        //Uso floor per considerare solo un numero INTERO di item/riga.
        //Es. grafica da 20 su rullo 50 => 2,5/riga => 2/riga, su 2 righe
        const quanti_su_riga_affiancati = Math.floor(larghezza_rullo / (larghezza_grafica + offset));
        const quanti_su_riga_ruotati = Math.floor(larghezza_rullo / (altezza_grafica + offset));

        //Controlla se l'immagine è più grande del rullo
        if (quanti_su_riga_affiancati < 1 && quanti_su_riga_ruotati < 1) {
            message("Attenzione!", "Il file caricato copre un'area di stampa maggiore della superficie disponibile.<br>Assicurati che il file sia corretto (300dpi) o contattaci in caso di necessità particolari.");
            return reset(true);
        }

        //Calcolo Affiancati
        if (quanti_su_riga_affiancati >= 1) {
            let quante_righe = Math.ceil(numero_copie / quanti_su_riga_affiancati); //ceil per calcolare la riga intera anche se poco usata (es. 11/2)
            altezza_affiancati = (altezza_grafica + offset) * quante_righe;
        }

        //Calcolo Ruotati 90°
        if (quanti_su_riga_ruotati >= 1) {
            let quante_righe = Math.ceil(numero_copie / quanti_su_riga_ruotati); //ceil per calcolare la riga intera anche se poco usata (es. 11/2)
            altezza_ruotati = (larghezza_grafica + offset) * quante_righe;
        }

        //Calcolo finale
        if (altezza_affiancati && altezza_ruotati) { //Se stampabile in due direzioni
            if (altezza_affiancati < altezza_ruotati) { //prendi quella che ingombra meno
                console.log("Stampabile in due versi. Scelgo [AFFIANCATI]");
                metri = altezza_affiancati / 1000;
            } else {
                console.log("Stampabile in due versi. Scelgo [RUOTATI]");
                metri = altezza_ruotati / 1000;
            }

        } else if (altezza_affiancati || altezza_ruotati) { //Se stampabile in una sola direzione
            if (altezza_affiancati) {
                console.log("Stampabile SOLO in modalità [AFFIANCATI]");
                metri = altezza_affiancati / 1000;
            } else if (altezza_ruotati) {
                console.log("Stampabile SOLO in modalità [RUOTATI]");
                metri = altezza_ruotati / 1000;
            }

        } else { //Se non stampabile
            metri = 0;
            message("Errore", "Il file non risulta stampabile.");
            return reset(true);
        }

        //Aggiungo ai metri fuori scope
        if (scopeContainer[scope] && scopeContainer[scope].calcola_nesting) {
            scopeContainer[scope].metri = metri;
        } else {
            scopeContainer[scope] = {
                cart: false,
                metri,
                calcola_nesting,
                aggiungiCarrello
            };
        }

        //Se questa grafica è cambiata, ricalcola il totale metri e il nesting
        if (chiamataInterna) {
            getMetriTotaliScope();
            ricalcolaCostoMetro();
        }

        dom__costo_al_metro.value = summaryContainer.costoAlMetro + ' €/m';

        //Qui calcolare "costo" in base a "costoAlMetro" e "price_increments"

        //Arrotondamento manuale, STRINGA DA QUI
        costo = (metri * summaryContainer.costoAlMetro).toFixed(2);
        metri = metri.toFixed(2);
        costoPezzo = (costo / numero_copie).toFixed(2);

        //Calcolo la quantità di shopify necessaria
        pezzi = Math.round(costo / price_increments);

        //Ricalcola il costo considerando gli increments da 0.30
        costo = (price_increments * pezzi).toFixed(2);

        scopeContainer[scope].pezzi = pezzi;
        scopeContainer[scope].costo = costo;

        //Imposto risultati nel DOM
        dom__metri_necessari.value = metri + ' m';
        dom__totale_preventivo.value = costo + ' €';
        dom__costo_al_pezzo.value = costoPezzo + ' €';

        //Debugger
        console.log(`Ricalcolo: [${metri} m] [${costo} €] [${pezzi} pz]`);

        if (chiamataInterna) {
            dom__quantita.disabled = false;
            ricalcolaCostiTutteLeGrafiche(); //aggiunge anche al carrello
        }
    }

    async function aggiungiCarrello() {

        const propertiesForm = wrapper.querySelector("form");
        const properties = new FormData(propertiesForm);

        const newProduct = new FormData();
        for (const prop of properties) {
            //ToDo: sarebbe preferibile rimuoverlo PRIMA dal form invece di iffarlo qui
            if (prop[0] != "grafica") {
                newProduct.set(`properties[${prop[0]}]`, prop[1]);
            }
        }
        newProduct.set("id", productID);
        newProduct.set("quantity", scopeContainer[scope].pezzi);

        let action = "add";
        if (scopeContainer[scope].cart) {
            action = "change";
            newProduct.set("id", scopeContainer[scope].cart);
        }

        let cfg = {
            method: "POST",
            headers: {
                Accept: "application/javascript",
                "X-Requested-With": "XMLHttpRequest"
            },
            body: newProduct
        };

        // thisGfxForm.set("sections", "cart-notification-product,cart-notification-button,cart-icon-bubble");
        // thisGfxForm.set("sections_url", "/products/dtf-custom-product");

        let result = false;

        try {
            const response = await fetch(`/cart/${action}.js`, cfg);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            result = await response.json();

            if (result.key) { //first add: { key }
                scopeContainer[scope].cart = result.key;
                result = true;
                //message("Le grafiche sono state aggiunte al carrello");
            } else if (result.items && result.items.length) { //next changes: [ {key} ]
                const foundItemInCart = result.items.find(x => x.properties.microid == `${productID}##${scope}`);
                if (foundItemInCart) {
                    scopeContainer[scope].cart = foundItemInCart.key;
                    result = true;
                    //message("Il carrello è stato aggiornato");
                } else {
                    throw new Error(`Cart didn't provide a Key`);
                }
            } else {
                throw new Error(`Cart didn't provide a Key`);
            }

            //message("Messaggio di conferma");

        } catch (error) {
            message("Errore irreversibile", "Si è verificato un errore durante l'aggiunta di una grafica al carrello.<br>Si prega di ricaricare la pagina e riprovare.");
            console.error("Errore carrello: ", error);

            scopeContainer[scope].cart = false;
        } finally {
            return result;
        }
    }

    function ricalcolaCostoMetro() {

        let scaglione = prices.filter(x => summaryContainer.metri > x.moreThan);
        let costo_metro = Math.min(...scaglione.map(x=>x.price));

        const costoMin = Math.min(...prices.map(x => x.price));
        const costoMax = Math.max(...prices.map(x => x.price));

        //Se il prezzo è fuori range, fai fallback sul prezzo massimo
        if (costo_metro > costoMax || costo_metro < costoMin ) {
            costo_metro = costoMax;
        }

        summaryContainer.costoAlMetro = costo_metro;

        const priceIndex = prices.findLastIndex(x=> summaryContainer.metri > x.moreThan);
        const oldHighlighted = document.querySelector(`#priceTable tr.highlightedRow`);
        const newHighlighted = document.querySelector(`#priceTable tr[data-value="${priceIndex}"]`);

        if (!oldHighlighted || oldHighlighted != newHighlighted) {
            oldHighlighted.classList.remove("highlightedRow");
            newHighlighted.classList.add("highlightedRow");
        }

    }

    function ricalcolaCostiTutteLeGrafiche() {
        for (const singolaGrafica of scopeContainer) {
            if (!singolaGrafica) {
                continue;
            }
            if (singolaGrafica.calcola_nesting) {
                singolaGrafica.calcola_nesting(false);
            }
        }

        aggiornaSummary();
    }

    function aggiornaSummary() {
        summaryContainer.costo = 0;
        summaryContainer.pezzi = 0;
        summaryContainer.grafiche = 0;
        // summaryContainer.metri = 0; //già calcolato da getMetriTotaliScope
        // summaryContainer.costoAlMetro = 0; //già calcolato da ricalcolaCostoMetro

        for (const singolaGrafica of scopeContainer) {
            if (!singolaGrafica) {
                continue;
            }
            if (singolaGrafica.costo && parseFloat(singolaGrafica.costo)) {
                summaryContainer.costo += parseFloat(singolaGrafica.costo);
                summaryContainer.grafiche++;
            }
            if (singolaGrafica.pezzi) {
                summaryContainer.pezzi += singolaGrafica.pezzi;
            }

        }

        const disclaimerMinimoOrdine = summaryContainer.metri < 1 ? "Attenzione: non raggiungendo il minimo d'ordine di un metro, questa configurazione avrà un costo fisso di 15€" : "";

        document.getElementById("riepilogoOrdine").innerHTML = `
        <h3>Riepilogo Totale (${summaryContainer.grafiche} ${summaryContainer.grafiche == 1 ? "grafica" : "grafiche"})</h3>
        <p>${summaryContainer.metri.toFixed(2)} metri x ${summaryContainer.costoAlMetro.toFixed(2)} €/metro = ${summaryContainer.costo.toFixed(2)} €</p>
        <span class='warningMetri'>${disclaimerMinimoOrdine}</span>`;
    }

    function getMetriTotaliScope() {
        summaryContainer.metri = 0;

        for (const singolaGrafica of scopeContainer) {

            if (singolaGrafica && singolaGrafica.metri) {
                const singolaGraficaMetri = parseFloat(singolaGrafica.metri);
                if (!isNaN(singolaGraficaMetri)) {
                    summaryContainer.metri += singolaGraficaMetri;
                }
            }
        }
        return summaryContainer.metri;
    }

}