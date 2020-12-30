  
const { dialog } = require('electron').remote;

const fs = require('fs');

//buttons
const formatButton = document.getElementById("formatBtn");
const pathButton = document.getElementById("pathBtn");
const progressBar = document.getElementById("progBar");
const directoryArea = document.getElementById("directoryArea");
const replayFormat = document.getElementById("nameFormat");

const invalidChars = ['<', '>', ':', '/', '\\', '|', '?', '*']

let replayPath = "";

pathButton.onclick = e => {
    getDirectory().then(value => {
        replayPath = value.filePaths[0];
        directoryArea.innerHTML = replayPath;
      });
};

formatButton.onclick = async e => {
    parseReplays(replayPath);
};

//prevents user from typing invalid file name characters
replayFormat.oninput = e => {
    for (let i = 0; i < invalidChars.length; i++) {
        replayFormat.value = replayFormat.value.replaceAll(invalidChars[i], "");
    }
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
    fs.readdir(path, (err, files) => {
        const length = files.length;

        for (let i = 0; i < length; i++) {
            parseReplay(path + "\\" + files[i], path);
            progressBar.value = (i/length) * 100;
        }
    });

    return true;
}

//parse individual replay files
async function parseReplay(replay, path) {
    if(checkIfReplay(replay)) {
        const stats = fs.lstatSync(replay);
        let output = replayFormat.value;
        //day of week, month, day, year, hour:minute:second, GMT, (timezone)
        let date = stats.ctime.toString().split(' ');

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
                if (err) throw err;
            }); 
        }

    } else {console.log(replay + " is not a replay");}
}

//checks if given path is file and ends with slippi replay extension
function checkIfReplay(file) {
    if(fs.lstatSync(file).isFile() && file.endsWith(".slp")) {
        return true;
    } else { return false; }
}

function renameFile(oldFilePath, filePath, iterator) {
    if(fs.existsSync(filePath + '(' + iterator + ')' + ".slp")) {
        renameFile(oldFilePath, filePath, iterator + 1);
    } else { 
        fs.rename(oldFilePath, filePath + '(' + iterator + ')' + ".slp", err => {
            if (err) throw err;
        });
    }
}