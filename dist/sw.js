const CACHE = 'cache-and-update';

self.addEventListener('install', function (evt) {
    console.log('The service worker is being installed.');
    evt.waitUntil(precache());
});

self.addEventListener('fetch', function (evt) {
    console.log('The service worker is serving the asset.');
    evt.respondWith(fromCache(evt.request));
    evt.waitUntil(update(evt.request));
});

function precache() {
    return caches.open(CACHE).then(function (cache) {
        return cache.addAll([
            './index.html',
            './styles.css',
            './lessons.html',
            './editor.js',
            './logo.svg',
            './apple-touch-icon.png',
            './logo152x152.png',
            './logo167x167.png',
            './logo180x180.png',
            './logo512x512.png',
            './sandbox.html',
            './lib/prism/prism.css',
            './lib/prism/prism.js',
            './lib/ace/ace.js',
            './lib/ace/ext-language_tools.js',
            './lib/ace/ext-error_marker.js',
            './lib/ace/mode-javascript.js',
            './lib/ace/theme-dracula.js',
            './lib/ace/theme-sqlserver.js',
            './lib/ace/worker-javascript.js',
        ]);
    });
}

function fromCache(request) {
    return caches.open(CACHE).then(function (cache) {
        return cache.match(request).then(function (matching) {
            return matching || Promise.reject('no-match');
        });
    });
}

function update(request) {
    console.log(/apis.google.com/.test(request.url), request.url);
    if (!/apis.google.com/.test(request.url)) {
        return caches.open(CACHE).then(function (cache) {
            return fetch(request).then(function (response) {
                return cache.put(request, response);
            });
        });
    } else {
        console.log('IGNORE', request.url);
        return Promise.resolve();
    }
}