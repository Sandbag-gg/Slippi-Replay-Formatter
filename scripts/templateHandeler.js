const fs = require('fs');

export default async function insertTempaltes(templatePath, datalistId) {
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

function createOption(value) {
    return '<option value="' + value + '"/>';
}