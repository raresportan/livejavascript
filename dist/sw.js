const CACHE = 'cache-and-update';

self.addEventListener('install', function (evt) {
    evt.waitUntil(precache());
});

self.addEventListener('fetch', function (evt) {
    evt.respondWith(fromCacheOrNetwork(evt.request));
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
            './gifs/changeTheme.mp4',
            './gifs/liveOutput.mp4',
            './gifs/quiz.mp4',
            './gifs/changeTheme.webm',
            './gifs/liveOutput.webm',
            './gifs/quiz.webm',
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

function fromCacheOrNetwork(request) {
    return caches.open(CACHE).then(function (cache) {
        return cache.match(request).then(function (matching) {
            return matching || fetch(request);
        });
    });
}

function update(request) {
    if (!/apis.google.com/.test(request.url)) {
        return caches.open(CACHE).then(function (cache) {
            return fetch(request).then(function (response) {
                return cache.put(request, response);
            });
        });
    } else {
        return Promise.resolve();
    }
}