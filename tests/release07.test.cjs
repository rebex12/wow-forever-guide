const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const C=require('../core.js'),P=require('../profession-planner.js'),A=require('../companion.js'),R=require('../travel-planner.js'),X=require('../travel-extra.js'),V=require('../release07.js'),Q=require('../quest-chains.js'),T=require('../guide-tools.js');
const D=X.apply(structuredClone(require('../travel-data.js')));
function guide(){const window={};for(const f of ['catalog.js','content.js','release-content.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),{window});window.RELEASE_CONTENT.apply(window.GUIDE_CONTENT);V.apply(window.GUIDE_CONTENT);return window;}
const route=(a,b,options={})=>R.plan(D,a,b,{faction:'Horde',...options});
test('0.7 data has all documented flight points, real connections and valid entrance anchors',()=>{
 assert.equal(D.flightPoints.length,65);assert.equal(D.edges.filter(e=>e.kind==='flight').length,286);assert.equal(D.entrances.length,45);
 for(const e of D.edges){assert(D.nodes[e.a]&&D.nodes[e.b]);assert(e.cost>0);assert(e.text.en&&e.text.sv);}
 for(const n of D.flightPoints){assert(D.nodes[n.parentNode]);assert(n.factions.length);assert(n.coords.x>=0&&n.coords.x<=100&&n.coords.y>=0&&n.coords.y<=100);}
 for(const row of V.training)assert(D.nodes[row.town],row.npc+' training destination');
});
test('local-place expansion preserves port aliases and never walks onto Feathermoon island',()=>{
 assert.equal(R.resolve(D,'Feathermoon').node,'port-feathermoon');assert.equal(R.resolve(D,'Dalaran').node,'port-dalaran-dock');
 const ferry=route('Feralas','Feathermoon',{faction:'Alliance'});assert(ferry.ok);assert(ferry.steps.some(e=>e.service==='feathermoon-ferry'));
 assert.equal(route('Feralas','Feathermoon',{faction:'Horde',transport:false}).error,'no-route');
 assert(route('Crossroads','Onyxia’s Lair').ok);assert(route('Onyxia’s Lair','Crossroads').ok);
});
test('Orgrimmar to Booty Bay works with real public transport and explains missing flight unlocks',()=>{
 const variants=R.alternatives(D,'Orgrimmar','Booty Bay',{faction:'Horde',transport:true});
 assert(variants.ground.ok);assert(variants.ground.steps.some(e=>e.kind==='zeppelin'||e.kind==='boat'));assert(!variants.ground.steps.some(e=>e.kind==='flight'));
 assert(variants.air);assert(variants.air.steps.some(e=>e.kind==='flight'));assert(variants.air.missingFlights.length>0);assert.equal(route('Orgrimmar','Booty Bay',{transport:false}).error,'no-route');
});
test('known-flight mode requires every endpoint and never borrows enemy connections',()=>{
 const potential=route('Orgrimmar','Booty Bay',{flights:true}),known=potential.requiredFlights;
 assert(known.length);const missing=route('Orgrimmar','Booty Bay',{flights:true,flightMode:'known',unlocked:known.slice(1)});
 assert(!missing.steps.some(e=>e.kind==='flight'&&e.requiredStops.some(id=>!known.slice(1).includes(id))));
 const learned=route('Orgrimmar','Booty Bay',{flights:true,flightMode:'known',unlocked:known});assert(learned.requiredFlights.length);assert.equal(learned.missingFlights.length,0);
 for(const faction of ['Horde','Alliance'])for(const name of ['Ratchet','Booty Bay','Onyxia’s Lair','The Hall of Thanes']){const r=route('Stormwind',name,{faction,flights:true});if(r.ok)assert(r.steps.every(e=>!e.faction||e.faction===faction));}
});
test('all named public ground destinations can reach and leave their faction network',()=>{
 // Check each start and destination, retaining real faction transport limits. Horde cannot enter Teldrassil by Alliance-only ships.
 const excluded={Horde:new Set(['zone-darnassus','zone-teldrassil','port-ruttheran','port-feathermoon']),Alliance:new Set()};
 for(const faction of ['Horde','Alliance']){const hub=faction==='Horde'?'Orgrimmar':'Stormwind';for(const n of Object.values(D.nodes).filter(n=>!n.flightPoint&&!excluded[faction].has(n.id)&&!excluded[faction].has(n.zone))){for(const [a,b] of [[hub,n.name],[n.name,hub]]){const r=route(a,b,{faction,avoidEnemy:false});assert(r.ok,faction+': '+a+' → '+b);}}}
});
test('entrance routes reach actual markers and preserve access warnings and wing ambiguity',()=>{
 const r=route('Orgrimmar',"Onyxia's Lair");assert(r.ok);assert.equal(r.to.node,'entrance-onyxia');assert(r.steps.at(-1).text.en.includes('52.9, 77.7'));assert(r.warnings.some(w=>/Drakefire/.test(w.text.en)));
 assert(route("Onyxia's Lair",'Booty Bay').ok);
 for(const n of D.entrances){assert(n.approach.en&&n.approach.sv&&n.access.en&&n.access.sv);if(n.category==='raid'&&n.status==='datamined-unconfirmed')assert(n.preliminary);}
 assert(route('Orgrimmar','The Hall of Thanes').ok,'explicit hostile-city entrance can be approached with a warning');
});
test('per-character planning data and activity choices survive backup without changing quest progress',()=>{
 const w=guide(),a=C.createCharacter({classId:'shaman'}),b=C.createBlankCharacter();a.done={'shaman-water':true};a.notes='keep';a.filters.activity='solo';
 a.companion={inventory:{'Linen Cloth':99},flightPoints:['flight-3310'],goals:[{kind:'quest',id:'shaman-water',completed:false}],favorites:['Booty Bay'],history:[{from:'Orgrimmar',to:'Booty Bay',faction:'Horde',transport:true,avoidEnemy:true,flightMode:'known'}],town:'zone-orgrimmar',turnIns:[{id:'shaman-earth',town:'zone-orgrimmar',ready:true}],trainingDone:['training-1']};
 const next=C.normalise(JSON.parse(JSON.stringify({schema:1,characters:[a,b],activeId:a.id})),w.FOREVER_CATALOG);assert.deepEqual(next.characters[0].companion,a.companion);assert.equal(next.characters[0].filters.activity,'solo');assert.deepEqual(next.characters[0].done,a.done);assert.equal(next.characters[0].notes,'keep');assert.equal(next.characters[1].companion.flightPoints.length,0);
});
test('malformed planning backup values are bounded and prototype keys rejected',()=>{
 const cp=C.normaliseCompanion(JSON.parse('{"inventory":{"__proto__":5,"Runecloth":-4,"Linen Cloth":1000001,"Wool Cloth":5},"goals":[{"id":"x","kind":"bad"}],"flightPoints":["x","x",4],"history":[{"to":"x"}]}'));
 assert.deepEqual(cp.inventory,{'Wool Cloth':5});assert.deepEqual(cp.flightPoints,['x']);assert.deepEqual(cp.goals,[]);assert.deepEqual(cp.history,[]);
});
test('inventory consumes owned materials once, prioritizes current stages and clamps at zero',()=>{
 const c=C.createCharacter({professions:['Cooking','First Aid'],professionSkills:{Cooking:1,'First Aid':1}});c.companion.inventory={'Linen Cloth':100,'Raw Brilliant Smallfish':10000};let rows=A.inventoryPlan(c,P),linen=rows.find(r=>r.name==='Linen Cloth');assert.equal(linen.total,175);assert.equal(linen.remaining,75);assert.equal(linen.remainingNow,0);assert.equal(linen.remainingFuture,75);assert.equal(rows.find(r=>r.name==='Raw Brilliant Smallfish').remaining,0);
 const shared={shopping:()=>[{name:'Shared',current:3,future:7,total:10,preliminary:false}]};c.companion.inventory.Shared=12;const row=A.inventoryPlan(c,shared)[0];assert.equal(row.total,20);assert.equal(row.remaining,8);assert.equal(row.remainingNow+row.remainingFuture,row.remaining);
});
test('goal preparation follows prerequisites and completion without bypassing the chain',()=>{
 const data={quests:[{id:'a',title:'A'},{id:'b',title:'B',requiresQuests:['a']}],dungeons:[]},c=C.createCharacter();c.companion.goals=[{kind:'quest',id:'b',completed:false}];let g=A.goalItems(c,data,[],C.questDone,Q.available)[0];assert(g.locked);assert.equal(g.prerequisites[0].id,'a');c.done.a=true;g=A.goalItems(c,data,[],C.questDone,Q.available)[0];assert(!g.locked);assert(!g.completed);c.done.b=true;assert(A.goalItems(c,data,[],C.questDone,Q.available)[0].completed);
});
test('activity filters distinguish documented group quests without mutating progress',()=>{
 const solo={category:'quests'},group={category:'quests',group:'Elite'},dungeon={category:'dungeons'};assert(A.activity(solo,'solo'));assert(!A.activity(group,'solo'));assert(!A.activity(dungeon,'solo'));assert(A.activity(group,'group'));assert(!A.activity(solo,'group'));assert(A.activity(solo,'all'));
});
test('all class-faction combinations have a documented own-faction capital trainer',()=>{
 for(const klass of ['warrior','paladin','hunter','rogue','priest','shaman','mage','warlock','druid'])for(const faction of ['Horde','Alliance'])assert(Object.values(D.classTrainers).some(c=>c[klass]?.includes(faction)),klass+' '+faction);
 assert(D.classTrainers['zone-ironforge'].shaman.includes('Alliance'));assert(D.classTrainers['zone-undercity'].paladin.includes('Horde'));assert(!D.classTrainers['zone-thunder-bluff'].druid.includes('Alliance'));
});
test('town visits show verified trainers, require explicit quest readiness and never assume turn-ins',()=>{
 const w=guide(),profile=C.createCharacter({classId:'shaman',faction:'Alliance',professions:['Cooking'],professionSkills:{Cooking:125},level:30});profile.companion.town='zone-ironforge';const opts={profile,data:w.GUIDE_CONTENT,catalog:w.FOREVER_CATALOG,travel:D,training:V.training,language:'en',done:C.questDone,available:Q.available,matches:C.matchesCharacter};let html=A.townVisit(opts);assert(html.includes('Class training'));assert(html.includes('quest log'));assert(html.includes('name="quest"'));assert(!html.includes('data-companion="hand-in"'));profile.companion.turnIns=[{id:'westfall-stew-delivery',town:'zone-ironforge',ready:true}];html=A.townVisit(opts);assert(html.includes('data-companion="hand-in"'));
});
test('Westfall recipe is behind its delivery quest and optional food never inflates leveling budgets',()=>{
 const w=guide(),c=C.createCharacter({faction:'Alliance'}),qs=w.GUIDE_CONTENT.quests,q=qs.find(q=>q.id==='westfall-stew-reward');assert(q);assert(!Q.available(q,c,qs,C.questDone));c.done['westfall-stew-delivery']=true;assert(Q.available(q,c,qs,C.questDone));assert.equal(q.minLevel,9);assert.equal(V.food.find(f=>f.id==='westfall-stew').craftOutput,2);assert(!P.shopping('Cooking',1).some(r=>/Okra|Goretusk|Hyjal/.test(r.name)));
});
test('camping covers every profession with effects, actual skill thresholds and individual sources',()=>{
 assert.equal(V.camping.length,12);for(const p of V.camping){assert(p.effect.en&&p.effect.sv);assert(p.source.startsWith('https://'));assert.equal(p.skill,p.profession==='Cooking'?1:20);}
 const w=guide();for(const p of w.GUIDE_CONTENT.professions)assert(p.skill&&p.desc.en&&p.desc.sv);
});
test('new bilingual screens escape saved names and keep source links optional',()=>{
 const c=C.createCharacter();c.companion.favorites=['<script>'];c.companion.history=[{from:'<x>',to:'Booty Bay',faction:'Horde'}];for(const language of ['en','sv']){const html=R.render({data:D,profile:c,language,initial:{from:'<x>',to:'Booty Bay'}});assert(!html.includes('<script>'));assert(html.includes('&lt;script&gt;'));assert(html.includes('journey-flight-mode'));const r=route('Orgrimmar','Booty Bay',{flights:true});assert(!R.resultHTML(r,{data:D,language}).includes('target="_blank"'));assert(R.resultHTML(r,{data:D,language,showSources:true}).includes('target="_blank"'));}
});
test('map-first order places the journey planner below all map controls',()=>{
 const M=require('../world-map.js'),window={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../map-data.js'),'utf8'),{window});const html=M.render({data:window.WORLD_MAP_DATA,journeyHTML:'<div id="gps-proof"></div>'});assert(html.indexOf('gps-proof')>html.indexOf('atlas-credit'));assert(html.indexOf('gps-proof')>html.indexOf('atlas-viewport'));
});

test('remounting a page replaces handlers so goal clicks and saves run exactly once',()=>{
 const listeners=new Map(),root={addEventListener(n,f){if(!listeners.has(n))listeners.set(n,new Set());listeners.get(n).add(f);},removeEventListener(n,f){listeners.get(n)?.delete(f);}},profile=C.createCharacter();let saves=0;
 const opts={profile,data:{quests:[]},crafts:[],catalog:{},travel:D,language:'en',save:()=>saves++,render:()=>A.mount(root,opts),go(){},done:C.questDone,available:Q.available,matches:C.matchesCharacter};
 for(let i=0;i<8;i++)A.mount(root,opts);assert.equal(listeners.get('click').size,1);assert.equal(listeners.get('change').size,1);
 const button={dataset:{companion:'pin',kind:'quest',id:'test'}},event={target:{closest:()=>button}};
 [...listeners.get('click')][0](event);assert.equal(profile.companion.goals.length,1);assert.equal(saves,1);assert.equal(listeners.get('click').size,1);
 [...listeners.get('click')][0](event);assert.equal(profile.companion.goals.length,0);assert.equal(saves,2);
});
