//ToDo partire con placeholdere e cambiargli src

//document.querySelector(".cart-item__image").src = parsedFile;

const placeholderResult = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/619px-Placeholder_view_vector.svg.png";

async function getThumbnailFromZip(path, cartIndex) {
    const imageBlob = await parseImageFromZip(path);
    console.log("Ricevuta immagine: ", imageBlob);
    if(imageBlob != placeholderResult) {
        document.querySelector(`#CartItem-${cartIndex} img`).src = imageBlob;
    }
}

async function parseImageFromZip(path) {
    let result = placeholderResult;
    console.log("parseImageFromZip loading", path);

    const fileZip = await getFile(path);
    if(!fileZip) { return result; }

    const zip = new JSZip();
    const contenuti = await zip.loadAsync(fileZip);
    if(!contenuti) { return result; }
    
    try {
        if(contenuti.files) {
            let filesObj = Object.entries(contenuti.files);
            if(filesObj && filesObj[0] && filesObj[0][0]) {
                const nomeFile = filesObj[0][0];
                const blobFile = await contenuti.file(nomeFile).async("blob"); //uint8array ??
                const parsedFile = URL.createObjectURL(blobFile)
                result = parsedFile;
            }
        }
    } catch (error) {
        console.error("Errore nell'estrarre l'immagine dall'anteprima", error);
    }

    return result;
}

async function getFile(path) {
    let result = "";

    try {
        let partialResponse = await fetch(path);
        if (!partialResponse.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        result = await partialResponse.blob();
    } catch (error) {
        console.error("Impossibile caricare l'anteprima immagine", error);
        result = false;
    }

    return result;
}