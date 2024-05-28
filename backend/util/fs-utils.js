const fs = require('fs');
const path = require("path");

async function clearFolder(dirPath) {
    try {
        const files = await fs.promises.readdir(dirPath);
        const deletePromises = files.map(async (file) => {
            const filePath = path.join(dirPath, file);
            const fileStat = await fs.promises.stat(filePath);
            if (fileStat.isDirectory()) {
                await clearFolder(filePath); // Recursively clear subdirectories
                await fs.promises.rmdir(filePath);
            } else {
                await fs.promises.unlink(filePath);
            }
        });

        await Promise.all(deletePromises);
    } catch (error) {
        console.error('Failed to clear directory:', error);
    }
}

module.exports = {
    clearFolder,
};