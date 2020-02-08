'use strict';

(function () {

    const info = `'use strict'; 

/*
  
    You can bind a value to a name using "const" or "let". 
    Later you can use the binding name to get the bound value.

*/

// Automatic code evaluation, showing inline the console logs
const s = 'Hey there';
console.log(s);

// Each lesson has a description of the subject, code examples and exercises:

// -- Exercises --

// implement the capitalize function that will take a string and return 
// the same string with the first letter uppercase
const capitalize = (str) => {
    let result = '';
    // your code here


    return result;
}


// Dark / Light mode


// Infinite loop protection
while(1) { }


// Experiment freely, code changes saved locally in your browser, 
// nothing is sent over the network
    


`


    // Required scripts
    const imports = [];

    // Ace editor config
    const editor = ace.edit("editor");
    editor.session.setMode("ace/mode/javascript");
    editor.setOptions({
        enableBasicAutocompletion: true,
        fixedWidthGutter: true,
        fontSize: "12pt",
        theme: "ace/theme/sqlserver"
    });
    editor.focus();

    // handle response, we'll just handle errors
    const evalCallback = data => {
        const { msg, lineNo } = data;
        if (msg) {
            editor.session.setAnnotations([{
                row: lineNo - 1,
                column: 0,
                text: msg,
                type: "error"
            }]);
        }
    }

    const consoleDataChangedCallback = data => {
        const { lineNumber, type, params } = data;
        const elId = 'co' + lineNumber;
        const aLineElement = document.querySelector('.ace_line');
        const aLineHeight = parseFloat(aLineElement.style.height) || 21;

        let formattedParams = params;
        let styles = '';
        let firstParam = params && params[0];
        if (firstParam && firstParam.toLowerCase && firstParam.toLowerCase().startsWith('%c')) {
            styles = params[1];
            firstParam = firstParam.substring(2, firstParam.length);
        } else {
            formattedParams = params.map(aParam => {
                if (Array.isArray(aParam)) {
                    return `[${aParam.join(', ')}]`
                } else if (aParam === undefined) {
                    return "undefined";
                } else if (aParam === null) {
                    return "null";
                } else {
                    return aParam;
                }
            }).join(' ');
        }
        let consoleValueElement = document.querySelector(`.console-output.${elId}`)
        if (!consoleValueElement) {
            consoleValueElement = document.createElement('div');
            consoleValueElement.className = `console-output ${type} ${elId}`;
            consoleValueElement.innerHTML = (styles ? firstParam : formattedParams);
            consoleValueElement.style.top = ((lineNumber - 1) * aLineHeight) + 'px';
            if (styles) {
                consoleValueElement.style.animation = 'none';
                styles.split(';').map(aStyle => {
                    const styleParts = aStyle.split(':');
                    consoleValueElement.style[styleParts[0].trim()] = styleParts[1].trim();
                })
            }

            const editorElement = document.querySelector('.ace_layer.ace_text-layer');
            editorElement.appendChild(consoleValueElement);
        } else {
            // update element
            consoleValueElement.innerHTML += '<br/>' + formattedParams
        }
    }

    const consoleClearCallback = () => {
        const outputs = document.querySelectorAll('.console-output');
        outputs.forEach(node => node.parentNode.removeChild(node));
    }

    const getSetting = setting => window.m3ntor && window.m3ntor.settings && window.m3ntor.settings[setting];

    let timer;
    // evaluate code on change
    editor.session.on('change', _ => {
        consoleClearCallback()

        const code = editor.getValue();
        editor.session.clearAnnotations();

        const isInfiniteLoopProtectionActive = getSetting('infiniteLoopProtection');
        window.m3ntor.evaluateCode(code, imports, isInfiniteLoopProtectionActive, evalCallback, consoleDataChangedCallback, consoleClearCallback); // Eval code

        clearTimeout(timer);
        timer = setTimeout(() => window.m3ntor.lessons.updateCurrentCode(code), 500);
    });

    // error handlder, just in case
    window.onerror = function (msg, url, lineNo, columnNo, error) {
        console.log(msg, url, lineNo, columnNo, error);
    }

    ///////  Theme //////
    const setTheme = darkMode => {
        editor.setTheme(darkMode ? "ace/theme/dracula" : "ace/theme/sqlserver");
        darkMode ? document.body.classList.add('dark') : document.body.classList.remove('dark');
    }
    setTheme(getSetting('darkMode'))

    // Update theme 
    document.addEventListener('settingsChange', e => {
        const { setting, value } = e && e.detail;
        setting === 'darkMode' && setTheme(value)
    })


    // document.addEventListener('lessonsLoaded', e => {
    //     const code = editor.getValue();
    //     // put some default value
    //     if (!code) {
    //         const lessonTitle = document.getElementById('lessonTitle');
    //         const lessonSubtitle = document.getElementById('lessonSubtitle');

    //         lessonTitle.innerText = 'Hello';
    //         lessonSubtitle.innerText = 'JavaScript Rock and Roll'

    //         const slideEl = document.getElementById('slide');
    //         const editorEl = document.getElementById('editor');
    //         slideEl.style.display = 'none';
    //         editorEl.style.display = 'flex';
    //         editor.gotoLine(1);
    //         editor.setValue(info, 1);
    //     }
    // });

    // Update editor on lesson change
    document.addEventListener('lessonChanged', e => {
        const slideEl = document.getElementById('slide');
        const editorEl = document.getElementById('editor');

        const lesson = e && e.detail;

        if (lesson.type === 'code') {
            slideEl.style.display = 'none';
            editorEl.style.display = 'flex';
            editor.setValue(lesson.code, 1);
            editor.gotoLine(1);
        } else {
            editorEl.style.display = 'none';
            slideEl.style.display = 'flex';
            slideEl.innerHTML = lesson.code;

            const imgs = slideEl.querySelectorAll('img');
            const imgsArray = Array.prototype.slice.call(imgs);
            imgsArray.forEach(img => img.src = img.dataset.src);
        }
    })
}())    