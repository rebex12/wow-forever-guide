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
 function plan(data,fromText,toText,{faction,level=60,transport=true,avoidEnemy=true,zoneLevels={}}={}){
  if(!['Horde','Alliance'].includes(faction))return {ok:false,error:'faction'};
  const from=resolve(data,fromText),to=resolve(data,toText);if(from.error||to.error)return {ok:false,error:from.error||to.error,field:from.error?'from':'to',matches:from.matches||to.matches||[]};
  if(from.node===to.node&&norm(from.label)===norm(to.label))return {ok:true,from,to,steps:[],warnings:[],samePlace:true};
  const start=from.node,end=to.node,dist=new Map([[start,0]]),previous=new Map(),pending=new Set(Object.keys(data.nodes));
  while(pending.size){
   let at=null,best=Infinity;for(const n of pending)if((dist.get(n)??Infinity)<best){at=n;best=dist.get(n);}
   if(at===null||at===end)break;pending.delete(at);
   for(const e of data.edges){if(e.a!==at||!pending.has(e.b)||e.faction&&e.faction!==faction||!transport&&!['walk','portal'].includes(e.kind))continue;
    const n=data.nodes[e.b];if(avoidEnemy&&n.faction&&n.faction!==faction&&e.b!==end&&e.b!==start)continue;
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
  return {ok:true,from,to,steps,warnings:[...new Map(warnings.map(w=>[w.key,w])).values()],faction,transportCount:steps.filter(e=>!['walk','local'].includes(e.kind)).length};
 }
 function render({data,language='en',profile={},initial={}}){
  const t=(a,b)=>language==='sv'?b:a,rows=locations(data),options=[...new Set(rows.map(r=>r.local?r.label:data.nodes[r.node].name))].sort((a,b)=>a.localeCompare(b)),faction=initial.faction||profile.faction||'';
  const current=profile.currentPlace||data.nodes[profile.currentZone]?.name||'',from=initial.from||current;
  return `<details class="journey-planner" open><summary><span class="journey-symbol" aria-hidden="true">↗</span><span>${t('Plan a journey','Planera en färdväg')}<small>${t('Simple directions · roads, boats and zeppelins','Enkel färdbeskrivning · vägar, båtar och zeppelins')}</small></span></summary><div class="journey-inner"><form id="journey-form"><div class="journey-fields"><label><span>${t('From','Från')}</span><input id="journey-from" name="from" type="text" list="journey-places" value="${esc(from)}" maxlength="100" placeholder="${t('Zone or town','Zon eller ort')}" autocomplete="off" required></label><button type="button" data-journey="swap" class="journey-swap" aria-label="${t('Swap start and destination','Byt start och mål')}">⇄</button><label><span>${t('To','Till')}</span><input id="journey-to" name="to" type="text" list="journey-places" value="${esc(initial.to||'')}" maxlength="100" placeholder="${t('Where do you want to go?','Vart vill du?')}" autocomplete="off" required></label><label class="journey-faction"><span>Faction</span><select id="journey-faction" name="faction" required><option value="">${t('Choose','Välj')}</option>${['Alliance','Horde'].map(f=>`<option ${f===faction?'selected':''}>${f}</option>`).join('')}</select></label></div><datalist id="journey-places">${options.map(v=>`<option value="${esc(v)}"></option>`).join('')}</datalist><div class="journey-options"><label class="form-check"><input id="journey-transport" type="checkbox" ${initial.transport!==false?'checked':''}>${t('Use public transport','Använd kollektivtrafik')}</label><label class="form-check"><input id="journey-avoid-enemy" type="checkbox" ${initial.avoidEnemy!==false?'checked':''}>${t('Avoid enemy settlements en route','Undvik fientliga orter längs vägen')}</label></div><div class="journey-actions"><button type="button" class="secondary-button" data-journey="current" ${current?'':'disabled'}>${t('Use my current zone','Använd min nuvarande zon')}</button><button class="primary-button" type="submit">${t('Find route','Visa färdväg')}</button></div></form><p class="journey-note">${t('A suggested route using roads and public transport. Local turns use your in-game map; travel times and flight-path unlocks are not assumed.','Ett ruttförslag med vägar och kollektivtrafik. Lokala svängar följer spelkartan; restider och upplåsta flygpunkter förutsätts inte.')}</p><div id="journey-result" aria-live="polite"></div></div></details>`;
 }
 function resultHTML(result,{data,language='en',showSources=false}={}){
  const t=(a,b)=>language==='sv'?b:a;
  if(!result.ok){const messages={faction:t('Choose a faction for the transport routes.','Välj faction för transportvägarna.'),missing:t('Enter a start and destination.','Ange start och mål.'),unknown:t('Place not found. Choose an English zone or town name from the suggestions.','Platsen hittades inte. Välj ett engelskt zon- eller ortsnamn bland förslagen.'),ambiguous:t('That place name matches more than one zone. Choose the entry with its zone name.','Platsnamnet matchar flera zoner. Välj alternativet med zonnamnet.'),'no-route':t('No supported route with these choices. Some connections require the other faction’s transport; try a nearby town or enable public transport.','Ingen stödd rutt med dessa val. Vissa förbindelser kräver den andra factionens transport; prova en närliggande ort eller aktivera kollektivtrafik.')};return `<p class="journey-error" role="alert">${result.field?esc(result.field==='from'?t('From: ','Från: '):t('To: ','Till: ')):''}${esc(messages[result.error]||messages.unknown)}</p>`;}
  if(result.samePlace)return `<p class="journey-arrived">${t('Start and destination are the same place.','Start och mål är samma plats.')}</p>`;
  const kinds={walk:t('Walk / ride','Gå / rid'),local:t('Local approach','Lokalt vägval'),boat:t('Boat','Båt'),zeppelin:'Zeppelin',skyboat:'Skyboat',tram:'Deeprun Tram',portal:t('City portal','Stadsportal')};
  // Consecutive stops on the same loop are one ride, with intermediate stops named explicitly.
  const steps=[];for(const edge of result.steps){const prev=steps.at(-1);if(edge.service&&prev?.service===edge.service&&prev.b===edge.a){prev.via.push(prev.b);prev.b=edge.b;prev.parts.push(edge);}else steps.push({...edge,parts:[edge],via:[]});}
  const transportCount=steps.filter(e=>!['walk','local'].includes(e.kind)).length;
  return `<section class="journey-route"><div class="journey-route-heading"><h3>${esc(result.from.label)} <span aria-hidden="true">→</span> ${esc(result.to.label)}</h3><p>${esc(result.faction)} · ${steps.length} ${t(steps.length===1?'step':'steps','steg')} · ${transportCount} ${t(transportCount===1?'transport ride':'transport rides',transportCount===1?'transportresa':'transportresor')}</p></div>${result.warnings.map(w=>`<p class="journey-warning">${esc(text(w.text,language))}</p>`).join('')}<ol class="journey-steps">${steps.map((e,i)=>{const a=data.nodes[e.a],b=data.nodes[e.b];return `<li class="journey-step ${e.kind}"><span class="journey-number">${i+1}</span><div class="journey-step-copy"><div class="journey-step-meta"><span>${kinds[e.kind]}</span>${e.preliminary?`<span>${t('Check passage','Kontrollera passage')}</span>`:''}</div><h4>${e.kind==='local'?esc(e.place||b.name):esc(a.name)+' → '+esc(b.name)}</h4>${e.via.length?`<p>${t('Stay aboard via','Stanna ombord via')} ${e.via.map(id=>esc(data.nodes[id].name)).join(' → ')}. ${t('Get off at','Kliv av vid')} ${esc(b.name)}.</p>`:`<p>${esc(text(e.text,language))}</p>`}${e.service==='menethil-loop'?`<small>${t('One-way service: Auberdine → Menethil Harbor → Southshore → Auberdine.','Enkelriktad slinga: Auberdine → Menethil Harbor → Southshore → Auberdine.')}</small>`:''}${e.local?`<small>${t('Follow the local map for the exact approach.','Följ den lokala kartan för sista biten.')}</small>`:''}<div class="journey-step-actions"><button type="button" class="text-button" data-journey-map="${esc(b.zone)}">${t('Show area on map','Visa området på kartan')} →</button>${showSources?`<a href="${esc(e.source)}" target="_blank" rel="noopener noreferrer">${t('Source','Källa')} ↗</a>`:''}</div></div></li>`;}).join('')}</ol><p class="journey-arrived">${t('Destination','Mål')}: ${esc(result.to.label)}</p></section>`;
 }
 function mount(root,{data,language='en',profile={},initial={},zoneLevels={},showSources=false,onDraft=()=>{},onMap=()=>{}}){
  if(!root)return;const $=s=>root.querySelector(s),form=$('#journey-form'),output=$('#journey-result');
  const read=planned=>({from:$('#journey-from').value.trim().slice(0,100),to:$('#journey-to').value.trim().slice(0,100),faction:$('#journey-faction').value,transport:$('#journey-transport').checked,avoidEnemy:$('#journey-avoid-enemy').checked,planned});
  function calculate(){const draft=read(true);onDraft(draft);const result=plan(data,draft.from,draft.to,{...draft,level:profile.blank?60:profile.level,zoneLevels});output.innerHTML=resultHTML(result,{data,language,showSources});}
  form.addEventListener('submit',e=>{e.preventDefault();calculate();});
  const changed=()=>{output.innerHTML='';onDraft(read(false));};form.addEventListener('input',changed);form.addEventListener('change',changed);
  root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.journeyMap){onMap(b.dataset.journeyMap);return;}
   if(b.dataset.journey==='swap'){const old=$('#journey-from').value;$('#journey-from').value=$('#journey-to').value;$('#journey-to').value=old;changed();}
   if(b.dataset.journey==='current'){$('#journey-from').value=profile.currentPlace||data.nodes[profile.currentZone]?.name||'';changed();}
  });
  if(initial.planned&&$('#journey-from').value&&$('#journey-to').value&&$('#journey-faction').value)calculate();
 }
 return {norm,locations,resolve,plan,render,resultHTML,mount};
});
