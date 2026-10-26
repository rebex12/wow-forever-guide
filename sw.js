'use strict';
// Relative URLs keep GitHub Pages project sites and subfolders working.
const SCOPE = new URL(self.registration.scope).pathname;
const PREFIX = 'fardvag-' + SCOPE.replace(/[^a-z0-9]/gi,'_') + '-';
const CACHE = PREFIX + '0.2.0';
const FILES = ['./','./index.html','./styles.css','./themes.css','./i18n.js','./locales.js','./guide-tools.js','./zone-data.js','./controller-data.js','./catalog.js','./content.js','./core.js','./app.js','./manifest.webmanifest','./assets/compass.svg'];
const URLS = FILES.map(p=>new URL(p,self.registration.scope).href);
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);try{await cache.addAll(URLS);}catch(error){await caches.delete(CACHE);throw error;}await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(url.origin!==self.location.origin||!url.pathname.startsWith(SCOPE))return;
 if(url.pathname===new URL('sw.js',self.registration.scope).pathname)return;
 if(event.request.mode==='navigate'){
  event.respondWith((async()=>{const cache=await caches.open(CACHE);const saved=await cache.match(new URL('./index.html',self.registration.scope).href);return saved||fetch(event.request);})());return;
 }
 if(URLS.includes(url.origin+url.pathname))event.respondWith((async()=>{const cache=await caches.open(CACHE);return await cache.match(event.request,{ignoreSearch:true})||fetch(event.request);})());
});
