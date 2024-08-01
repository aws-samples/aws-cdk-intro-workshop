import fs = require('node:fs');
import path = require('node:path');
import crypto = require('node:crypto');

/**
 * Calculates an MD5 hash of all files in a directory (recursively)
 */
export function hashDirectorySync(dir: string) {
    const hash = crypto.createHash('md5');

    addFilesToHash(dir);

    return hash.digest('hex');

    function addFilesToHash(dir: string) {
        for (const file of fs.readdirSync(dir)) {
            const filePath = path.join(dir, file);
            if (fs.lstatSync(filePath).isDirectory()) {
                addFilesToHash(filePath);
            } else {
                const data = fs.readFileSync(filePath);
                hash.update(data);
            }
        }
    }
}
