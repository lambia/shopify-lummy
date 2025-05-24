const appWrapper = "appWrapper";
const newGfxBtn = "newGfx";
// const shopify_dom__addToCart = '.product-form__buttons button';
// const shopify_dom__buyNow = ".shopify-payment-button";
const shopify_dom__quantity = '.quantity__input';
// const shopify_dom__form = '.product-form form';
// const dom__disclaimer = wrapper.querySelector('#conf_disclaimer');

//gli ID vengono usati come indici dell'array, il valore sono i metri della grafica
const scopeContainer = [];
let gfxCounter = 1;
const texts = {
    loading: "Il configuratore è in caricamento",
    errorLoading: "Si è verificato un errore irreversibile"
};

//document.querySelector(shopify_dom__addToCart).disabled = true;
//document.querySelector(shopify_dom__buyNow).remove();
document.getElementById(appWrapper).innerHTML = texts.loading;
main("product-form-template--19062074048780__main");

async function main(productFormId) {
    const partial = await getPartial(productFormId);
    document.getElementById(appWrapper).innerHTML = "";

    newGfx(partial);

    document.getElementById(newGfxBtn).addEventListener("click", function(e) {
        newGfx(partial);
    });
}

function valida() {
    let validazione = true;
    let pezziTotali = 0;
    for (const grafica of scopeContainer) {
        console.log(grafica);

        //Grafica rimossa o indice [0]
        if(grafica==undefined) {
            continue;
        }

        if(!grafica || !grafica.pezzi>0 && !grafica.metri>=1) {
            validazione = false;
            break;
        } else {
            pezziTotali += grafica.pezzi;
        }
    }
    console.log("Pezzi finali: ", pezziTotali);
    document.querySelector(shopify_dom__quantity).value = pezziTotali;
}

function newGfx(partial="Errore") {
    const newGfx = `<div class="gfxWrapper" id="gfxWrapper-${gfxCounter}">${partial}<div>`;
    document.getElementById(appWrapper).insertAdjacentHTML('beforeend', newGfx)
    formHandlerInit(gfxCounter); //external function!!
    gfxCounter++;
}

async function getPartial(productFormId) {
    const partialURL = "https://raw.githubusercontent.com/lambia/shopify-lummy/refs/heads/main/statica/partial.html";
    let result = "";
    
    try {
        let partialResponse = await fetch(partialURL);
        if (!partialResponse.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        let partialText = await partialResponse.text();

        result = partialText.replaceAll("{{product_form_id}}", productFormId);

    } catch (error) {
        console.error("Impossibile caricare il configuratore", error);
        result = texts.errorLoading;
    }

    return result;
}

function init() {
    console.log("Inizializzato");
}
