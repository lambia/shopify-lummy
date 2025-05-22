const partialURL = "https://raw.githubusercontent.com/lambia/shopify-lummy/refs/heads/main/statica/partial.html";

fetch(partialURL).then(r => r.text()).then(response => {
    document.getElementById("conf_preview_columns").innerHTML = response;
}).catch(err=> {
    console.error("Impossibile caricare il configuratore", err);
});