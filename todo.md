- differenziare gli scaglioni prezzi in base al prodotto
- aggiornare tabella prezzi dinamicamente
- aggiungere i link a questi prodotti nel menu o da qualche parte (jimmy)
- pushare anche mail-template.liquid
- aggiornare il template delle mail perchè sicuro si è spaccato
- seguire tutto il flow per verificare in quali altri posti non funziona l'anteprima della grafica (es. pagina ordini, mail ecc...)


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