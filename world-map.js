'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WorldAtlas=api;})(typeof window!=='undefined'?window:globalThis,function(){
 let resizeObserver;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
 function search(maps,query){const q=norm(query);return !q?[]:Object.values(maps).filter(m=>[m.title,...m.places||[]].some(p=>norm(p).includes(q))).sort((a,b)=>Number(norm(b.title)===q)-Number(norm(a.title)===q)||a.title.localeCompare(b.title));}
 function nearest(maps,parent,x,y){return Object.values(maps).filter(m=>m.parent===parent&&Number.isFinite(m.x)&&Number.isFinite(m.y)).map(m=>({map:m,d:Math.hypot(m.x-x,m.y-y)})).sort((a,b)=>a.d-b.d)[0];}
 // Approximate zone hit areas avoid selecting a nearby marker across a border.
 const zoneRegions={
  kalimdor:[
   {id:'zone-barrens',poly:[[.500,.435],[.542,.435],[.572,.484],[.565,.555],[.556,.650],[.505,.656],[.488,.607],[.488,.537],[.494,.483]]},
   {id:'zone-mulgore',poly:[[.434,.531],[.486,.530],[.488,.608],[.480,.650],[.435,.654]]}
  ]
 };
 function insidePoly(poly,x,y){
  let inside=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
   const [xi,yi]=poly[i],[xj,yj]=poly[j];
   if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;
  }
  return inside;
 }
 function zoneAt(maps,parent,x,y,maxDistance=.06){
  if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>1||y<0||y>1)return null;
  const hit=(zoneRegions[parent]||[]).find(r=>maps[r.id]?.parent===parent&&insidePoly(r.poly,x,y));
  if(hit)return maps[hit.id];
  const closest=nearest(maps,parent,x,y);
  return closest&&closest.d<=maxDistance?closest.map:null;
 }
 // Adjacent-zone links use direct land routes on the same continent.
 function adjacentZones(maps,id,travel){
  const current=maps[id];
  if(!current?.zoneId||!Array.isArray(travel?.edges))return [];
  const ids=new Set();
  for(const e of travel.edges){
   if(e.kind!=='walk')continue;
   const other=e.a===id?e.b:e.b===id?e.a:null;
   if(other&&maps[other]?.zoneId&&maps[other].parent===current.parent)ids.add(other);
  }
  return [...ids].map(x=>maps[x]).sort((a,b)=>a.title.localeCompare(b.title));
 }
 function zoomOutParent(maps,map,zoomLevel,factor){return factor<1&&zoomLevel<=1&&map.parent&&maps[map.parent]?map.parent:null;}
 // Save the map camera when entering a child map so returning restores it.
 function mapNavigation(maps,current,target,view,history=[]){
  if(!current||!maps[target]||current.id===target)return {history,restore:null};
  if(maps[target].parent===current.id)return {history:[...history,{id:current.id,z:view.z,px:view.px,py:view.py}],restore:null};
  const index=history.findLastIndex(entry=>entry.id===target);
  return index>=0?{history:history.slice(0,index),restore:history[index]}:{history:[],restore:null};
 }
 function bounds(pan,viewport,size,zoom){const limit=Math.max(0,(size*zoom-viewport)/2);return limit===0?0:Math.max(-limit,Math.min(limit,pan));}
 function render({data,language='en',initial='world',currentZone='',journeyHTML=''}){
  const sv=language==='sv',t=(en,se)=>sv?se:en,maps=data.maps,map=maps[initial]||maps.world;
  const options=Object.values(maps).sort((a,b)=>a.title.localeCompare(b.title));
  return `<section class="atlas" data-current-zone="${esc(currentZone)}"><div class="atlas-toolbar"><label class="atlas-search-label"><span>${t('Find a zone or place','Hitta zon eller plats')}</span><input id="atlas-search" type="search" autocomplete="off" placeholder="${t('Zone, city or subzone…','Zon, stad eller subzon…')}" aria-controls="atlas-results"></label><label><span>${t('Map','Karta')}</span><select id="atlas-select" aria-label="${t('Choose map','Välj karta')}">${options.map(m=>`<option value="${esc(m.id)}" ${m.id===map.id?'selected':''}>${esc(m.title)}</option>`).join('')}</select></label>${currentZone&&maps[currentZone]?`<button class="secondary-button" data-atlas="my-zone">${t('My zone','Min zon')}</button>`:''}</div><div class="atlas-results" id="atlas-results" aria-live="polite" hidden></div><nav class="atlas-breadcrumb" aria-label="${t('Map hierarchy','Karthierarki')}"></nav><div class="atlas-frame"><div class="atlas-title"><span>✦</span><h2 id="atlas-title">${esc(map.title)}</h2><span>✦</span></div><div class="atlas-viewport" tabindex="0" role="group" aria-label="${t('Interactive map. Drag or use arrow keys to pan. Plus and minus zoom.','Interaktiv karta. Dra eller använd piltangenter för att panorera. Plus och minus zoomar.')}"><div class="atlas-plane"><img class="atlas-image" src="${esc(map.image)}" alt="${esc(map.title)}" draggable="false"><div class="atlas-spots"></div></div></div><div class="atlas-bottom"><span class="atlas-status" aria-live="polite"></span><div class="atlas-zoom"><button data-atlas="out" aria-label="${t('Zoom out','Zooma ut')}">−</button><button data-atlas="fit">${t('Fit','Anpassa')}</button><button data-atlas="in" aria-label="${t('Zoom in','Zooma in')}">+</button><button data-atlas="expand">${t('Expand','Förstora')}</button></div></div></div><div class="atlas-zone-actions"></div><nav class="atlas-neighbors" aria-label="${t('Adjacent zones','Angränsande zoner')}"></nav><p class="atlas-help">${t('Choose a continent, then a zone. Drag to move; pinch, use the wheel or + / − to zoom. On desktop, zoom near a zone marker or click the zone to open it. On mobile, pinch only changes magnification: tap a zone to open it. Use adjacent-zone buttons to switch between neighboring maps.','Välj en kontinent och sedan en zon. Dra för att flytta; nyp, använd mushjulet eller + / − för zoom. På datorn kan du zooma nära en zonmarkör eller klicka i zonen för att öppna den. På mobil zoomar nypgester bara kartbilden: tryck på zonen för att öppna den. Byt till angränsande zoner med knapparna.')}</p><p class="atlas-credit">${t('Map art','Kartbilder')} © Blizzard Entertainment · Forever · ${t('Zone maps need internet the first time; opened maps are saved for offline use.','Zonkartor behöver internet första gången; öppnade kartor sparas för offlinebruk.')}${data.source?` · ${t('Beta map art may change','Kartbilder från betan kan ändras')}`:''}</p>${journeyHTML}</section>`;
 }
 function mount(root,{data,language='en',initial='world',onView=()=>{},onChoose=()=>{},showSources=false}){
  if(!root)return;if(resizeObserver)resizeObserver.disconnect();const maps=data.maps,sv=language==='sv',t=(a,b)=>sv?b:a,$=s=>root.querySelector(s);
  let map=maps[initial]||maps.world,z=1,px=0,py=0,bw=1,bh=1,vw=1,vh=1,gesture=null,suppressClick=false,history=[],lastWheelAt=0,wheelOutLocked=false;
  const vp=$('.atlas-viewport'),plane=$('.atlas-plane'),img=$('.atlas-image'),points=new Map();
  function layout(){vw=vp.clientWidth;vh=vp.clientHeight;const ratio=map.width/map.height;bw=Math.min(vw,vh*ratio);bh=bw/ratio;paint();}
  function paint(){px=bounds(px,vw,bw,z);py=bounds(py,vh,bh,z);plane.style.width=bw+'px';plane.style.height=bh+'px';plane.style.left=((vw-bw*z)/2+px)+'px';plane.style.top=((vh-bh*z)/2+py)+'px';plane.style.transform=`scale(${z})`;root.style.setProperty('--atlas-scale',z);$('.atlas-status').textContent=map.title+' · '+Math.round(z*100)+'%';}
  function choose(id,notify=true){
   if(!maps[id])return;const nav=mapNavigation(maps,map,id,{z,px,py},history);history=nav.history;map=maps[id];z=nav.restore?.z??1;px=nav.restore?.px??0;py=nav.restore?.py??0;points.clear();gesture=null;img.src=map.image;img.alt=map.title;$('#atlas-title').textContent=map.title;$('#atlas-select').value=map.id;
   const trail=[];let m=map;while(m){trail.unshift(m);m=maps[m.parent];}
   $('.atlas-breadcrumb').innerHTML=trail.map((m,i)=>`<button data-map-id="${esc(m.id)}" ${i===trail.length-1?'aria-current="page"':''}>${esc(m.title)}</button>`).join('<span aria-hidden="true">›</span>');
   $('.atlas-spots').innerHTML=Object.values(maps).filter(m=>m.parent===map.id&&Number.isFinite(m.x)).map(m=>`<button class="atlas-spot ${map.id==='world'?'continent-spot':''}" style="left:${m.x*100}%;top:${m.y*100}%" data-map-id="${esc(m.id)}" aria-label="${t('Open','Öppna')} ${esc(m.title)}"><span class="atlas-dot">◆</span><span class="atlas-spot-name">${esc(m.title)}</span></button>`).join('');
   const neighbors=adjacentZones(maps,map.id,typeof window!=='undefined'?window.TRAVEL_DATA:null);
   $('.atlas-neighbors').innerHTML=neighbors.length?`<strong>${t('Adjacent zones','Angränsande zoner')}</strong><div>${neighbors.map(m=>`<button type="button" data-map-id="${esc(m.id)}" aria-label="${t('Open','Öppna')} ${esc(m.title)}">${esc(m.title)}</button>`).join('')}</div>`:'';
   $('.atlas-zone-actions').innerHTML=map.zoneId?`<div><strong>${esc(map.title)}</strong><span>${t('Explore this zone or use it for Overview tips.','Utforska zonen eller välj den för tips i Overview.')}</span></div><button class="primary-button" data-atlas="choose-zone">${t('I am here · show tips','Jag är här · visa tips')}</button>`:map.parent&&map.parent!=='world'?`<p class="small">${t('Map view available. Zone guidance is still being mapped.','Kartvy tillgänglig. Zonguiden kartläggs fortfarande.')}</p>`:'';
   layout();if(notify)onView(map.id);
  }
  function zoom(factor,x=vw/2,y=vh/2,autoOpen=false){
   const parent=zoomOutParent(maps,map,z,factor);if(parent){choose(parent);return;}
   const next=Math.max(1,Math.min(4,z*factor)),u=(x-(vw-bw*z)/2-px)/(bw*z),v=(y-(vh-bh*z)/2-py)/(bh*z);
   const candidate=autoOpen?zoneAt(maps,map.id,u,v,.045):null;if(factor>1&&next>=2.5&&candidate){choose(candidate.id);return;}
   px=x-u*bw*next-(vw-bw*next)/2;py=y-v*bh*next-(vh-bh*next)/2;z=next;paint();
  }
  root.addEventListener('click',e=>{
   const button=e.target.closest('button');if(!button)return;
   if(button.dataset.mapId){if(!suppressClick)choose(button.dataset.mapId);$('#atlas-results').hidden=true;return;}
   const a=button.dataset.atlas;if(a==='in')zoom(1.5);if(a==='out')zoom(1/1.5);if(a==='fit'){z=1;px=py=0;paint();}if(a==='my-zone')choose(root.dataset.currentZone);
   if(a==='choose-zone'&&map.zoneId)onChoose(map.zoneId);
   if(a==='expand'){root.classList.toggle('atlas-expanded');button.textContent=root.classList.contains('atlas-expanded')?t('Close','Stäng'):t('Expand','Förstora');layout();}
  });
  $('#atlas-select').addEventListener('change',e=>choose(e.target.value));
  $('#atlas-search').addEventListener('input',e=>{const list=$('#atlas-results'),q=e.target.value.trim();list.hidden=!q;const results=search(maps,q);list.innerHTML=results.length?results.map(m=>`<button data-map-id="${esc(m.id)}"><strong>${esc(m.title)}</strong><small>${esc((m.places||[]).filter(p=>norm(p).includes(norm(q))).slice(0,3).join(' · '))}</small></button>`).join(''):`<p>${t('No matching map or named place.','Ingen matchande karta eller plats.')}</p>`;});
  vp.addEventListener('wheel',e=>{
   e.preventDefault();if(e.deltaY===0)return;
   const now=performance.now();
   // A wheel burst must not cross multiple map levels in one continuous scroll.
   if(now-lastWheelAt>260)wheelOutLocked=false;
   lastWheelAt=now;
   if(e.deltaY>0&&wheelOutLocked)return;
   const previous=map.id,r=vp.getBoundingClientRect();
   zoom(e.deltaY<0?1.18:1/1.18,e.clientX-r.left,e.clientY-r.top,true);
   if(e.deltaY>0&&map.id!==previous)wheelOutLocked=true;
   if(e.deltaY<0)wheelOutLocked=false;
  },{passive:false});
  vp.addEventListener('pointerdown',e=>{
   if(e.button!==0&&e.pointerType==='mouse')return;
   if(!points.size)suppressClick=false;points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(!e.target.closest('button'))vp.setPointerCapture(e.pointerId);
   if(points.size===1)gesture={x:e.clientX,y:e.clientY,px,py};else if(points.size===2){suppressClick=true;const p=[...points.values()];gesture={distance:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2};}
  });
  vp.addEventListener('pointermove',e=>{
   if(!points.has(e.pointerId))return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(points.size===1&&gesture&&!gesture.distance){px=gesture.px+e.clientX-gesture.x;py=gesture.py+e.clientY-gesture.y;if(Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>6)suppressClick=true;paint();}
   else if(points.size===2&&gesture?.distance){const p=[...points.values()],distance=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),r=vp.getBoundingClientRect();suppressClick=true;zoom(distance/gesture.distance,(p[0].x+p[1].x)/2-r.left,(p[0].y+p[1].y)/2-r.top);if(gesture)gesture.distance=distance;}
  });
  function release(e){points.delete(e.pointerId);if(!points.size)gesture=null;else{const p=[...points.values()][0];gesture={x:p.x,y:p.y,px,py};}}
  vp.addEventListener('pointerup',release);vp.addEventListener('pointercancel',release);
  // A short tap or click selects a zone; dragging/pinching never activates it.
  vp.addEventListener('click',e=>{
   if(suppressClick||e.target.closest('button'))return;
   const r=vp.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
   const u=(x-(vw-bw*z)/2-px)/(bw*z),v=(y-(vh-bh*z)/2-py)/(bh*z);
   const hit=zoneAt(maps,map.id,u,v,.065);
   if(hit)choose(hit.id);
  });
  vp.addEventListener('dblclick',e=>{if(suppressClick)return;const r=vp.getBoundingClientRect();zoom(1.5,e.clientX-r.left,e.clientY-r.top);});
  vp.addEventListener('keydown',e=>{if(e.target!==vp)return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home','Escape'].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft')px+=50;if(e.key==='ArrowRight')px-=50;if(e.key==='ArrowUp')py+=50;if(e.key==='ArrowDown')py-=50;if(e.key==='+'||e.key==='=')zoom(1.5);if(e.key==='-')zoom(1/1.5);if(e.key==='Home'){z=1;px=py=0;}if(e.key==='Escape'){root.classList.remove('atlas-expanded');$('[data-atlas="expand"]').textContent=t('Expand','Förstora');layout();}paint();});
  img.addEventListener('load',layout);img.addEventListener('error',()=>{$('.atlas-status').textContent=t('Map image unavailable. Choose another map or reload when online.','Kartbilden är inte tillgänglig. Välj en annan karta eller ladda om när du är online.');});
  if(typeof ResizeObserver!=='undefined'){resizeObserver=new ResizeObserver(()=>{if(root.isConnected)layout();else resizeObserver.disconnect();});resizeObserver.observe(vp);}
  choose(map.id,false);
  if(showSources&&data.source){const p=document.createElement('p');p.className='small';const a=document.createElement('a');a.href=data.source;a.textContent=t('Map source','Kartkälla');a.target='_blank';a.rel='noopener noreferrer';p.append(a);root.append(p);}
  return {choose};
 }
 return {search,nearest,zoneAt,adjacentZones,bounds,zoomOutParent,mapNavigation,render,mount};
});
