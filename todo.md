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