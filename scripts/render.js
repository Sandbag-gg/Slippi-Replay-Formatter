const { dialog } = require('electron').remote;
var chokidar = require('chokidar');
var AutoLaunch = require('auto-launch');

import replayCheck from './checkIfReplay.js';
import {parseReplays, parseReplay} from './parsing.js'
import {insertTemplates, insertLastFormat, saveFormat} from './formatHandeler.js';

//dom elements
const formatButton = document.getElementById("formatBtn");
const pathButton = document.getElementById("pathBtn");
const progressBar = document.getElementById("progBar");
const directoryArea = document.getElementById("directoryArea");
const replayFormat = document.getElementById("nameFormat");
const watchDirToggle = document.getElementById("watchDirToggle");
const debugOutput = document.getElementById("debugOutput");
const startupToggle = document.getElementById("startupToggle");
var AutoLauncher = new AutoLaunch({
    name: 'SlippiReplayFormatter'
});


var watcher;
let replayPath = "";
let formatTimeout;

pathButton.onclick = e => {
    if(watcher != null) {
        watcher.close().then(debugOutput.value += "watcher closed \n");
    }
    getDirectory().then(value => {
        replayPath = value.filePaths[0];
        directoryArea.innerHTML = replayPath;
       
        if(watchDirToggle.checked) {
            createWatcher(replayPath);
        }
    });
};

watchDirToggle.onchange = async e => {
    if(!watchDirToggle.checked && watcher != null) {
            watcher.close().then(debugOutput.value += "watcher closed \n");
    } else if(watchDirToggle.checked && replayPath != null && replayPath != "") {
        createWatcher(replayPath)
    }
}   

startupToggle.onchange = async e => {    
    if(startupToggle.checked) {
        AutoLauncher.enable();
    } else {
        AutoLauncher.disable();
    }
}

formatButton.onclick = async function(e) {
    await parseReplays(replayPath, replayFormat, progressBar);
};

//prevents user from typing invalid file name characters
replayFormat.oninput = e => {
    const invalidChars = ['<', '>', ':', '/', '\\', '|', '?', '*'];
    for (let i = 0; i < invalidChars.length; i++) {
        replayFormat.value = replayFormat.value.replaceAll(invalidChars[i], "");
    }
    if(formatTimeout != null) clearTimeout(formatTimeout);
    formatTimeout = setTimeout(() => {
        saveFormat("./data/user.json", replayFormat);
    }, 10000);
}

function createWatcher(watchPath) {
    watcher = chokidar.watch(watchPath, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 5000,
            pollInterval: 5000
          },
    });

    watcher.on('ready', () => {
        debugOutput.value += "now watching \n";
    });

    watcher.on('add', async function(path) {
        debugOutput.value += "new file: " + path + "\n";
        replayCheck(path).then(async result => {
            if(result) {
                debugOutput.value += "New file is replay \n";
                if(replayFormat.value == "" || replayFormat.value == null) { return false; }
                else {
                    parseReplay(path, replayPath, replayFormat).then(output => {
                        watcher.unwatch(output);
                        debugOutput.value += "File formatted to: " + output + "\n";
                    });
                }
            } else { debugOutput.value += "New file is not replay \n"; }
        });
    });
}

//opens file dialog and returns selected directory
async function getDirectory() {
    const directoryPath = await dialog.showOpenDialog({
        buttonLabel:"Choose Folder",
        properties: [
            'openDirectory'
        ]
    });

    return directoryPath;
}

//load replay name templates
insertTemplates("./data/templates.json", "templates");
insertLastFormat("./data/user.json", replayFormat);