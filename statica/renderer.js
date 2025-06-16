const appWrapper = "appWrapper";
const newGfxBtn = "newGfx";
const shopify_dom__addToCart = '.product-form__buttons button';
const shopify_dom__quantity = '.quantity__input';
const shopify_dom__form = '.product-form form';
const dtfProductFormId = "product-form-template--19062074048780__main";
// const dtfProductVariantId = 45067988533516;
// const dtfProductId = 8577508802828;

const welcomeMsg = "Al fine di garantirti la miglior esperienza utente possibile ti consigliamo l'utilizzo del configuratore da PC o MAC.";

//gli ID vengono usati come indici dell'array, il valore sono i metri della grafica
const scopeContainer = [];
const summaryContainer = {
    costo: 0,
    pezzi: 0,
    metri: 0,
    costoAlMetro: 0,
    grafiche: 0
};
let gfxCounter = 1;
const texts = {
    loading: "Il configuratore è in caricamento",
    errorLoading: "Si è verificato un errore irreversibile"
};


document.getElementById(appWrapper).innerHTML = texts.loading;
main();

async function main() {
    const partial = await getPartial();
    document.getElementById(appWrapper).innerHTML = "";
    window["newGfx"] = newGfx;
    window["partial"] = partial;

    document.querySelector(shopify_dom__addToCart).disabled = true;
    document.querySelector(shopify_dom__addToCart).style.display = "none";
    document.querySelector(shopify_dom__addToCart).remove();

    
    newGfx(partial);
    
    alert(welcomeMsg);
    
    document.getElementById("finalAccept").addEventListener("click", aggiungiTuttoAlCarrello);
    document.getElementById(newGfxBtn).addEventListener("click", function (e) {
        newGfx(partial);
    });
}

async function aggiungiTuttoAlCarrello() {
    for (const singolaGrafica of scopeContainer) {
        if (!singolaGrafica) {
            continue;
        }
        if (singolaGrafica.aggiungiCarrello) {
            let result = await singolaGrafica.aggiungiCarrello();

            if(!result) {
                alert("Si è verificato un errore durante l'aggiunta al carrello");
                window.location.replace("/cart/clear");
                break;
            }
        }
    }
    //uso replace invece di href per evitare che tornino indietro
    window.location.replace("/cart");
}

// function valida() {
//     let validazione = true;
//     let pezziTotali = 0;
//     for (let i = 0; i < scopeContainer.length; i++) {
//         const grafica = scopeContainer[i];
//         console.log("grafica", grafica);

//         if (grafica == undefined) {
//             continue; //Skippa grafica rimossa o indice [0]
//         }
//         if (!grafica || !grafica.valid || !grafica.pezzi > 0 || !grafica.metri >= 1) {
//             validazione = false; //qualcosa non va
//             break;
//         } else {
//             pezziTotali += grafica.pezzi;
//         }

//     }
//     console.log("Pezzi finali: ", pezziTotali);
//     // document.querySelector(shopify_dom__quantity).value = pezziTotali;
// }

function newGfx(partial = "Errore") {
    const newGfx = `<div class="gfxWrapper" id="gfxWrapper-${gfxCounter}" data-gfx-id="${gfxCounter}">${partial}<div>`;
    document.getElementById(appWrapper).insertAdjacentHTML('beforeend', newGfx)
    formHandlerInit(gfxCounter); //external function!!
    gfxCounter++;
}

async function getPartial() {
    const partialURL = "https://raw.githubusercontent.com/lambia/shopify-lummy/refs/heads/main/statica/partial.html";
    let result = "";

    try {
        let partialResponse = await fetch(partialURL);
        if (!partialResponse.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        let partialText = await partialResponse.text();

        // result = partialText.replaceAll("{{product_form_id}}", productFormId);
        result = partialText;

    } catch (error) {
        console.error("Impossibile caricare il configuratore", error);
        result = texts.errorLoading;
    }

    return result;
}

function init() {
    console.log("Inizializzato");
}
