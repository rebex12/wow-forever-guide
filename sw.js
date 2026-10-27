'use strict';
// Relative URLs keep GitHub Pages project sites and subfolders working.
const SCOPE = new URL(self.registration.scope).pathname;
const PREFIX = 'fardvag-' + SCOPE.replace(/[^a-z0-9]/gi,'_') + '-';
const CACHE = PREFIX + '0.4.0';
const FILES = ['./','./index.html','./styles.css','./v03.css','./character-rules.js','./game-assets.js','./themes.css','./i18n.js','./locales.js','./guide-tools.js','./zone-data.js','./controller-data.js','./catalog.js','./content.js','./core.js','./app.js','./v04.css','./quest-chains.js','./profession-planner.js','./release-content.js','./talent-text.js','./assets/talents/161.jpg','./assets/talents/163.jpg','./assets/talents/164.jpg','./assets/talents/181.jpg','./assets/talents/182.jpg','./assets/talents/183.jpg','./assets/talents/201.jpg','./assets/talents/202.jpg','./assets/talents/203.jpg','./assets/talents/261.jpg','./assets/talents/262.jpg','./assets/talents/263.jpg','./assets/talents/281.jpg','./assets/talents/282.jpg','./assets/talents/283.jpg','./assets/talents/301.jpg','./assets/talents/302.jpg','./assets/talents/303.jpg','./assets/talents/361.jpg','./assets/talents/362.jpg','./assets/talents/363.jpg','./assets/talents/381.jpg','./assets/talents/382.jpg','./assets/talents/383.jpg','./assets/talents/41.jpg','./assets/talents/61.jpg','./assets/talents/81.jpg','./manifest.webmanifest','./assets/compass.svg'];
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
