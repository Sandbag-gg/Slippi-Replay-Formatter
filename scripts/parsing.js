const fs = require('fs');
const { default: SlippiGame, stages } = require('@slippi/slippi-js');
import checkIfReplay from './checkIfReplay.js';
import getGameData from './gameData.js';

//parse directory of replays
export async function parseReplays(path, replayFormat, progressBar) {
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
            parseReplay(path + "\\" + files[i], path, replayFormat);
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
export async function parseReplay(replay, path, replayFormat) {
    if(await checkIfReplay(replay)) {
        const stats = fs.lstatSync(replay);
        const game = await new SlippiGame(replay);
        const gameData = await getGameData(game);
        let output = replayFormat.value;
        //day of week, month, day, year, hour:minute:second, GMT, (timezone)
        let date = stats.mtime.toString().split(' ');

        //there is definitely a better way to do this but this works for now
        //this will most likely be replaced in the future
        output = output.replaceAll("{day}", date[0]);
        output = output.replaceAll("{month}", date[1]);
        output = output.replaceAll("{dayNum}", date[2]);
        output = output.replaceAll("{year}", date[3]);
        output = output.replaceAll("{hour}", date[4].split(':')[0]);
        output = output.replaceAll("{minute}", date[4].split(':')[1]);
        output = output.replaceAll("{second}", date[4].split(':')[2]);
        output = output.replaceAll("{stage}", gameData.stage); 
        output = output.replaceAll("{p1tag}", gameData.port1.tag);
        output = output.replaceAll("{p2tag}", gameData.port2.tag);
        output = output.replaceAll("{p1char}", gameData.port1.character);
        output = output.replaceAll("{p2char}", gameData.port2.character);
        output = output.replaceAll("{p1code}", gameData.port1.code);
        output = output.replaceAll("{p2code}", gameData.port2.code);

        output = path + "\\" + output + ".slp";

        if(fs.existsSync(output)) {
            output = renameFile(replay, output.substring(0, output.length - 4), 0);
        } else {
            await fs.rename(replay, output, err => {
                if (err) {
                    parseReplay(replay, path, replayFormat);
                    throw err;
                } 
            });
           
        }

        return output;
    } else {console.log(replay + " is not a replay");}
}

async function renameFile(oldFilePath, filePath, iterator) {
    if(fs.existsSync(filePath + '(' + iterator + ')' + ".slp")) {
        return renameFile(oldFilePath, filePath, iterator + 1);
    } else {
        const name = filePath + '(' + iterator + ')' + ".slp"
        fs.rename(oldFilePath, name, err => {
            if (err) throw err;
        });
        return name
    }
}