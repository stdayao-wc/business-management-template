export function getFileExtension(file) {
    return file.name.split(".").pop().toLowerCase();
}

export function generateStorageFilename(file) {
    return `${crypto.randomUUID()}.${getFileExtension(file)}`;
}