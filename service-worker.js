const CACHE_NAME = "gestor-finanzas-v1";
const urlsToCache = [
    "/",
    "/index.html",
    "/styles.css",
    "/script.js",
    "/manifest.json",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
];

// Instalar el Service Worker y almacenar en caché los archivos
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log("Archivos en caché");
                return cache.addAll(urlsToCache);
            })
            .catch(error => console.error("Error al almacenar en caché", error))
    );
});

// Activar el Service Worker y eliminar cachés antiguas
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log("Eliminando caché antigua:", cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Interceptar las solicitudes y responder con la caché si es posible
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
            .catch(() => caches.match("/index.html")) // Fallback a index.html si la red falla
    );
});


