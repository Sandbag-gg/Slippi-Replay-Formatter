  
const { dialog } = require('electron').remote;

const fs = require('fs');

//buttons
const formatButton = document.getElementById("formatBtn");
const pathButton = document.getElementById("pathBtn");
const progressBar = document.getElementById("progBar");
const directoryArea = document.getElementById("directoryArea");

let replayPath = "";

pathButton.onclick = e => {
    getDirectory().then(value => {
        replayPath = value.filePaths[0];
        directoryArea.innerHTML = replayPath;
      });
};

formatButton.onclick = e => {
    parseReplays(replayPath);
};


async function getDirectory() {
    const directoryPath = await dialog.showOpenDialog({
        buttonLabel:"Choose Folder",
        properties: [
            'openDirectory'
        ]
    });

    return directoryPath;
}

async function parseReplays(path) {
    if(path == "" || path == null) {return false;}
    fs.readdir(path, (err, files) => {
        const length = files.length;
        for (let i = 0; i < length; i++) {
            parseReplay(files[i]);
            progressBar.value = (i/length) * 100;
        }
    });

    return true;
}

function parseReplay(replay) {
    if(checkIfReplay(replay)) {
        
    } else {console.log(replay + " is not a replay");}
}

function checkIfReplay(file) {
    if(file.endsWith(".slp")) {
        return true;
    } else { return false; }
}