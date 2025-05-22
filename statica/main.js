//Variabili d'appoggio DOM
const dom__dimensioni = document.getElementById('conf_dimensioni');
const dom__preview = document.getElementById('conf_preview');
const dom__preview_wrapper = document.getElementById('conf_preview_wrapper');
const dom__nome_grafica = document.getElementById('conf_name');
const dom__file = document.getElementById('conf_file');
const dom__file_hq = document.getElementById('conf_file_hq');
const dom__quantita = document.getElementById('conf_quantita');
const dom__disclaimer = document.getElementById('conf_disclaimer');
const dom__metri_necessari = document.getElementById('metri_necessari');
const dom__totale_preventivo = document.getElementById('totale_preventivo');
const dom__costo_al_pezzo = document.getElementById('costo_al_pezzo');
const dom__costo_al_metro = document.getElementById('costo_al_metro');
const shopify_dom__quantity = '.quantity__input';
const shopify_dom__addToCart = '.product-form__buttons button';
let incrementale = 1;

//Costanti
const placeholder_img =
	'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/619px-Placeholder_view_vector.svg.png';
const larghezza_rullo = 550;
const offset = 0; //al momento considerato solo a destra e sotto
const price_increments = 0.3;
const prices = [
	{ lessThan: 3.00, price: 15.00 },
	{ lessThan: 10.00, price: 13.90 },
	{ lessThan: 25.00, price: 12.90 },
	{ lessThan: Infinity, price: 12.90 }, //chiedi quotazione
];

//Globali
var width_mm = 0;
var height_mm = 0;

//Resetto eventuali valori in cache per il form
reset(true);

//Imposto gli event listener che avviano il tutto
dom__file.addEventListener(
	'change',
	function () {
		reset();
		readFile(this.files[0]);
	},
	false
);

dom__quantita.addEventListener('input', function (e) {
	let valore = e.target.value;
	if (valore == 0 || valore == "" || isNaN(valore)) {
		valore = 1;
	}
	calcola_nesting(width_mm, height_mm, valore);
});

dom__quantita.addEventListener('change', function (e) {
	const valore = e.target.value;
	if (valore == 0 || valore == "" || isNaN(valore)) {
		dom__quantita.value = 1;
		calcola_nesting(width_mm, height_mm, dom__quantita.value);
	}
});

dom__disclaimer.addEventListener('change', function (e) {
	if (e.target.checked) {
		document.querySelector(shopify_dom__addToCart).disabled = false;
	} else {
		document.querySelector(shopify_dom__addToCart).disabled = true;
	}
});

dom__nome_grafica.addEventListener('focus', function (e) {
	dom__nome_grafica.value = dom__nome_grafica.value.slice(0, -3);
});
dom__nome_grafica.addEventListener('blur', function (e) {
	dom__nome_grafica.value += generaIncrementale(dom__nome_grafica.value);
});

//Gestione zoom
dom__preview_wrapper.addEventListener("mousemove", function (e) {
	const imgBox = dom__preview_wrapper.getBoundingClientRect();
	const imgStepY = imgBox.height / 100;
	const imgStepX = imgBox.width / 100;
	const relativeTop = e.clientY - imgBox.top;
	const relativeLeft = e.clientX - imgBox.left;

	const percentageY = Math.round(relativeTop / imgStepY);
	const percentageX = Math.round(relativeLeft / imgStepX);
	const position = percentageX + "% " + percentageY + "%";

	dom__preview.style["transform"] = "scale(3)";
	dom__preview.style["transform-origin"] = position;
})

dom__preview_wrapper.addEventListener("mouseleave", function (e) {
	dom__preview.style["transform"] = "unset";
	dom__preview.style["transform-origin"] = "50% 50%";
});

function generaIncrementale(testo = "") {
	let risultato = testo;
	if (testo && testo != "" && testo.trim().length) {
		risultato += "-";
	}

	if (incrementale < 10) {
		risultato += "0";
	}

	risultato += incrementale;

	return risultato;
}

function reset(initialLoad) {
	console.log('Lummy.configuratore: Resetto il form');
	dom__preview.setAttribute('src', placeholder_img);
	dom__dimensioni.value = '';
	dom__metri_necessari.value = '';
	dom__totale_preventivo.value = '';
	dom__costo_al_pezzo.value = '';
	dom__nome_grafica.value = generaIncrementale();
	dom__costo_al_metro.value = prices[0].price + ' €/m'

	//Resetto il file originale, compresso e header
	dom__file_hq.value = '';
	let newFileContainer = new DataTransfer();
	dom__file_hq.files = newFileContainer.files;
	if (initialLoad) {
		dom__file.value = '';
		dom__file.files = newFileContainer.files;
	}

	//Resetto i campi originali (nascosti) di shopify
	if (initialLoad != true) {
		document.querySelector(shopify_dom__quantity).value = 0;
		document.querySelector(shopify_dom__addToCart).disabled = true;
	}
}

//Funzione per leggere file caricato e inserirlo in DOM
async function readFile(file) {
	//Debuggo
	console.log(`${file.name} is ${file.type}`);

	//prendo i dati
	const newArrayBuffer = await file.arrayBuffer();
	console.log('newArrayBuffer', newArrayBuffer);

	//creo uno zip
	const zip = new JSZip();
	zip.file(file.name, newArrayBuffer, { binary: true });

	//ToDO gestire: catch (se si rompe) + async (se uno va avanti mentre carica)
	zip.generateAsync({ type: 'blob' }).then(function (content) {
		//Prendo il nuovo blob converto in file
		const newFile = new File([content], `${file.name}.zip`, { type: 'application/zip' });
		console.log(`Zip generated: ${newFile.name} is ${newFile.type}`);

		//Sposto il file binario nel secondo input
		let newFileContainer = new DataTransfer();
		newFileContainer.items.add(newFile);
		dom__file_hq.files = newFileContainer.files;
	});

	//Preparo lettura file
	const reader = new FileReader();
	reader.onload = async (event) => {
		let imgPath = event.target.result;
		dom__preview.setAttribute('src', imgPath);
		getImgSize(imgPath);
	};
	//Leggo i file
	reader.readAsDataURL(file);

	//Stampo il contenuto del form
	console.log(
		'Valori nel form: ',
		Object.fromEntries(new FormData(document.querySelector('.product-form form')))
	);
}

//Funzione per inserire l'immagine in pagina
function getImgSize(imgSrc) {
	//Preparo la creazione dell'image
	let newImg = new Image();
	newImg.onload = function () {
		useImgSize(newImg.height, newImg.width);
	};
	//Carico l'image
	newImg.src = imgSrc;
}

//Funzione per recuperare larghezza in pixel e mm da un'immagine del DOM
function useImgSize(width, height) {
	//calcolo in mm (30 invece di 300)
	width_mm = Math.round((width * 2.54) / 30);
	height_mm = Math.round((height * 2.54) / 30);
	console.log('width_mm', width_mm);
	console.log('height_mm', height_mm);
	console.log('dimensioni', `${width_mm} x ${height_mm} mm`);
	console.log('dimensioni dom', dom__dimensioni);
	//imposto UI
	dom__dimensioni.value = `${width_mm} x ${height_mm} mm`;

	calcola_nesting(width_mm, height_mm, dom__quantita.value);
}

//Funzione per la scelta del nesting e il calcolo metri lineare
function calcola_nesting(larghezza_grafica, altezza_grafica, numero_copie) {
	//Preparo i risultati
	let altezza_affiancati = 0;
	let altezza_ruotati = 0;
	let metri = 0;
	let costo = 0;

	//Uso floor per considerare solo un numero INTERO di item/riga.
	//Es. grafica da 20 su rullo 50 => 2,5/riga => 2/riga, su 2 righe
	const quanti_su_riga_affiancati = Math.floor(larghezza_rullo / (larghezza_grafica + offset));
	const quanti_su_riga_ruotati = Math.floor(larghezza_rullo / (altezza_grafica + offset));

	//Calcolo Affiancati
	if (quanti_su_riga_affiancati >= 1) {
		let quante_righe = Math.ceil(numero_copie / quanti_su_riga_affiancati); //ceil per calcolare la riga intera anche se poco usata (es. 11/2)
		altezza_affiancati = altezza_grafica * quante_righe;
	}

	//Calcolo Ruotati 90°
	if (quanti_su_riga_ruotati >= 1) {
		let quante_righe = Math.ceil(numero_copie / quanti_su_riga_ruotati); //ceil per calcolare la riga intera anche se poco usata (es. 11/2)
		altezza_ruotati = larghezza_grafica * quante_righe;
	}

	//Calcolo finale
	if (altezza_affiancati < altezza_ruotati) {
		metri = altezza_affiancati / 1000;
	} else {
		metri = altezza_ruotati / 1000;
	}

	//Calcolo costo al metro, fallback sul max
	const costo_metro = Math.max(...prices.filter(x => metri < x.lessThan).map(x => x.price));
	if (costo_metro > Math.max(...prices.map(x => x.price)) || costo_metro < Math.min(...prices.map(x => x.price))) {
		costo_metro = Math.max(...prices.map(x => x.price));
	}
	dom__costo_al_metro.value = costo_metro + ' €/m';

	//Aggiungo 0.1 metri fisso
	metri += 0.1;

	//Arrotondamento manuale
	metri = metri.toFixed(2);

	//Minimo ordinabile: 1 metro
	metri = (metri < 1) ? 1 : metri;

	costo = (metri * costo_metro).toFixed(2);
	costoPezzo = (costo / numero_copie).toFixed(2);

	//Imposto risultati nel DOM
	dom__metri_necessari.value = metri + ' m';
	dom__totale_preventivo.value = costo + ' €';
	dom__costo_al_pezzo.value = costoPezzo + ' €';

	//Calcolo la quantità di shopify necessaria
	pezzi = Math.round(costo / price_increments);
	document.querySelector(shopify_dom__quantity).value = pezzi; //bisogna farlo qui

	//Debugger
	console.log('Preventivo aggiornato');
	console.log('Metri necessari: ', metri);
	console.log('Costo: ', costo);
	console.log('Pezzi per shopify: ', pezzi);

	document.querySelector(shopify_dom__addToCart).disabled = false; //bisogna farlo qui
}