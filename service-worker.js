var files = [
  "https://www.weblista.site/",
  "https://www.weblista.site/2019/08/hotel-pousada-central.html",
  "https://www.weblista.site/2019/08/farma-real.html",
  "https://www.weblista.site/2019/08/farma-lopes.html",
  "https://www.weblista.site/2014/10/taxi-do-joao-batista.html",
  "https://www.weblista.site/2014/09/jm-taxi.html",
  "https://www.weblista.site/2014/05/f-f-c-tecnologias.html",
  "https://www.weblista.site/2014/04/junior-martins-advogados-associados.html",
  "https://www.weblista.site/2012/12/taxi-do-ermilio.html",
  "https://www.weblista.site/2012/01/db-midias-desenvolvimento-web.html",
  "https://www.weblista.site/2001/02/auto-eletrica-negrinho.html",
  "https://www.weblista.site/p/imagens.html",
  "https://www.weblista.site/p/denunciar.html",
  "https://www.weblista.site/p/offline.html",
  "https://www.weblista.site/p/incluir-cadastro.html",
  "https://www.weblista.site/p/cadastro.html",
  "https://www.weblista.site/p/duvidas-frequentes.html",
  "manifest.json",
  "https://www.weblista.site/p/incluir-contato.html",
  "css/main.css",
  "icons/MaterialIcons-Regular.ttf",
  "icons/material.css",
  "img/entrada.jpg",
  "img/icon.png",
  "img/ticket.png",
  "js/barcode.js",
  "js/install.js",
  "js/main.js",
  "js/pagamento.js",
  "js/spa.js",
  "img/loja/adidas.jpg",
  "img/loja/bacio-di-latte.jpg",
  "img/loja/brooksfield.jpg",
  "img/loja/burberry.jpg",
  "img/loja/cavalera.jpg",
  "img/loja/centauro.jpg",
  "img/loja/farm.jpg",
  "img/loja/forum.jpg",
  "img/loja/galetos.jpg",
  "img/loja/le-lis-blanc.jpg",
  "img/loja/ofner.jpg",
  "img/loja/pizza-hut.jpg",
  "img/loja/shoulder.jpg",
  "img/loja/so-sapatos.jpg",
  "img/loja/tip-top.jpg",
  "js/vendor/jquery.min.js",
  "js/vendor/materialize-0.97.0.min.js",
  "js/vendor/quagga.min.js"
];
// dev only
if (typeof files == 'undefined') {
  var files = [];
} else {
  files.push('./');
}

var CACHE_NAME = 'shopping-v13';

self.addEventListener('activate', function(event) {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (CACHE_NAME.indexOf(cacheName) == -1) {
            console.log('[SW] Delete cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('install', function(event){
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return Promise.all(
      	files.map(function(file){
      		return cache.add(file);
      	})
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  console.log('[SW] fetch ' + event.request.url)
  event.respondWith(
    caches.match(event.request).then(function(response){
      return response || fetch(event.request.clone());
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('On notification click: ', event);
  clients.openWindow('/');
});
