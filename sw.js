const CACHE = "talbina-v1";
const ASSETS = [
  "./","./index.html","./style.css","./app.js",
  "./admin.html","./admin.js","./manifest.webmanifest",
  "./assets/icon-192.png","./assets/icon-512.png","./assets/placeholder.jpg"
];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE&&caches.delete(k)))));
});
self.addEventListener("fetch",e=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
