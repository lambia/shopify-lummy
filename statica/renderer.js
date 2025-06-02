const appWrapper = "appWrapper";
const newGfxBtn = "newGfx";
// const shopify_dom__addToCart = '.product-form__buttons button';
// const shopify_dom__buyNow = ".shopify-payment-button";
const dom__addToCartCustom = 'addToCartCustom';
const shopify_dom__quantity = '.quantity__input';
const shopify_dom__form = '.product-form form';
// const dom__disclaimer = wrapper.querySelector('#conf_disclaimer');
const dtfProductFormId = "product-form-template--19062074048780__main";
const dtfProductId = 45067988533516;
const welcomeMsg = "Al fine di garantirti la miglior esperienza utente possibile ti consigliamo l'utilizzo del configuratore da PC";

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

//document.querySelector(shopify_dom__addToCart).disabled = true;
//document.querySelector(shopify_dom__buyNow).remove();
document.getElementById(appWrapper).innerHTML = texts.loading;
main();

async function main() {
    const partial = await getPartial();
    document.getElementById(appWrapper).innerHTML = "";
    document.getElementById(dom__addToCartCustom).addEventListener("click", addToCartCustom);
    newGfx(partial);

    alert(welcomeMsg);

    document.getElementById(newGfxBtn).addEventListener("click", function (e) {
        newGfx(partial);
    });
}

async function addToCartCustom() {
    // per ogni prodotto, aggiungi dtfProductFormId, pusha 
    const wrappers = document.getElementById(appWrapper).getElementsByClassName("gfxWrapper");

    let validation = true;
    let bigError = false;

    for (const wrapper of wrappers) {
        const wrapperId = wrapper.dataset.gfxId;
        const grafica = scopeContainer[wrapperId];

        if (!wrapperId || !grafica) {
            validation = false;
            wrapper.classList.add("wrapperValidationError");
            bigError = true;
            continue;
        } else if (!grafica.valid || !grafica.pezzi > 0 || !grafica.metri >= 1 || !grafica.costo) {
            validation = false;
            wrapper.classList.add("wrapperValidationError");
            continue;
        } else {
            wrapper.classList.remove("wrapperValidationError");
        }
    }

    console.log("Validazione: ", validation);

    if (!validation && !bigError) {
        alert("Impossibile aggiungere al carrello: sono presenti grafiche non valide, ricontrollare e riprovare.")
        document.body.scrollTop = 0; //Safari
        document.documentElement.scrollTop = 0; //tutto il resto del mondo
        return;
    } else if (bigError) {
        alert("Si è verificato un errore irreversibile. Si prega di ricaricare la pagina e riprovare.");
        return;
    }

    const prodotti = {
        items: []
    };

    for (const wrapper of wrappers) {
        const wrapperId = wrapper.dataset.gfxId;
        const grafica = scopeContainer[wrapperId];
        const propertiesForm = wrapper.querySelector("form");

        if (!wrapperId || !grafica || !grafica.pezzi || !propertiesForm) {
            continue;
        }

        const properties = Object.fromEntries(new FormData(propertiesForm));

        /*
        thisGfxForm.set("sections", "cart-notification-product,cart-notification-button,cart-icon-bubble");
        thisGfxForm.set("sections_url", "/products/dtf-custom-product");
        */

        prodotti.items.push({
            id: dtfProductId,
            quantity: grafica.pezzi,
            properties
        });
    }

    let cfg = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            //Accept: "application/javascript",
            //"X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify(prodotti)
    };

    try {
        const response = await fetch("/cart/add.js", cfg);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        result = await response.json();
        console.log("Risultato ---> ", result);
        alert("qui ci va un messaggio di conferma");
    } catch (error) {
        alert("Si è verificato un errore. Impossibile aggiungere al carrello.");
        console.error("Errore carrello: ", error);
    }

}

function valida() {
    let validazione = true;
    let pezziTotali = 0;
    for (let i = 0; i < scopeContainer.length; i++) {
        const grafica = scopeContainer[i];
        console.log("grafica", grafica);

        if (grafica == undefined) {
            continue; //Skippa grafica rimossa o indice [0]
        }
        if (!grafica || !grafica.valid || !grafica.pezzi > 0 || !grafica.metri >= 1) {
            validazione = false; //qualcosa non va
            break;
        } else {
            pezziTotali += grafica.pezzi;
        }

    }
    console.log("Pezzi finali: ", pezziTotali);
    // document.querySelector(shopify_dom__quantity).value = pezziTotali;
}

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
