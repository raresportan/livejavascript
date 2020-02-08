(function () {
    'use strict';

    const MAX_CODE_RUN_MILLIS = 3000;
    const DEBOUNCE_MILLIS = 1000;

    // create the sandbox iframe
    const sandbox = document.createElement("iframe");
    sandbox.src = "sandbox.html"
    sandbox.sandbox = 'allow-scripts allow-same-origin'
    sandbox.style = "display:none";
    document.body.appendChild(sandbox);

    let worker;

    /**
     * Limit the time needed to evaluate a piece of code
     * to prevent infinite loops. Sadly a side effect of this
     * is that the debugger will not work.     
     * 
     * How this works:
     * 1. Create a new worker
     * 2. Send the code to the worker.
     * 3. Worker sends back a first message (with id+1) signaling that is starting evaluation
     * 4. Init a timeout
     * 5. a. Worker sends a second message (with id) indicating all good
     *    b. Worker is blocked and doesn't sends a second message, timeout expires 
     *       meaning the worker is caught up in an infinite loop
     * 6. Terminate worker and call callback with result 
     */
    const limitEval = (code, imports, callback, consoleDataChangedCallback, consoleClearCallback, codeEvaluationTimeout = 1000) => {
        let id = Math.floor(performance.now());

        const formatedImports = imports.map(i => `"${i}"`);
        let blobImports = imports.length > 0 ? `importScripts(${formatedImports.join(',')})` : '';

        // Capture console method call and detect the source line number 
        // and the arguments passed to console and post them the callback
        const customConsole = (String.raw`
            const __original__ = console;
            let __handler__ = {
                get: function(target, prop) {   
                    return function() { 
                        if (prop === 'clear') {
                            postMessage({clear: true});
                        } 
                        else {
                            const stackLines = Error().stack.split('\n');  
                            const line = /Error/.test(stackLines[0]) ? stackLines[2] : stackLines[1];           
                            const lineParts = line.split(':');
                            const lineNumber = lineParts[lineParts.length-2] - 3;
                            //postMessage({lineNumber, type: prop, params: Array.from(arguments).map(p => p && !Array.isArray(p) && typeof p === 'object' ? JSON.stringify(p) : (p && p.toString ? p.toString() : p+''))});                            
                            //postMessage({lineNumber, type: prop, params: Array.from(arguments)});                            
                            postMessage({lineNumber, type: prop, params: Array.from(arguments).map(p => p && p.toString? p.toString(): p)});                            
                        }
                    }
                }
            };
            console = new Proxy(console, __handler__)  
        `);

        const blob = new Blob(
            [`${blobImports}                

                function executeCode() {
                    ${code}
                }

                ${customConsole}

                onmessage = a => {     
                    const { id } = a.data;                                        
                    
                    // signal start
                    postMessage({ id: id + 1 });

                    try {  
                        let r  = executeCode();                    
                        if(r instanceof Promise) {
                            r.then(() => postMessage({id}))
                             .catch(() => postMessage({id}))
                        } else {                            
                            postMessage({id})
                        }                         
                    }
                    catch(e) { 
                        const stackLines = e.stack.split('\\n');
                        const line = /Error/.test(stackLines[0]) ? stackLines[1] : stackLines[0];           
                        const lineParts = line.split(':');
                        const lineNumber = lineParts[lineParts.length-2] - 3;
                        postMessage({id, error: {msg: e.message, lineNo:lineNumber}})                         
                    }
                };                  
            `],
            { type: 'text/javascript' }
        );

        if (worker) {
            worker.terminate();
            URL.revokeObjectURL(blob);
        }

        // create worker with the above blob that will receive 
        // dynamic code through postMessage
        worker = new Worker(URL.createObjectURL(blob));

        // listen for worker messages            
        worker.onmessage = e => {
            const wrkrId = e && e.data && e.data.id;
            e.data.lineNumber && consoleDataChangedCallback && consoleDataChangedCallback(e.data);
            e.data.clear && consoleClearCallback && consoleClearCallback();

            if (wrkrId === id) {
                // all good, message received
                onDone(e.data.error ? false : true, e.data.error);
            }
            else if (wrkrId === id + 1) { // start signal id
                // if id not reset till now it means that the code evaluation 
                // is not done so we force stop it!
                setTimeout(() => id && onDone(false), codeEvaluationTimeout);
            }
        };

        worker.onerror = err => {
            console.error(err);
            onDone(false, err);
        }
        worker.onmessageerror = err => {
            console.error(err);
            onDone(false, err);
        }


        // called when the worker is done with the code evaluation
        const onDone = (result, error) => {
            id = 0; // reset id to flag message received    
            callback && callback.call(null, result, error);
        };


        // start worker code evaluation
        worker.postMessage({ id });
    }


    let timer, callbackRef;

    /**
     * Code is evaluated twice.
     * First in a worker to see if it has an infinite loop or not.
     * Second in the sandbox frame.
     * 
     * The first evaluation (in the worker) can be disabled by
     * setting the 'useInfiniteLoopProtection' setting to false.
     * 
     * @param {*} code 
     * @param {*} imports Array of scripts to load in sandbox 
     * @param {*} isInfiniteLoopProtectionActive Activate inifinite loop protection flag
     * @param {*} callback 
     * @param {*} consoleDataChangedCallback
     * @param {*} consoleClearCallback
     */
    const evaluateCode = (code, imports = [], isInfiniteLoopProtectionActive, callback, consoleDataChangedCallback, consoleClearCallback) => {
        callbackRef = callback;

        // import in iframe
        sandbox.contentWindow.postMessage({ imports }, '*');

        clearTimeout(timer);
        timer = setTimeout(() => {
            if (isInfiniteLoopProtectionActive) {
                limitEval(code, imports, function (success, error) {
                    console.clear();
                    if (success) {
                        // do code evaluation in the sandbox frame
                        // since now we know is not an infinite loop
                        sandbox.contentWindow.postMessage({ code }, '*');
                    }
                    else if (error) {
                        callbackRef && callbackRef.call(null, error);
                    }
                    else {
                        console.warn('The code takes too long to run. Is there an infinite loop?');
                    }
                },
                    consoleDataChangedCallback,
                    consoleClearCallback,
                    MAX_CODE_RUN_MILLIS);
            } else {
                // do code evaluation in the sandbox frame without protection
                sandbox.contentWindow.postMessage({ code }, '*');
            }
        }, DEBOUNCE_MILLIS)
    }

    // sandbox code executed
    window.addEventListener('message', e => {
        callbackRef && callbackRef.call(null, e.data);
    });

    // export 
    window.m3ntor = window.m3ntor || {};
    window.m3ntor.evaluateCode = evaluateCode;
}())