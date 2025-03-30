function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.onload = () => resolve(fileReader.result.split(',')[1]); // Remove "data:*/*;base64,"
        fileReader.onerror = reject;

        fileReader.readAsDataURL(blob);
    });
}

function base64ToBlob(base64, type) {
    const bytes = atob(base64);
    const bytesLength = bytes.length;
    const array = new Uint8Array(bytesLength);
    for (let i = 0; i < bytesLength; i++) {
        array[i] = bytes.charCodeAt(i);
    }

    return new Blob([array], { type })
}

export {blobToBase64, base64ToBlob};
