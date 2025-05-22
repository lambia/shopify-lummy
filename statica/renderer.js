const appWrapper = "appWrapper";
let gfxCounter = 0;
const texts = {
    loading: "Il configuratore è in caricamento",
    errorLoading: "Si è verificato un errore irreversibile"
};

document.getElementById(appWrapper).innerHTML = texts.loading;
main();

async function main() {
    const partial = await getPartial();
    document.getElementById(appWrapper).innerHTML = "";

    render(partial, gfxCounter);
    gfxCounter++;
    render(partial, gfxCounter);
}

function render(partial="Errore", id=0) {

    const newGfx = `<div class="gfxWrapper" data-gfx-id="${id}">${partial}<div>`;

    document.getElementById(appWrapper).innerHTML += newGfx;
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
