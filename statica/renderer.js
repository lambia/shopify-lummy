const appWrapper = "appWrapper";
const newGfxBtn = "newGfx";
const shopify_dom__addToCart = '.product-form__buttons button';
const shopify_dom__quantity = '.quantity__input';
const shopify_dom__form = '.product-form form';
const dtfProductFormId = "product-form-template--19062074048780__main";

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

let productID = false;

document.body.classList.add("no-scroll");
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

    productID = getProductID();

    newGfx(partial, productID);

    document.body.classList.remove("no-scroll");
    document.getElementById("spinner-loader-generale").classList.add("hidden");

    message("Attenzione!", "Al fine di garantirti la miglior esperienza utente possibile ti consigliamo di utilizzare il configuratore da PC o MAC.");

    document.getElementById("finalAccept").addEventListener("click", aggiungiTuttoAlCarrello);
    document.getElementById(newGfxBtn).addEventListener("click", function (e) {
        newGfx(partial, productID);
    });
}

function getProductID() {
    let productID = false;
    try {
        const shopifyProductForm = document.querySelector('.product-form form');
        const product = Object.fromEntries(new FormData(shopifyProductForm));
        productID = product.id;
    } catch (error) {
        console.error("Errore irreversibile: impossibile trovare un product ID valido");
    } finally {
        return productID;
    }
}

async function aggiungiTuttoAlCarrello() {

    if(summaryContainer.metri <= 0) {
        message("Errore", "La configurazione che hai provato ad aggiungere al carrello sembra essere vuota. Prego verificare e riprovare.");
        return;
    }

    document.getElementById("spinner-loader-generale").classList.remove("hidden");

    for (const singolaGrafica of scopeContainer) {
        if (!singolaGrafica) {
            continue;
        }
        if (singolaGrafica.aggiungiCarrello) {
            let result = await singolaGrafica.aggiungiCarrello();

            if (!result) {
                // alert("Si è verificato un errore durante l'aggiunta al carrello");
                message("Errore", "Impossibile aggiungere le grafiche al carrello");
                setTimeout(function () {
                    window.location.replace("/cart/clear");
                }, 5000);
                break;
            }
        }
    }

    //se minore, calcola differenza
    console.log("Metri aggiunti carrello: ", summaryContainer.metri);

    const sfrido = 0.10;
    let metriMancanti = (summaryContainer.metri < 1) ? (1 - summaryContainer.metri) : sfrido;
    metriMancanti = metriMancanti.toFixed(2);

    const price_increments = 0.30;
    let costo = (metriMancanti * summaryContainer.costoAlMetro).toFixed(2);
    pezzi = Math.round(costo / price_increments);

    console.log("Metri mancanti: ", metriMancanti);

    //metriMancanti.toFixed(2);
    let sfridoResult = await aggiungiSfridoAlCarrello( metriMancanti, pezzi );

    if (!sfridoResult) {
        message("Errore", "Impossibile aggiungere le grafiche al carrello");
        setTimeout(function () {
            window.location.replace("/cart/clear");
        }, 5000);
    } else {
        //document.getElementById("spinner-loader-generale").classList.add("hidden");
        //uso replace invece di href per evitare che tornino indietro
        window.location.replace("/cart");
    }

}

async function aggiungiSfridoAlCarrello(metri, pezzi) {

    const newProduct = new FormData();
    newProduct.set(metri=="0.10" ? "properties[sfrido]" : "properties[minimoordine]", true);
    newProduct.set("id", productID);
    newProduct.set("properties[metri necessari]", metri);
    newProduct.set("quantity", pezzi);

    let result = false;

    try {
        const response = await fetch(`/cart/add.js`, {
            method: "POST",
            headers: {
                Accept: "application/javascript",
                "X-Requested-With": "XMLHttpRequest"
            },
            body: newProduct
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        result = await response.json();

        if (result.key) {
            result = true;
        }

    } catch (error) {
        console.error("Errore carrello: ", error);
        message("Errore irreversibile", "Impossibile calcolare lo sfrido durante l'aggiunta al carrello.<br>Si prega di riprovare.");
        setTimeout(function () {
            window.location.replace("/cart/clear");
        }, 5000);

    } finally {
        return result;
    }
}

function newGfx(partial = "Errore") {
    const newGfx = `<div class="gfxWrapper" id="gfxWrapper-${gfxCounter}" data-gfx-id="${gfxCounter}">${partial}<div>`;
    document.getElementById(appWrapper).insertAdjacentHTML('beforeend', newGfx)
    formHandlerInit(gfxCounter, productID); //external function!!
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

function message(title = "Si è verificato un errore imprevisto.", content = "") {

    console.error("Internal Logger:", title, content);

    document.body.classList.add("no-scroll");
    const popupWidth = (title.length * 1.25 < 40) ? 40 : (title.length * 1.25);

    document.getElementById("popupsContainer").insertAdjacentHTML("afterbegin",
        `<div id="popup-page-wrapper" onclick="document.body.classList.remove('no-scroll'); this.remove(); ">
            <div class="popup-inner-wrapper" style="width: ${popupWidth}rem;">
                <div class="popup-inner-title">${title}</div>
                <div class="popup-inner-content">${content}</div>
                <div class="popup-inner-button">
                    <button>Chiudi</button>
                </div>
            </div>
        </div>`
    );

}