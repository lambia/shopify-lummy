const appWrapper = "appWrapper";
const newGfxBtn = "newGfx";
const shopify_dom__addToCart = '.product-form__buttons button';
const shopify_dom__quantity = '.quantity__input';
const shopify_dom__form = '.product-form form';
const dtfProductFormId = "product-form-template--19062074048780__main";
// const dtfProductVariantId = 45067988533516;
// const dtfProductId = 8577508802828;

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
    
    newGfx(partial);

    document.body.classList.remove("no-scroll");
    document.getElementById("spinner-loader-generale").classList.add("hidden");
    
    document.querySelector("#popup-page-wrapper .popup-inner-wrapper button").addEventListener("click", function(e){
        document.body.classList.remove("no-scroll");
        document.getElementById("popup-page-wrapper").classList.add("hidden");
    });
    message("Attenzione!", "Al fine di garantirti la miglior esperienza utente possibile ti consigliamo di utilizzare il configuratore da PC o MAC.");
    
    document.getElementById("finalAccept").addEventListener("click", aggiungiTuttoAlCarrello);
    document.getElementById(newGfxBtn).addEventListener("click", function (e) {
        newGfx(partial);
    });
}

async function aggiungiTuttoAlCarrello() {
    document.getElementById("spinner-loader-generale").classList.remove("hidden");
    for (const singolaGrafica of scopeContainer) {
        if (!singolaGrafica) {
            continue;
        }
        if (singolaGrafica.aggiungiCarrello) {
            let result = await singolaGrafica.aggiungiCarrello();

            if(!result) {
                alert("Si è verificato un errore durante l'aggiunta al carrello");
                //message("Errore", "Impossibile aggiungere le grafiche al carrello");
                window.location.replace("/cart/clear");
                break;
            }
        }
    }    
    //document.getElementById("spinner-loader-generale").classList.add("hidden");
    //uso replace invece di href per evitare che tornino indietro
    window.location.replace("/cart");
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

function message(title = "Si è verificato un errore imprevisto.", content = "") {
    
    console.error("internal error logger", title, content);

    document.body.classList.add("no-scroll");
    document.getElementById("popup-page-wrapper").classList.remove("hidden");
    const popupWidth = (title.length*1.25 < 40) ? 40 : (title.length*1.25);
    document.querySelector("#popup-page-wrapper .popup-inner-wrapper").style.width = `${popupWidth}rem`;
    document.querySelector("#popup-page-wrapper .popup-inner-title").innerHTML = title;
    document.querySelector("#popup-page-wrapper .popup-inner-content").innerHTML = content;
}