const appWrapper = "appWrapper";
const newGfxBtn = "newGfx";
let gfxCounter = 1;
const texts = {
    loading: "Il configuratore è in caricamento",
    errorLoading: "Si è verificato un errore irreversibile"
};
//gli ID vengono usati come indici dell'array, il valore sono i metri della grafica
const metriTotaliPerScope = [];

document.getElementById(appWrapper).innerHTML = texts.loading;
main();

async function main() {
    const partial = await getPartial();
    document.getElementById(appWrapper).innerHTML = "";

    newGfx(partial);

    document.getElementById(newGfxBtn).addEventListener("click", function(e) {
        newGfx(partial);
    });
}

function newGfx(partial="Errore") {
    const newGfx = `<div class="gfxWrapper" id="gfxWrapper-${gfxCounter}">${partial}<div>`;
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
