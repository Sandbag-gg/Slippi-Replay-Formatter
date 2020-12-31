const fs = require('fs');

//checks if given path is file and ends with slippi replay extension
export default async function checkIfReplay(file) {
    if(fs.lstatSync(file).isFile() && file.endsWith(".slp")) {
        return true;
    } else { return false; }
}