const fs = require('fs');

export async function insertTemplates(templatePath, datalistId) {
    fs.readFile(templatePath, (err, data) => {
        if(err) {
            throw err;
        }
        
        const datalist = document.getElementById(datalistId);
        const templates = JSON.parse(data).templates;

        for (let i = 0; i < templates.length; i++) {
            const template = templates[i];
            datalist.innerHTML += createOption(template);
        }
    })
}

export async function insertLastFormat(dataPath, formatArea) {
    loadLastFormat(dataPath).then((data) => {
        if(data != null && data != "") {
            formatArea.value = data;
        }
    }).catch((err) => {
        throw err;
    });
}

export async function saveFormat(dataPath, formatArea) {
    const format = formatArea.value;
    fs.readFile(dataPath, (err, data) => {
        if(err) {
            throw err;
        }
        const json = JSON.parse(data);
        json.lastFormat = format;
        const newJson = JSON.stringify(json);

        fs.writeFile(dataPath, newJson, (err) => {
            if(err) {
                throw err;
            }
        });
    })
}

async function loadLastFormat(dataPath) {
    return new Promise((resolve, reject) => {
        fs.readFile(dataPath, (err, data) => {
            if(err) {
                reject(err);
            }
            const json = JSON.parse(data);
            resolve(json.lastFormat);
        });
    })
}

function createOption(value) {
    return '<option value="' + value + '"/>';
}