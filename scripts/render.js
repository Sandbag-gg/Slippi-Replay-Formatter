const { dialog } = require('electron').remote;
var chokidar = require('chokidar');

const fs = require('fs');

//dom elements
const formatButton = document.getElementById("formatBtn");
const pathButton = document.getElementById("pathBtn");
const progressBar = document.getElementById("progBar");
const directoryArea = document.getElementById("directoryArea");
const replayFormat = document.getElementById("nameFormat");
const watchDirToggle = document.getElementById("watchDirToggle");
const debugOutput = document.getElementById("debugOutput");

var watcher;
const invalidChars = ['<', '>', ':', '/', '\\', '|', '?', '*'];

let replayPath = "";

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

formatButton.onclick = async function(e) {
    await parseReplays(replayPath);
};

//prevents user from typing invalid file name characters
replayFormat.oninput = e => {
    for (let i = 0; i < invalidChars.length; i++) {
        replayFormat.value = replayFormat.value.replaceAll(invalidChars[i], "");
    }
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

    watcher.on('add', async path => {
        debugOutput.value += "new file: " + path + "\n";
        checkIfReplay(path).then(result => {
            if(result) {
                debugOutput.value += "New file is replay \n";
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

//parse directory of replays
async function parseReplays(path) {
    if(path == "" || path == null) {return false;}
    if(replayFormat.value == "" || replayFormat.value == null) { return false; }
    progressBar.value = 0

    //loop through each file in directory and parse
    fs.readdir(path, async (err, files) => {
        const length = files.length;
        progressBar.max = length - 1;

        let i = 0;

        //im going to be real
        //I don't know why this works but a for loop doesn't
        //But it does
        (function doParse() {
            parseReplay(path + "\\" + files[i], path);
            progressBar.value = i;

            i++
            if(i<length) {
                setTimeout(doParse, 0)
            }
        })();
    });

    return true;
}

//parse individual replay files
async function parseReplay(replay, path) {
    if(await checkIfReplay(replay)) {
        const stats = fs.lstatSync(replay);
        let output = replayFormat.value;
        //day of week, month, day, year, hour:minute:second, GMT, (timezone)
        let date = stats.mtime.toString().split(' ');

        //there is definitely a better way to do this but this works for now
        output = output.replaceAll("{day}", date[0]);
        output = output.replaceAll("{month}", date[1]);
        output = output.replaceAll("{date}", date[2]);
        output = output.replaceAll("{year}", date[3]);
        output = output.replaceAll("{hour}", date[4].split(':')[0]);
        output = output.replaceAll("{minute}", date[4].split(':')[1]);
        output = output.replaceAll("{second}", date[4].split(':')[2]);

        output = path + "\\" + output + ".slp";

        if(fs.existsSync(output)) {
            renameFile(replay, output.substring(0, output.length - 4), 0);
        } else {
            await fs.rename(replay, output, err => {
                if (err) {
                    parseReplay(replay, path);
                    throw err;
                }
            });
        }

    } else {console.log(replay + " is not a replay");}
}

//checks if given path is file and ends with slippi replay extension
async function checkIfReplay(file) {
    if(fs.lstatSync(file).isFile() && file.endsWith(".slp")) {
        return true;
    } else { return false; }
}


async function renameFile(oldFilePath, filePath, iterator) {
    if(fs.existsSync(filePath + '(' + iterator + ')' + ".slp")) {
        renameFile(oldFilePath, filePath, iterator + 1);
    } else {
        fs.rename(oldFilePath, filePath + '(' + iterator + ')' + ".slp", err => {
            if (err) throw err;
        });
    }
}