const fs = require('fs');
const readline = require('readline');

// read lessons
const readLessonsInterface = readline.createInterface({
    input: fs.createReadStream('lessons.html'),
    console: false
});


const getAttr = (line, attr) => {
    const index = line.indexOf(attr);
    if (index === -1) {
        return '';
    }
    const quoteIndex = index + attr.length + 1;
    const quoteChar = line[quoteIndex];
    const nextQuoteIndex = line.indexOf(quoteChar, quoteIndex + 1);
    return line.substring(quoteIndex + 1, nextQuoteIndex);
}

const markupItem = (title, subtitle) => `<li>${title}<span>${subtitle}</span></li>`;

let markup = '<ol>\n';
let incompleteLine = '';

readLessonsInterface.on('line', line => {
    if (/class=\"lesson/g.test(line)) {
        if (!line.endsWith('>')) {
            incompleteLine = line;
            return;
        }
        const moduleName = getAttr(line, 'data-module');
        if (moduleName) {
            markup += `</ol>\n<header>${moduleName}</header>\n<ol>\n`
        } else {
            markup += markupItem(getAttr(line, 'data-title'), getAttr(line, 'data-subtitle')) + '\n';
        }
    } else if (incompleteLine) {
        const completeLine = incompleteLine + ' ' + line;
        markup += markupItem(getAttr(completeLine, 'data-title'), getAttr(completeLine, 'data-subtitle')) + '\n';
        incompleteLine = '';
    }
}).on('close', () => {
    markup += '</ol>\n';

    const readIndexInterface = readline.createInterface({
        input: fs.createReadStream('./dist/index.html'),
        console: false
    });


    let indexContent = '';
    readIndexInterface.on('line', line => {
        if (/<TOC \/>/g.test(line)) {
            indexContent += markup;
        } else {
            indexContent += line + '\n';
        }
    }).on('close', () => {
        fs.writeFileSync('./dist/index.html', indexContent, (err) => {
            // throws an error, you could also catch it here
            if (err) throw err;

            // success case, the file was saved
            console.log('Index saved!');
        });
    })


})




