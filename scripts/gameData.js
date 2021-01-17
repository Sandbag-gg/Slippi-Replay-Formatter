const { stages, characters } = require('@slippi/slippi-js');

//gets relevant data from game and returns object
export default function getGameData(game) {
    const settings = game.getSettings();
    const metadata = game.getMetadata();
    const data = {
        stage: stages.getStageName(settings.stageId),
        port1: {
            character: characters.getCharacterShortName(settings.players[0].characterId),
            tag: metadata.players[0].names.netplay,
            code: metadata.players[0].names.code
        },
        port2: {
            character: characters.getCharacterShortName(settings.players[1].characterId),
            tag: metadata.players[1].names.netplay,
            code: metadata.players[1].names.code
        }
    };

    return data;
}

