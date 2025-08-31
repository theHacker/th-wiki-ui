function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.onload = () => resolve(fileReader.result.split(',')[1]); // Remove "data:*/*;base64,"
        fileReader.onerror = reject;

        fileReader.readAsDataURL(blob);
    });
}

function base64ToUtf8String(base64) {
    const bytes = atob(base64);
    const array = Uint8Array.from(bytes, c => c.charCodeAt(0));

    return new TextDecoder('UTF-8').decode(array);
}

function base64ToBlob(base64, type) {
    const bytes = atob(base64);
    const array = Uint8Array.from(bytes, c => c.charCodeAt(0));

    return new Blob([array], { type })
}

export {blobToBase64, base64ToUtf8String, base64ToBlob};
