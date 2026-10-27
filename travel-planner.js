'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TravelPlanner=api;})(typeof window!=='undefined'?window:globalThis,function(){
 const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const text=(v,language)=>typeof v==='object'?(v?.[language]||v?.en||''):String(v||'');
 function locations(data){
  const rows=[];
  for(const n of Object.values(data.nodes)){
   rows.push({value:n.name,label:n.name,node:n.id,local:false});
   for(const alias of n.aliases||[]){
    const capitalAlias=n.faction&&['stormwind','sw','if','uc','tb','org'].includes(norm(alias));
    const local=n.id.startsWith('zone-')&&!capitalAlias&&norm(alias)!==norm(n.name.replace(/^The /,''))&&alias.length>3;
    rows.push({value:alias,label:local?alias+' — '+data.nodes[n.zone].name:n.name,node:n.id,local,place:local?alias:n.name});
    if(local)rows.push({value:alias+' — '+data.nodes[n.zone].name,label:alias+' — '+data.nodes[n.zone].name,node:n.id,local,place:alias});
    if(/^The /i.test(alias))rows.push({value:alias.slice(4),label:local?alias+' — '+data.nodes[n.zone].name:n.name,node:n.id,local,place:alias});
   }
  }
  return rows;
 }
 function resolve(data,query){
  const q=norm(query);if(!q)return {error:'missing'};
  const own=Object.values(data.nodes).filter(n=>norm(n.name)===q);if(own.length===1)return {node:own[0].id,label:own[0].name,local:false};
  const rows=locations(data).filter(r=>norm(r.value)===q),unique=[...new Map(rows.map(r=>[r.node,r])).values()];
  const ports=unique.filter(r=>r.node.startsWith('port-'));if(ports.length===1)return {...ports[0],label:ports[0].place||data.nodes[ports[0].node].name};
  if(unique.length!==1)return {error:unique.length?'ambiguous':'unknown',matches:unique.map(r=>r.label)};
  return {...unique[0],label:unique[0].place||data.nodes[unique[0].node].name};
 }
 function plan(data,fromText,toText,{faction,level=60,transport=true,avoidEnemy=true,zoneLevels={},flights=false,flightMode='all',unlocked=[]}={}){
  if(!['Horde','Alliance'].includes(faction))return {ok:false,error:'faction'};
  const from=resolve(data,fromText),to=resolve(data,toText);if(from.error||to.error)return {ok:false,error:from.error||to.error,field:from.error?'from':'to',matches:from.matches||to.matches||[]};
  if(from.node===to.node&&norm(from.label)===norm(to.label))return {ok:true,from,to,steps:[],warnings:[],samePlace:true};
  const start=from.node,end=to.node,dist=new Map([[start,0]]),previous=new Map(),pending=new Set(Object.keys(data.nodes));
  while(pending.size){
   let at=null,best=Infinity;for(const n of pending)if((dist.get(n)??Infinity)<best){at=n;best=dist.get(n);}
   if(at===null||at===end)break;pending.delete(at);
   for(const e of data.edges){if(e.a!==at||!pending.has(e.b)||e.faction&&e.faction!==faction||!transport&&!['walk','portal'].includes(e.kind)||e.kind==='flight'&&(!flights||flightMode==='known'&&!(e.requiredStops||[e.a,e.b]).every(id=>unlocked.includes(id))))continue;
    const n=data.nodes[e.b];if(avoidEnemy&&n.faction&&n.faction!==faction&&e.b!==end&&e.b!==start&&n.zone!==data.nodes[end].zone&&n.zone!==data.nodes[start].zone)continue;
    const min=zoneLevels[n.zone]||0,cost=e.cost+(min>level+10?3:0)+(e.preliminary?8:0),next=best+cost;
    if(next<(dist.get(e.b)??Infinity)){dist.set(e.b,next);previous.set(e.b,e);}
   }
  }
  if(start!==end&&!previous.has(end))return {ok:false,error:'no-route',from,to};
  const steps=[];let at=end;while(at!==start){const e=previous.get(at);if(!e)return {ok:false,error:'no-route',from,to};steps.unshift(e);at=e.a;}
  if(from.local)steps.unshift({a:start,b:start,kind:'local',place:from.label,text:{en:'From '+from.label+', find the main roads in '+data.nodes[start].name+' using your in-game map.',sv:'Från '+from.label+', ta dig till huvudvägarna i '+data.nodes[start].name+' med hjälp av spelkartan.'},local:true,cost:0,source:data.sources.map});
  if(to.local)steps.push({a:end,b:end,kind:'local',place:to.label,text:{en:'Continue within '+data.nodes[end].name+' to '+to.label+'. Use your in-game map for the final local turns.',sv:'Fortsätt inom '+data.nodes[end].name+' till '+to.label+'. Använd spelkartan för de sista lokala svängarna.'},local:true,cost:0,source:data.sources.map});
  if(!steps.length)steps.push({a:start,b:end,kind:'local',text:{en:'Both places are in '+data.nodes[start].name+'. Follow the local map from '+from.label+' to '+to.label+'.',sv:'Båda platserna ligger i '+data.nodes[start].name+'. Följ den lokala kartan från '+from.label+' till '+to.label+'.'},local:true,cost:0,source:data.sources.map});
  const warnings=[];const visited=new Set([start,...steps.flatMap(e=>[e.a,e.b])]);
  for(const id of visited){const n=data.nodes[id];if(n.faction&&n.faction!==faction)warnings.push({key:'enemy-'+id,text:{en:n.name+' is an enemy settlement for '+faction+'. Expect hostile guards.',sv:n.name+' är en fientlig ort för '+faction+'. Räkna med fientliga vakter.'}});if(n.warnings?.[faction])warnings.push({key:'node-'+id,text:n.warnings[faction]});}
  const high=[...new Set([...visited].map(id=>data.nodes[id].zone))].filter(id=>(zoneLevels[id]||0)>level+5);
  if(high.length)warnings.push({key:'level',text:{en:'Above your level: '+high.map(id=>data.nodes[id].name+' ('+zoneLevels[id]+'+)').join(', ')+'. Staying on roads does not guarantee safe passage.',sv:'Över din level: '+high.map(id=>data.nodes[id].name+' ('+zoneLevels[id]+'+)').join(', ')+'. Vägarna garanterar inte säker passage.'}});
  for(const e of steps)if(e.warning)warnings.push({key:JSON.stringify(e.warning),text:e.warning});
  if(steps.some(e=>e.preliminary))warnings.push({key:'preliminary',text:{en:'The final Mount Hyjal passage is preliminary. Check the current in-game entrance before traveling.',sv:'Den sista passagen till Mount Hyjal är preliminär. Kontrollera den aktuella ingången i spelet innan du reser.'}});
  for(const id of [start,end]){const n=data.nodes[id];if(n.entrance&&n.access)warnings.push({key:'access-'+id,text:n.access});}
  const requiredFlights=[...new Set(steps.filter(e=>e.kind==='flight').flatMap(e=>[e.a,...(e.requiredStops||[]).filter(id=>id!==e.a&&id!==e.b),e.b]))];
  return {ok:true,from,to,steps,warnings:[...new Map(warnings.map(w=>[w.key,w])).values()],faction,requiredFlights,missingFlights:requiredFlights.filter(id=>!unlocked.includes(id)),transportCount:steps.filter(e=>!['walk','local'].includes(e.kind)).length};
 }
 function render({data,language='en',profile={},initial={}}){
  const t=(a,b)=>language==='sv'?b:a,rows=locations(data),options=[...new Set(rows.map(r=>r.local?r.label:data.nodes[r.node].name))].sort((a,b)=>a.localeCompare(b)),faction=initial.faction||profile.faction||'';
  const current=profile.currentPlace||data.nodes[profile.currentZone]?.name||'',from=initial.from||current;
  return `<details class="journey-planner" open><summary><span class="journey-symbol" aria-hidden="true">↗</span><span>${t('Plan a journey','Planera en färdväg')}<small>${t('Simple directions · roads, boats and zeppelins','Enkel färdbeskrivning · vägar, båtar och zeppelins')}</small></span></summary><div class="journey-inner"><form id="journey-form"><div class="journey-fields"><label><span>${t('From','Från')}</span><input id="journey-from" name="from" type="text" list="journey-places" value="${esc(from)}" maxlength="100" placeholder="${t('Zone, town or entrance','Zon, ort eller ingång')}" autocomplete="off" required></label><button type="button" data-journey="swap" class="journey-swap" aria-label="${t('Swap start and destination','Byt start och mål')}">⇄</button><label><span>${t('To','Till')}</span><input id="journey-to" name="to" type="text" list="journey-places" value="${esc(initial.to||'')}" maxlength="100" placeholder="${t('Where do you want to go?','Vart vill du?')}" autocomplete="off" required></label><label class="journey-faction" for="journey-faction"><span>Faction</span><select id="journey-faction" name="faction" required><option value="">${t('Choose','Välj')}</option>${['Alliance','Horde'].map(f=>`<option ${f===faction?'selected':''}>${f}</option>`).join('')}</select></label></div><datalist id="journey-places">${options.map(v=>`<option value="${esc(v)}"></option>`).join('')}</datalist><div class="journey-options"><label class="form-check"><input id="journey-transport" type="checkbox" ${initial.transport!==false?'checked':''}>${t('Use public transport','Använd kollektivtrafik')}</label><label class="form-check"><input id="journey-avoid-enemy" type="checkbox" ${initial.avoidEnemy!==false?'checked':''}>${t('Avoid enemy settlements en route','Undvik fientliga orter längs vägen')}</label></div><label class="journey-flight-mode"><span>${t('Flight alternatives','Flygalternativ')}</span><select id="journey-flight-mode"><option value="all" ${initial.flightMode!=='known'?'selected':''}>${t('Show required unlocks','Visa nödvändiga upplåsningar')}</option><option value="known" ${initial.flightMode==='known'?'selected':''}>${t('Only my unlocked flight points','Bara mina upplåsta flygpunkter')}</option></select></label><div class="journey-actions"><button type="button" class="secondary-button" data-journey="current" ${current?'':'disabled'}>${t('Use my current zone','Använd min nuvarande zon')}</button><button class="primary-button" type="submit">${t('Find route','Visa färdväg')}</button></div></form><p class="journey-note">${t('A suggested route using roads and public transport. Local turns use your in-game map; travel times and flight-path unlocks are not assumed.','Ett ruttförslag med vägar och kollektivtrafik. Lokala svängar följer spelkartan; restider och upplåsta flygpunkter förutsätts inte.')}</p><div id="journey-result" aria-live="polite"></div>${savedMarkup(data,profile,language)}<details class="flight-points"><summary>${t('My unlocked flight points','Mina upplåsta flygpunkter')}</summary><p class="small">${t('Tick the points you have unlocked on this character. Every point used by a flight itinerary is required.','Bocka av punkterna denna karaktär låst upp. Varje punkt i en flygrutt måste vara upplåst.')}</p><input id="flight-search" type="search" placeholder="${t('Filter flight points…','Filtrera flygpunkter…')}" aria-label="${t('Filter flight points','Filtrera flygpunkter')}"><div id="flight-choices">${flightChoices(data,profile,faction,language)}</div></details></div></details>`;
 }
 function resultHTML(result,{data,language='en',showSources=false}={}){
  const t=(a,b)=>language==='sv'?b:a;
  if(!result.ok){const messages={faction:t('Choose a faction for the transport routes.','Välj faction för transportvägarna.'),missing:t('Enter a start and destination.','Ange start och mål.'),unknown:t('Place not found. Choose an English zone or town name from the suggestions.','Platsen hittades inte. Välj ett engelskt zon- eller ortsnamn bland förslagen.'),ambiguous:t('That place name matches more than one zone. Choose the entry with its zone name.','Platsnamnet matchar flera zoner. Välj alternativet med zonnamnet.'),'no-route':t('No route with the current choices. Travel across water may require public transport. Try enabling it or allowing enemy settlements; faction-restricted transport cannot be used. Some beta connections are not documented yet.','Ingen rutt med aktuella val. Resor över vatten kan kräva kollektivtrafik. Prova att aktivera den eller tillåta fientliga orter; factionbegränsade transporter kan inte användas. Vissa betaförbindelser är ännu inte dokumenterade.')};return `<p class="journey-error" role="alert">${result.field?esc(result.field==='from'?t('From: ','Från: '):t('To: ','Till: ')):''}${esc(messages[result.error]||messages.unknown)}</p>`;}
  if(result.samePlace)return `<p class="journey-arrived">${t('Start and destination are the same place.','Start och mål är samma plats.')}</p>`;
  const kinds={walk:t('Walk / ride','Gå / rid'),local:t('Local approach','Lokalt vägval'),boat:t('Boat','Båt'),zeppelin:'Zeppelin',skyboat:'Skyboat',tram:'Deeprun Tram',flight:t('Flight path','Flygförbindelse'),portal:t('City portal','Stadsportal')};
  // Consecutive stops on the same loop are one ride, with intermediate stops named explicitly.
  const steps=[];for(const edge of result.steps){const prev=steps.at(-1);if(edge.service&&prev?.service===edge.service&&prev.b===edge.a){prev.via.push(prev.b);prev.b=edge.b;prev.parts.push(edge);}else steps.push({...edge,parts:[edge],via:[]});}
  const transportCount=steps.filter(e=>!['walk','local'].includes(e.kind)).length;
  return `<section class="journey-route"><div class="journey-route-heading"><h3>${esc(result.from.label)} <span aria-hidden="true">→</span> ${esc(result.to.label)}</h3><p>${esc(result.faction)} · ${steps.length} ${t(steps.length===1?'step':'steps','steg')} · ${transportCount} ${t(transportCount===1?'transport ride':'transport rides',transportCount===1?'transportresa':'transportresor')}</p></div>${result.requiredFlights?.length?`<p class="flight-requirement ${result.missingFlights?.length?'missing':'known'}"><strong>${t('Required flight points','Flygpunkter som krävs')}:</strong> ${result.requiredFlights.map(id=>{const n=data.flightPoints?.find(n=>n.id===id);return esc(n?.name||data.nodes[id].name)+(result.missingFlights?.includes(id)?' · '+t('not marked unlocked','ej markerad upplåst'):' ✓');}).join(' → ')}</p>`:''}${result.warnings.map(w=>`<p class="journey-warning">${esc(text(w.text,language))}</p>`).join('')}<ol class="journey-steps">${steps.map((e,i)=>{const a=data.nodes[e.a],b=data.nodes[e.b];return `<li class="journey-step ${e.kind}"><span class="journey-number">${i+1}</span><div class="journey-step-copy"><div class="journey-step-meta"><span>${kinds[e.kind]}</span>${e.preliminary?`<span>${t('Check passage','Kontrollera passage')}</span>`:''}</div><h4>${e.kind==='local'?esc(e.place||b.name):esc(a.name)+' → '+esc(b.name)}</h4>${e.via.length?`<p>${t('Stay aboard via','Stanna ombord via')} ${e.via.map(id=>esc(data.nodes[id].name)).join(' → ')}. ${t('Get off at','Kliv av vid')} ${esc(b.name)}.</p>`:`<p>${esc(text(e.text,language))}</p>`}${e.service==='menethil-loop'?`<small>${t('One-way service: Auberdine → Menethil Harbor → Southshore → Auberdine.','Enkelriktad slinga: Auberdine → Menethil Harbor → Southshore → Auberdine.')}</small>`:''}${e.local?`<small>${t('Follow the local map for the exact approach.','Följ den lokala kartan för sista biten.')}</small>`:''}<div class="journey-step-actions"><button type="button" class="text-button" data-journey-map="${esc(b.zone)}">${t('Show area on map','Visa området på kartan')} →</button>${showSources?`<a href="${esc(e.source)}" target="_blank" rel="noopener noreferrer">${t('Source','Källa')} ↗</a>`:''}</div></div></li>`;}).join('')}</ol><p class="journey-arrived">${t('Destination','Mål')}: ${esc(result.to.label)}</p></section>`;
 }
 function flightChoices(data,profile,faction,language,query=''){
  const t=(a,b)=>language==='sv'?b:a,points=(data.flightPoints||[]).filter(n=>n.factions.includes(faction)&&norm(n.name+' '+n.master).includes(norm(query)));
  return points.length?points.map(n=>`<label class="form-check flight-choice"><input type="checkbox" data-flight-unlocked="${esc(n.id)}" ${(profile.companion?.flightPoints||[]).includes(n.id)?'checked':''}><span>${esc(n.name)}<small>${esc(n.master)}</small></span></label>`).join(''):`<p class="small">${t('Choose a faction or change the search to see flight points.','Välj faction eller ändra sökningen för att se flygpunkter.')}</p>`;
 }
 function savedMarkup(data,profile,language){
  const t=(a,b)=>language==='sv'?b:a,cp=profile.companion||{},favorites=cp.favorites||[],recent=cp.history||[];
  return `<section class="journey-saved"><div class="section-top"><h3>${t('Saved destinations','Sparade destinationer')}</h3><button type="button" class="text-button" data-journey="favorite">☆ ${t('Save destination','Spara destination')}</button></div><div class="journey-favorites">${favorites.length?favorites.map(name=>`<div><button type="button" class="secondary-button" data-favorite-to="${esc(name)}">★ ${esc(name)}</button><button type="button" class="text-button" data-remove-favorite="${esc(name)}" aria-label="${t('Remove favorite','Ta bort favorit')}: ${esc(name)}">×</button></div>`).join(''):`<p class="small">${t('Save a destination for quick reuse.','Spara en destination för att använda den snabbt igen.')}</p>`}</div><details class="journey-history"><summary>${t('Recent journeys','Senaste resor')} (${recent.length})</summary>${recent.map((r,i)=>`<div><button type="button" class="text-button" data-recent-journey="${i}">${esc(r.from)} → ${esc(r.to)} · ${esc(r.faction)}</button><button type="button" class="text-button" data-remove-journey="${i}" aria-label="${t('Remove journey','Ta bort resa')}: ${esc(r.from)} → ${esc(r.to)}">×</button></div>`).join('')}${recent.length?`<button type="button" class="text-button" data-journey="clear-history">${t('Clear recent journeys','Rensa senaste resor')}</button>`:''}</details><p id="journey-save-feedback" role="status"></p></section>`;
 }
 function alternatives(data,from,to,options){
  const ground=plan(data,from,to,{...options,flights:false});
  const air=options.transport!==false?plan(data,from,to,{...options,flights:true}):null;
  return {ground,air:air?.ok&&air.steps.some(e=>e.kind==='flight')?air:null};
 }
 function mount(root,{data,language='en',profile={},initial={},zoneLevels={},showSources=false,onDraft=()=>{},onMap=()=>{},onProfile=()=>{}}){
  if(!root)return;const $=s=>root.querySelector(s),form=$('#journey-form'),output=$('#journey-result'),t=(a,b)=>language==='sv'?b:a;
  profile.companion||={flightPoints:[],favorites:[],history:[]};const cp=profile.companion;
  const read=planned=>({from:$('#journey-from').value.trim().slice(0,100),to:$('#journey-to').value.trim().slice(0,100),faction:$('#journey-faction').value,transport:$('#journey-transport').checked,avoidEnemy:$('#journey-avoid-enemy').checked,flightMode:$('#journey-flight-mode').value,planned});
  function refreshSaved(){const old=$('.journey-saved');old.outerHTML=savedMarkup(data,profile,language);}
  function refreshFlights(){$('#flight-choices').innerHTML=flightChoices(data,profile,$('#journey-faction').value,language,$('#flight-search').value);}
  function calculate(record=false){const draft=read(true);onDraft(draft);const routes=alternatives(data,draft.from,draft.to,{...draft,unlocked:cp.flightPoints||[],level:profile.blank?60:profile.level,zoneLevels});
   if(!draft.transport)output.innerHTML=resultHTML(routes.ground,{data,language,showSources});
   else output.innerHTML=(routes.air?`<details class="route-alternative flight-alternative" open><summary>${t('With flight paths','Med flygförbindelser')}${routes.air.missingFlights.length?' · '+t('requires unlocks','kräver upplåsningar'):' · '+t('all points marked unlocked','alla punkter markerade upplåsta')}</summary>${resultHTML(routes.air,{data,language,showSources})}</details>`:`<p class="field-hint">${draft.flightMode==='known'?t('No useful flight itinerary using your marked points. Unlock additional points or choose “Show required unlocks”.','Ingen användbar flygrutt med markerade punkter. Lås upp fler eller välj ”Visa nödvändiga upplåsningar”.'):t('No useful documented flight itinerary for this trip.','Ingen användbar dokumenterad flygrutt för denna resa.')}</p>`)+`<details class="route-alternative ground-alternative" open><summary>${t('Without flight paths · roads and other transport','Utan flygförbindelser · vägar och övriga transporter')}</summary>${resultHTML(routes.ground,{data,language,showSources})}</details>`;
   if(record&&(routes.ground.ok||routes.air?.ok)){cp.history=[{...draft},...(cp.history||[]).filter(r=>!(r.from===draft.from&&r.to===draft.to&&r.faction===draft.faction))].slice(0,15);onProfile();refreshSaved();}
  }
  form.addEventListener('submit',e=>{e.preventDefault();calculate(true);});
  const changed=()=>{output.innerHTML='';onDraft(read(false));};form.addEventListener('input',changed);form.addEventListener('change',e=>{changed();if(e.target.id==='journey-faction')refreshFlights();});
  $('#flight-search').addEventListener('input',refreshFlights);
  root.addEventListener('change',e=>{const id=e.target.dataset.flightUnlocked;if(!id)return;cp.flightPoints=e.target.checked?[...new Set([...(cp.flightPoints||[]),id])]:(cp.flightPoints||[]).filter(n=>n!==id);onProfile();if(profile.journey?.planned)calculate();});
  root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.journeyMap){onMap(b.dataset.journeyMap);return;}
   if(b.dataset.journey==='swap'){const old=$('#journey-from').value;$('#journey-from').value=$('#journey-to').value;$('#journey-to').value=old;changed();}
   if(b.dataset.journey==='current'){$('#journey-from').value=profile.currentPlace||data.nodes[profile.currentZone]?.name||'';changed();}
   if(b.dataset.journey==='favorite'){const r=resolve(data,$('#journey-to').value);if(r.error){$('#journey-save-feedback').textContent=t('Choose a valid destination first.','Välj en giltig destination först.');return;}cp.favorites=[...new Set([...(cp.favorites||[]),r.label])].slice(0,60);onProfile();refreshSaved();}
   if(b.dataset.favoriteTo){$('#journey-to').value=b.dataset.favoriteTo;changed();}
   if(b.dataset.removeFavorite){cp.favorites=cp.favorites.filter(n=>n!==b.dataset.removeFavorite);onProfile();refreshSaved();}
   if(b.dataset.recentJourney!==undefined){const r=cp.history[+b.dataset.recentJourney];if(!r)return;$('#journey-from').value=r.from;$('#journey-to').value=r.to;$('#journey-faction').value=r.faction;$('#journey-transport').checked=r.transport;$('#journey-avoid-enemy').checked=r.avoidEnemy;$('#journey-flight-mode').value=r.flightMode||'all';refreshFlights();calculate(false);}
   if(b.dataset.removeJourney!==undefined){cp.history.splice(+b.dataset.removeJourney,1);onProfile();refreshSaved();}
   if(b.dataset.journey==='clear-history'){cp.history=[];onProfile();refreshSaved();}
  });
  if(initial.planned&&$('#journey-from').value&&$('#journey-to').value&&$('#journey-faction').value)calculate();
 }
 return {norm,locations,resolve,plan,render,resultHTML,mount,alternatives,flightChoices,savedMarkup};
});
