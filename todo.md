rimuovere tasto carrello e quantity form da LIQUID (solo ajax)
aggiungere "svuota tutto in carrello?"
vedere se si può smezzare l'immagine sdoppiata
duplicare tutto per prodotto diverso (v. id)
dopo aggiunta carrello far mostrare popup? (thisGfxForm.set)

Logica pulsante disabled: controlla tutti i form
Quando aggiungi una grafica ancora vuota, scrivi già oggetto per invalidare
shopify_dom__quantity e shopify_dom__form

Sistemare Disclaimer-Checkbox (non deve abilitare il pulsante se non era già abilitato)
Dal carrello no cambio quantità, solo svuota
Disclaimer per aggiunta carrello immutabile


    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn); //ToDo: passare event?
        }
    }


CHIAMATA OK:

let prodotti = {
    items: [,
        {
            id: 45067988533516, //variante default
            // product_id: 8577508802828, //id prodotto
            quantity: 7,
            properties: { nome: "prova1", note: "ciao1", dimensioni: "piccole1", quantita: 123 }
        },
        {
            id: 45067988533516, //variante default
            // product_id: 8577508802828, //id prodotto
            quantity: 14,
            properties: { nome: "prova2", note: "ciao2", dimensioni: "piccole2", quantita: 123 }
        }
    ]
};

let cfg = {
    method: "POST",
    headers: {
        //Accept: "application/javascript",
        'Content-Type': 'application/json',
        //"X-Requested-With": "XMLHttpRequest"
    },
    body: JSON.stringify(prodotti)
};

async function chiamata() {
    try {
        const response = await fetch("/cart/add.js", cfg);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        result = await response.json();
        console.log("Risultato ---> ", result);
    } catch (error) {
        console.error("Impossibile aggiungere al carrello", error);
    }
}

chiamata();