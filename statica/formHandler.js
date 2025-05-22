function formHandlerInit(scope) {

    let wrapper = document.getElementById(`gfxWrapper-${scope}`);
    let incrementale = scope;

    //Variabili d'appoggio DOM
    const dom__dimensioni = wrapper.querySelector('#conf_dimensioni');
    const dom__preview = wrapper.querySelector('#conf_preview');
    const dom__preview_wrapper = wrapper.querySelector('#conf_preview_wrapper');
    const dom__nome_grafica = wrapper.querySelector('#conf_name');
    const dom__file = wrapper.querySelector('#conf_file');
    const dom__file_hq = wrapper.querySelector('#conf_file_hq');
    const dom__quantita = wrapper.querySelector('#conf_quantita');
    const dom__metri_necessari = wrapper.querySelector('#metri_necessari');
    const dom__totale_preventivo = wrapper.querySelector('#totale_preventivo');
    const dom__costo_al_pezzo = wrapper.querySelector('#costo_al_pezzo');
    const dom__costo_al_metro = wrapper.querySelector('#costo_al_metro');

    const shopify_dom__quantity = '.quantity__input';
    const shopify_dom__form = '.product-form form';

    //Costanti
    const placeholder_img =
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/619px-Placeholder_view_vector.svg.png';
    const larghezza_rullo = 550;
    const offset = 0; //al momento considerato solo a destra e sotto
    const price_increments = 0.3;
    const prices = [
        { lessThan: 3.00, price: 15.00 },
        { lessThan: 10.00, price: 13.90 },
        { lessThan: 25.00, price: 12.90 },
        { lessThan: Infinity, price: 12.90 }, //chiedi quotazione
    ];

    //Globali
    let width_mm = 0;
    let height_mm = 0;
    let quantita = 1;

    //Resetto eventuali valori in cache per il form
    reset(true);

    //Imposto gli event listener che avviano il tutto
    dom__file.addEventListener(
        'change',
        function () {
            reset();
            readFile(this.files[0]);
        },
        false
    );

    dom__quantita.addEventListener('input', function (e) {
        quantita = e.target.value;
        if (quantita == 0 || quantita == "" || isNaN(quantita)) {
            quantita = 1;
        }

        calcola_nesting();
    });

    dom__quantita.addEventListener('change', function (e) {
        quantita = e.target.value;
        if (quantita == 0 || quantita == "" || isNaN(quantita)) {
            dom__quantita.value = 1;
            quantita = 1;
        }

        calcola_nesting();
    });

    dom__nome_grafica.addEventListener('focus', function (e) {
        dom__nome_grafica.value = dom__nome_grafica.value.slice(0, -3);
    });
    dom__nome_grafica.addEventListener('blur', function (e) {
        dom__nome_grafica.value += generaIncrementale(dom__nome_grafica.value);
    });

    //Gestione zoom
    dom__preview_wrapper.addEventListener("mousemove", function (e) {
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
    })

    dom__preview_wrapper.addEventListener("mouseleave", function (e) {
        dom__preview.style["transform"] = "unset";
        dom__preview.style["transform-origin"] = "50% 50%";
    });

    function generaIncrementale(testo = "") {
        let risultato = testo;
        if (testo && testo != "" && testo.trim().length) {
            risultato += "-";
        }

        if (incrementale < 10) {
            risultato += "0";
        }

        risultato += incrementale;

        return risultato;
    }

    function reset(initialLoad) {
        console.log('Lummy.configuratore: Resetto il form');
        dom__preview.setAttribute('src', placeholder_img);
        dom__dimensioni.value = '';
        dom__metri_necessari.value = '';
        dom__totale_preventivo.value = '';
        dom__costo_al_pezzo.value = '';
        dom__nome_grafica.value = generaIncrementale();
        dom__costo_al_metro.value = prices[0].price + ' €/m'

        //Resetto il file originale, compresso e header
        dom__file_hq.value = '';
        let newFileContainer = new DataTransfer();
        dom__file_hq.files = newFileContainer.files;

        //Il file caricato viene resettato solo al load iniziale
        if (initialLoad) {
            dom__file.value = '';
            dom__file.files = newFileContainer.files;
        }

        //Resetto i campi originali (nascosti) di shopify (Al primo load lo imposto per il ready)
        if (!initialLoad) {
            document.querySelector(shopify_dom__quantity).value = 0;
        }
    }

    //Funzione per leggere file caricato e inserirlo in DOM
    async function readFile(file) {
        //Debuggo
        console.log(`${file.name} is ${file.type}`);

        //prendo i dati
        const newArrayBuffer = await file.arrayBuffer();
        console.log('newArrayBuffer', newArrayBuffer);

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

        //Stampo il contenuto del form
        console.log(
            'Valori nel form: ',
            Object.fromEntries(new FormData(document.querySelector(shopify_dom__form)))
        );
    }

    //Funzione per inserire l'immagine in pagina
    function getImgSize(imgSrc) {
        //Preparo la creazione dell'image
        let newImg = new Image();
        newImg.onload = function () {
            useImgSize(newImg.height, newImg.width);
        };
        //Carico l'image
        newImg.src = imgSrc;
    }

    //Funzione per recuperare larghezza in pixel e mm da un'immagine del DOM
    function useImgSize(width, height) {
        //calcolo in mm (30 invece di 300)
        width_mm = Math.round((width * 2.54) / 30);
        height_mm = Math.round((height * 2.54) / 30);
        console.log('width_mm', width_mm);
        console.log('height_mm', height_mm);
        console.log('dimensioni', `${width_mm} x ${height_mm} mm`);
        console.log('dimensioni dom', dom__dimensioni);
        //imposto UI
        dom__dimensioni.value = `${width_mm} x ${height_mm} mm`;

        calcola_nesting();
    }

    //Funzione per la scelta del nesting e il calcolo metri lineare
    function calcola_nesting(chiamataInterna=true) {

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
        if (quanti_su_riga_affiancati<1 && quanti_su_riga_ruotati<1) {
            alert("Attenzione!\n\nIl file caricato copre un'area di stampa maggiore della superficie disponibile.\n\n- Assicurati che il file sia corretto (300dpi) o contattaci in caso di necessità particolari.");
            return reset(true);
        }

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
            metri = altezza_affiancati / 1000;
        } else {
            metri = altezza_ruotati / 1000;
        }

        //Aggiungo 0.1 metri fisso
        metri += 0.1;

        //Minimo ordinabile: 1 metro
        metri = (metri < 1) ? 1 : metri;

        //Aggiungo ai metri complessivi fuori scope
        scopeContainer[scope] = { metri, calcola_nesting };
        metriTotaliOrdine = getMetriTotaliScope();
        if(chiamataInterna) {
            aggiornaScope();
        }

        //Calcolo costo al metro, fallback sul max
        const costo_metro = Math.max(...prices.filter(x => metriTotaliOrdine < x.lessThan).map(x => x.price));
        //Se il prezzo è fuori range, fai fallback sul prezzo massimo
        if (costo_metro > Math.max(...prices.map(x => x.price)) || costo_metro < Math.min(...prices.map(x => x.price))) {
            costo_metro = Math.max(...prices.map(x => x.price));
        }
        dom__costo_al_metro.value = costo_metro + ' €/m';

        //Arrotondamento manuale, STRINGA DA QUI
        costo = (metri * costo_metro).toFixed(2);
        metri = metri.toFixed(2);
        costoPezzo = (costo / numero_copie).toFixed(2);
        
        //Calcolo la quantità di shopify necessaria
        pezzi = Math.round(costo / price_increments);
        scopeContainer[scope].pezzi = pezzi;

        //Imposto risultati nel DOM
        dom__metri_necessari.value = metri + ' m';
        dom__totale_preventivo.value = costo + ' €';
        dom__costo_al_pezzo.value = costoPezzo + ' €';

        //Debugger
        console.log('Preventivo aggiornato');
        console.log('Metri necessari: ', metri);
        console.log('Costo: ', costo);
        console.log('Pezzi per shopify: ', pezzi);
    }

    function aggiornaScope() {
        for (const singolaGrafica of scopeContainer) {
            if(singolaGrafica && singolaGrafica.calcola_nesting){
                singolaGrafica.calcola_nesting(false);
            }
        }
    }

    function getMetriTotaliScope() {
        let risultato = 0;

        for (const singolaGrafica of scopeContainer) {
            
            if(singolaGrafica && singolaGrafica.metri) {
                const singolaGraficaMetri = parseFloat(singolaGrafica.metri);
                if(!isNaN(singolaGraficaMetri)){
                    risultato += singolaGraficaMetri;
                }
            }
        }
        return risultato;
    }

}