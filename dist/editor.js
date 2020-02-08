!function(){"use strict";const t={darkMode:window.matchMedia("(prefers-color-scheme: dark)")&&window.matchMedia("(prefers-color-scheme: dark)").matches,infiniteLoopProtection:!0},e={get:(e,o)=>{try{return"keys"===o?Object.keys(t):JSON.parse(localStorage.getItem(o))}catch(t){console.error("m3ntor",t)}},set:(t,e,o)=>{try{if("keys"!==e){localStorage.setItem(e,JSON.stringify(o));const t=new CustomEvent("settingsChange",{detail:{setting:e,value:o}});document.dispatchEvent(t)}}catch(t){console.error("m3ntor",t)}return!0}};window.m3ntor=window.m3ntor||{},window.m3ntor.settings=new Proxy({},e),Object.keys(t).forEach(e=>{let o=window.m3ntor.settings[e];null==o&&(window.m3ntor.settings[e]=t[e])})}();
!function(){"use strict";const e=document.createElement("iframe");let n;e.src="sandbox.html",e.sandbox="allow-scripts allow-same-origin",e.style="display:none",document.body.appendChild(e);let t,s;window.addEventListener("message",e=>{s&&s.call(null,e.data)}),window.m3ntor=window.m3ntor||{},window.m3ntor.evaluateCode=(o,r=[],a,i,l,c)=>{s=i,e.contentWindow.postMessage({imports:r},"*"),clearTimeout(t),t=setTimeout(()=>{a?((e,t,s,o,r,a=1e3)=>{let i=Math.floor(performance.now());const l=t.map(e=>`"${e}"`);let c=t.length>0?`importScripts(${l.join(",")})`:"";const p=String.raw`
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
        `,d=new Blob([`${c}                \n\n                function executeCode() {\n                    ${e}\n                }\n\n                ${p}\n\n                onmessage = a => {     \n                    const { id } = a.data;                                        \n                    \n                    // signal start\n                    postMessage({ id: id + 1 });\n\n                    try {  \n                        let r  = executeCode();                    \n                        if(r instanceof Promise) {\n                            r.then(() => postMessage({id}))\n                             .catch(() => postMessage({id}))\n                        } else {                            \n                            postMessage({id})\n                        }                         \n                    }\n                    catch(e) { \n                        const stackLines = e.stack.split('\\n');\n                        const line = /Error/.test(stackLines[0]) ? stackLines[1] : stackLines[0];           \n                        const lineParts = line.split(':');\n                        const lineNumber = lineParts[lineParts.length-2] - 3;\n                        postMessage({id, error: {msg: e.message, lineNo:lineNumber}})                         \n                    }\n                };                  \n            `],{type:"text/javascript"});n&&(n.terminate(),URL.revokeObjectURL(d)),n=new Worker(URL.createObjectURL(d)),n.onmessage=e=>{const n=e&&e.data&&e.data.id;e.data.lineNumber&&o&&o(e.data),e.data.clear&&r&&r(),n===i?m(!e.data.error,e.data.error):n===i+1&&setTimeout(()=>i&&m(!1),a)},n.onerror=e=>{console.error(e),m(!1,e)},n.onmessageerror=e=>{console.error(e),m(!1,e)};const m=(e,n)=>{i=0,s&&s.call(null,e,n)};n.postMessage({id:i})})(o,r,(function(n,t){console.clear(),n?e.contentWindow.postMessage({code:o},"*"):t?s&&s.call(null,t):console.warn("The code takes too long to run. Is there an infinite loop?")}),l,c,3e3):e.contentWindow.postMessage({code:o},"*")},1e3)}}();
!function(){"use strict";let e,t=0,o=0;const s=e=>btoa(unescape(encodeURIComponent(e))),n=e=>decodeURIComponent(escape(atob(e))),r=()=>{const o=new CustomEvent("lessonChanged",{detail:e[t]});document.dispatchEvent(o)},c=e=>{t===e&&0!==t||(t=e,r())},l=(e,t)=>Math.min(Math.max(0,e),t-1),a=()=>t<o-1,d=()=>t>0,i=o=>{const r=[...e],c={...r[t],...o};((e,t)=>{try{let o={};const r=localStorage.getItem("JSLessons");r&&(o=JSON.parse(n(r))),o[e]=t,localStorage.setItem("JSLessons",s(JSON.stringify(o)))}catch(e){console.error("m3ntor",e)}})(c.title,c.code),Object.freeze(c),r[t]=c,Object.freeze(r),e=r,(()=>{const o=new CustomEvent("lessonStatusChanged",{detail:e[t]});document.dispatchEvent(o)})()};window.m3ntor=window.m3ntor||{},window.m3ntor.lessons={hasNext:a,hasPrevious:d,next:()=>(a()&&c(l(t+1,o)),e[t]),previous:()=>(d()&&c(l(t-1,o)),e[t]),current:()=>t,setCurrent:s=>(c(l(s,o)),e[t]),getAllLessons:()=>[...e],restoreCurrent:()=>{const o=document.querySelectorAll(".lesson"),c=Array.prototype.slice.call(o)[t].innerText;i({edited:!1,code:c}),(e=>{try{let t={};const o=localStorage.getItem("JSLessons");o&&(t=JSON.parse(n(o))),t=Object.keys(t).filter(t=>t!==e).reduce((e,o)=>(e[o]=t[o],e),{}),localStorage.setItem("JSLessons",s(JSON.stringify(t)))}catch(e){console.error("m3ntor",e)}})(e[t].title),r()},updateCurrentCode:o=>{"code"===e[t].type&&e[t].code!==o&&i({edited:!0,code:o})}},Object.freeze(window.m3ntor.lessons),window.addEventListener("load",()=>{const t=document.querySelectorAll(".lesson"),s=Array.prototype.slice.call(t);e=s.map((e,t)=>{let o="code";e.classList.contains("slide")&&(o="slide"),e.classList.contains("quiz-slide")&&(o="quiz");const s=e.getAttribute("data-title"),r=(e=>{try{let t={};const o=localStorage.getItem("JSLessons");return o&&(t=JSON.parse(n(o))),t[e]}catch(e){console.error("m3ntor",e)}})(s);return Object.freeze({index:t,type:o,code:"code"===o?r||e.innerText:e.innerHTML,title:s,subtitle:e.getAttribute("data-subtitle")||"",moduleName:e.getAttribute("data-module")||!1,edited:!!r})}),o=e.length;const r=new CustomEvent("lessonsLoaded",{detail:null});document.dispatchEvent(r)})}();
!function(){"use strict";const e=e=>{const t=document.getElementById("lessonTitle"),n=document.getElementById("lessonSubtitle"),s=document.title;if(/\|/g.test(s)?document.title=e.title+" |"+s.split("|")[1]:document.title=e.title+" | "+s,t.innerText=e.title,e.subtitle?(n.innerText=e.subtitle,n.style.display="initial"):n.style.display="none",e.edited){const e=document.createElement("button");e.className="edited",e.innerText="Reset",e.addEventListener("click",()=>window.m3ntor.lessons.restoreCurrent()),t.appendChild(e)}},t=(e,t,n)=>{var s;t.disabled=!e.hasPrevious(),n.disabled=!e.hasNext(),void 0!==(s=e.current())&&(window.location.hash="/"+(s+1))},n=t=>{const n=(()=>{const e=window.location.hash.slice(2).split("/");return parseInt(e[0],10)-1||0})(),s=t.setCurrent(n);e(s)};document.addEventListener("lessonsLoaded",()=>{const s=window.m3ntor.lessons,i=document.getElementById("previousLesson"),d=document.getElementById("nextLesson"),o=()=>t(s,i,d);d.addEventListener("click",()=>{(t=>{e(t.next())})(s),o()}),i.addEventListener("click",()=>{(t=>{e(t.previous())})(s),o()}),n(s),o(),window.addEventListener("hashchange",()=>{n(s),o()},!1)}),document.addEventListener("lessonStatusChanged",t=>e(t.detail))}();
!function(){"use strict";document.addEventListener("lessonsLoaded",()=>{const e=document.createElement("div");e.id="menu";const t=document.createElement("section");t.id="settings",e.appendChild(t),document.getElementById("container").appendChild(e);const n=document.createElement("button");n.id="menuToggle",n.innerText="Menu",n.accessKey="m",document.getElementById("toolbar").prepend(n),window.m3ntor.settings.keys.map(e=>{const t=document.createElement("button");t.className="switch-container",t.tabIndex=-1;const n=document.createElement("input");n.id=`${e}Checkbox`,n.type="checkbox",n.className="checkbox",n.checked=window.m3ntor.settings[e],n.addEventListener("change",t=>window.m3ntor.settings[e]=t.target.checked);const s=document.createElement("label");s.className="switch",s.htmlFor=n.id;let c=e.replace(/([a-z](?=[A-Z]))/g,"$1 ");c=c.charAt(0).toUpperCase()+c.slice(1);const d=document.createTextNode(c);return t.appendChild(n),t.appendChild(s),t.appendChild(d),t}).forEach(e=>t.appendChild(e));const s=document.createElement("img");let c;s.className="logo",s.src="logo.svg",s.alt=document.title,t.appendChild(s);let d=0;const o=window.m3ntor.lessons,a=o.getAllLessons().filter(e=>"code"===e.type),l=o.current();a.forEach(t=>{if(t.moduleName){c&&e.appendChild(c);const n=document.createElement("header");n.innerHTML=t.moduleName,e.appendChild(n),c=document.createElement("ol"),c.start=t.index+1-d,e.appendChild(c),d++}else{const e=document.createElement("li");t.index===l&&(e.className="selected"),e.dataset.index=t.index,e.innerHTML=`<a href='#/${t.index+1}'>${t.title}<span>${t.subtitle}</span></a>`,c||(c=document.createElement("ol")),c.appendChild(e)}}),e.appendChild(c);const i=()=>{console.log("close menu"),n.classList.remove("isActive"),e.classList.remove("isActive"),n.focus(),document.removeEventListener("lessonChanged",i)};n.addEventListener("click",t=>{e.classList.contains("isActive")||((()=>{const t=e.querySelector("li.selected");t&&t.classList.remove("selected");const n=e.querySelector(`li[data-index="${o.current()}"]`);if(n){n.classList.add("selected");const e=n.querySelector("a");e&&e.focus()}})(),document.addEventListener("lessonChanged",i)),t.target.classList.toggle("isActive"),e.classList.toggle("isActive")});window.addEventListener("keydown",e=>{const{keyCode:t}=e;27===t&&i()})})}();
!function(){"use strict";const e=[],t=ace.edit("editor");t.session.setMode("ace/mode/javascript"),t.setOptions({enableBasicAutocompletion:!0,fixedWidthGutter:!0,fontSize:"12pt",theme:"ace/theme/sqlserver"}),t.focus();const o=e=>{const{msg:o,lineNo:n}=e;o&&t.session.setAnnotations([{row:n-1,column:0,text:o,type:"error"}])},n=e=>{const{lineNumber:t,type:o,params:n}=e,s="co"+t,i=document.querySelector(".ace_line"),l=parseFloat(i.style.height)||21;let r=n,a="",c=n&&n[0];c&&c.toLowerCase&&c.toLowerCase().startsWith("%c")?(a=n[1],c=c.substring(2,c.length)):r=n.map(e=>Array.isArray(e)?`[${e.join(", ")}]`:void 0===e?"undefined":null===e?"null":e).join(" ");let d=document.querySelector(`.console-output.${s}`);if(d)d.innerHTML+="<br/>"+r;else{d=document.createElement("div"),d.className=`console-output ${o} ${s}`,d.innerHTML=a?c:r,d.style.top=(t-1)*l+"px",a&&(d.style.animation="none",a.split(";").map(e=>{const t=e.split(":");d.style[t[0].trim()]=t[1].trim()})),document.querySelector(".ace_layer.ace_text-layer").appendChild(d)}},s=()=>{document.querySelectorAll(".console-output").forEach(e=>e.parentNode.removeChild(e))},i=e=>window.m3ntor&&window.m3ntor.settings&&window.m3ntor.settings[e];let l;t.session.on("change",r=>{s();const a=t.getValue();t.session.clearAnnotations();const c=i("infiniteLoopProtection");window.m3ntor.evaluateCode(a,e,c,o,n,s),clearTimeout(l),l=setTimeout(()=>window.m3ntor.lessons.updateCurrentCode(a),500)}),window.onerror=function(e,t,o,n,s){console.log(e,t,o,n,s)};const r=e=>{t.setTheme(e?"ace/theme/dracula":"ace/theme/sqlserver"),e?document.body.classList.add("dark"):document.body.classList.remove("dark")};r(i("darkMode")),document.addEventListener("settingsChange",e=>{const{setting:t,value:o}=e&&e.detail;"darkMode"===t&&r(o)}),document.addEventListener("lessonChanged",e=>{const o=document.getElementById("slide"),n=document.getElementById("editor"),s=e&&e.detail;if("code"===s.type)o.style.display="none",n.style.display="flex",t.setValue(s.code,1),t.gotoLine(1);else{n.style.display="none",o.style.display="flex",o.innerHTML=s.code;const e=o.querySelectorAll("img");Array.prototype.slice.call(e).forEach(e=>e.src=e.dataset.src)}})}();
!function(){"use strict";const e=e=>{const t=e.target;t.parentNode.querySelectorAll("button").forEach(e=>e.classList.remove("selected")),t.classList.add("selected")};document.addEventListener("lessonChanged",t=>{const n=document.getElementById("slide"),s=t&&t.detail;n.querySelectorAll(".quiz > .options > button").forEach(t=>{"quiz"===s.type?t.addEventListener("click",e,!0):t.removeEventListener("click",e,!0)})})}();
