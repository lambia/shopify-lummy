//const partialURL = "https://www.lambia.it/shopify/partial.txt";
const partialURL = "https://raw.githubusercontent.com/lambia/shopify-lummy/refs/heads/main/statica/partial.txt";

fetch(partialURL).then(r => r.text()).then(response => {
    console.log("Response: ", response);
    document.getElementById("conf_preview_columns").innerHTML = response;
}).catch(err=> {
    console.error("Impossibile caricare il configuratore", err);
});