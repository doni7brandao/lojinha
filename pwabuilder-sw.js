/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
     http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
const PRECACHE = "precache-v1";
const RUNTIME = "runtime";

const PRECACHE_URLS = [
    "index.html",
    "sw.js",
    "inobounce.js",
    "." // Alias for index.html
];

self.addEventListener("install", event => {
    event.waitUntil(
        (async () => {
            self.skipWaiting();
            const toCache = [];
            try {
                const response = await fetch(new Request("/asset-manifest.json"));
                const assets = await response.json();
                Object.keys(assets).forEach(asset => {
                    var file = assets[asset];
                    if (file.endsWith(".js") || file.endsWith(".css") || file.endsWith(".map")) {
                        toCache.push(file);
                    }
                });
            } catch {}
            const cache = await caches.open(PRECACHE);
            cache.addAll(PRECACHE_URLS.concat(toCache));
        })()
    );
});

self.addEventListener("message", async event => {
    const data = event.data;
    if (typeof data === "string" && data.startsWith("loadAppID")) {
        const appId = data.split("/")[1];
        const cache = await caches.open(RUNTIME);
        cache.add("play/" + appId);
    }
});

self.addEventListener("activate", event => {
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
        (async () => {
            const cacheNames = await caches.keys();
            const cachesToDelete = cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
            await Promise.all(
                cachesToDelete.map(cacheToDelete => {
                    return caches.delete(cacheToDelete);
                })
            );
            self.clients.claim();
        })()
    );
});

const CACHE_SUFFIXES = [".jpg", ".png", ".css", ".svg"];
const CACHE_REGEX = [/maps.googleapis.com\/maps\/api\/staticmap/, /fonts.googleapis.com/];
const CACHE_EXCLUDES = ["sockjs-node"];
const CACHE_PREFER_LIVE = [/https:\/\/docs\.google\.com\/spreadsheets\/.*&format=image/];

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    const url = event.request.url;
    const u = new URL(url);
    const matchItem = u.protocol + "//" + u.hostname + u.pathname;

    if (CACHE_EXCLUDES.some(s => url.includes(s))) return;

    let preferLive = true;
    if (CACHE_SUFFIXES.some(s => matchItem.endsWith(s)) || CACHE_REGEX.some(r => r.test(matchItem))) {
        if (!CACHE_PREFER_LIVE.some(r => r.test(matchItem))) {
            preferLive = false;
        }
    }

    if (!preferLive) {
        // images we can cache aggressively, we cant aggressively cache js on localhost
        // because the bundles are always named the same and it will break partial updates.
        event.respondWith(
            (async () => {
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) {
                    return cachedResponse;
                }

                const response = await fetch(event.request);
                const cache = await caches.open(RUNTIME);
                cache.put(event.request, response.clone());
                return response;
            })()
        );
    } else if (event.request.url.startsWith(self.location.origin)) {
        // content we will prefer to get live versions if possible at all
        event.respondWith(
            (async () => {
                try {
                    const response = await fetch(event.request);
                    const clone = response.clone();
                    const cache = await caches.open(RUNTIME);
                    cache.put(event.request, clone);
                    return response;
                } catch (e) {
                    const cachedResponse = await caches.match(event.request);
                    if (cachedResponse) {
                        return cachedResponse;
                    } else {
                        return new Response();
                    }
                }
            })()
        );
    }
});
