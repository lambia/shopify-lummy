ORA:
Logica pulsante disabled: controlla tutti i form
Quando aggiungi una grafica ancora vuota, scrivi già oggetto per invalidare

Bottone "aggiungi carrello" -> scrivi tutti i prodotti in carrello
shopify_dom__quantity e shopify_dom__form

Facili, dopo:
Sistemare Disclaimer-Checkbox (non deve abilitare il pulsante se non era già abilitato)
Disclaimer per aggiunta carrello immutabile
Pulsante rimuovi grafica
Duplica UV/FLUO



    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn); //ToDo: passare event?
        }
    }