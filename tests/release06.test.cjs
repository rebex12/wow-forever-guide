const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');const R=require('../travel-planner.js'),D=require('../travel-data.js'),C=require('../core.js');const w={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../catalog.js'),'utf8'),{window:w});const db=w.FOREVER_CATALOG;
const route=(a,b,f='Horde',opts={})=>R.plan(D,a,b,{faction:f,...opts});
test('travel network has valid nodes, positive costs, bilingual directions and complete map references',()=>{
 const mapWindow={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../map-data.js'),'utf8'),{window:mapWindow});
 for(const n of Object.values(D.nodes)){assert(mapWindow.WORLD_MAP_DATA.maps[n.zone],n.name);assert.equal(n.id,D.nodes[n.id].id);}
 for(const e of D.edges){assert(D.nodes[e.a]&&D.nodes[e.b]);assert(e.cost>0);assert(e.text.en&&e.text.sv);assert(e.source.startsWith('https://'));if(e.faction)assert(['Alliance','Horde'].includes(e.faction));}
});
test('Horde capitals use the zeppelin towers rather than a fabricated walking connection',()=>{
 const r=route('Orgrimmar','Undercity');assert(r.ok);assert.deepEqual(r.steps.map(e=>e.kind),['walk','zeppelin','walk']);assert.equal(r.steps[1].service,'org-uc');assert(!r.warnings.some(w=>w.key.startsWith('enemy')));
});
test('Alliance uses the new Stormwind ship and the Darnassus village portal',()=>{
 const r=route('Stormwind','Darnassus','Alliance');assert(r.ok);assert(!r.steps.some(e=>e.kind==='local'));assert(r.steps.some(e=>e.service==='sw-auberdine'));assert(r.steps.some(e=>e.service==='auberdine-ruttheran'));assert(r.steps.some(e=>e.service==='darnassus-village'));
});
test('Menethil service preserves its one-way loop and keeps the intermediate stop on the same ride',()=>{
 const out=route('Menethil Harbor','Auberdine','Alliance'),back=route('Auberdine','Menethil Harbor','Alliance');assert(out.ok&&back.ok);assert.deepEqual(out.steps.map(e=>e.b),['port-southshore','port-auberdine']);assert.equal(back.steps.length,1);assert.equal(back.steps[0].b,'port-menethil');const html=R.resultHTML(out,{data:D,language:'en'});assert(html.includes('Stay aboard via Southshore'));assert(html.includes('1 transport ride'));assert(!D.edges.some(e=>e.a==='port-menethil'&&e.b==='port-auberdine'&&e.service==='menethil-loop'));
});
test('neutral ships work in both directions for both factions, including the new Riverglades route',()=>{
 for(const f of ['Horde','Alliance'])for(const [a,b] of [['Ratchet','Booty Bay'],['Booty Bay','Ratchet'],['Steamwheedle Port','Powderfuse Port'],['Powderfuse Port','Steamwheedle Port']]){const r=route(a,b,f);assert(r.ok,a+' to '+b);assert.equal(r.steps.length,1);assert.equal(r.steps[0].kind,'boat');}
});
test('Zephras skyboats allow both factions and warn Horde about Dalaran guards',()=>{
 for(const f of ['Horde','Alliance']){const r=route('Zephras Isle','Dalaran',f);assert(r.ok);assert(r.steps.some(e=>e.service==='dalaran-zephras'));assert.equal(r.warnings.some(w=>w.key==='node-port-dalaran-dock'),f==='Horde');}
 assert(!D.edges.some(e=>e.kind==='portal'&&(e.a==='port-dalaran-dock'||e.b==='port-dalaran-dock')),'does not assume the removed Stormwind return portal');
});
test('Feathermoon island is reached by ferry, not an invented road or swim',()=>{
 const r=route('Feralas','Feathermoon Stronghold','Alliance');assert(r.ok);assert.equal(r.steps.at(-1).service,'feathermoon-ferry');assert(!D.edges.some(e=>e.b==='port-feathermoon'&&e.kind==='walk'));
});
test('route input resolves town and subzone names and rejects unknown or ambiguous locations',()=>{
 const r=route('The Crossroads','Ratchet');assert(r.ok);assert.match(r.from.label,/Crossroads$/);assert.equal(r.from.node,'zone-barrens');assert(r.steps.some(e=>e.kind==='local'));assert.equal(route('Not A Real Zone','Ratchet').error,'unknown');assert.equal(R.plan(D,'Ratchet','Booty Bay',{}).error,'faction');assert(route('Ratchet','Ratchet').samePlace);
 const copy=JSON.parse(JSON.stringify(D));copy.nodes['zone-durotar'].aliases.push('Duplicate');copy.nodes['zone-barrens'].aliases.push('Duplicate');assert.equal(R.resolve(copy,'Duplicate').error,'ambiguous');
});
test('public transport can be disabled and faction-restricted ships are never silently used',()=>{
 const none=route('Ratchet','Booty Bay','Horde',{transport:false});assert.equal(none.error,'no-route');const h=route('Stormwind','Darnassus','Horde');assert.equal(h.error,'no-route');for(const f of ['Horde','Alliance'])for(const dest of ['Tanaris','Orgrimmar','Ironforge','Riverglades']){const r=route('Ratchet',dest,f);if(r.ok)assert(r.steps.every(e=>!e.faction||e.faction===f));}
});
test('enemy towns are avoided in transit but an explicitly chosen enemy destination is warned about',()=>{
 const d={sources:{map:'https://example.test'},nodes:{a:{id:'a',name:'A',zone:'a'},b:{id:'b',name:'B',zone:'b',faction:'Alliance'},c:{id:'c',name:'C',zone:'c'}},edges:[{a:'a',b:'b',cost:1,kind:'walk'},{a:'b',b:'c',cost:1,kind:'walk'},{a:'a',b:'c',cost:8,kind:'walk'}]};
 assert.equal(R.plan(d,'A','C',{faction:'Horde'}).steps.length,1);assert.equal(R.plan(d,'A','C',{faction:'Horde',avoidEnemy:false}).steps.length,2);assert(R.plan(d,'A','B',{faction:'Horde'}).warnings.some(w=>w.key==='enemy-b'));
});
test('dangerous levels, reputation passages and preliminary entrances are explicitly called out',()=>{
 const r=route('Felwood','Winterspring','Horde',{level:10,zoneLevels:{'zone-winterspring':53}});assert(r.ok);assert(r.warnings.some(w=>w.key==='level'));assert(r.warnings.some(w=>w.text.en.includes('Timbermaw')));const hy=route('Winterspring','Mount Hyjal');assert(hy.ok);assert(hy.warnings.some(w=>w.key==='preliminary'));
});
test('journey drafts round trip per character, including an empty starting profile',()=>{
 const a=C.createCharacter({journey:{from:'Ratchet',to:'Booty Bay',faction:'Horde',transport:true,planned:true}}),b=C.createBlankCharacter();b.journey={from:'Stormwind',to:'Darnassus',faction:'Alliance',transport:true,avoidEnemy:true,planned:true};const s=C.normalise({schema:1,characters:[a,b],activeId:b.id},db);assert.equal(s.characters[0].journey.from,'Ratchet');assert.equal(s.characters[1].journey.to,'Darnassus');assert(s.characters[1].blank);assert.equal(C.createCharacter().journey.planned,false);
});
test('both language views escape user-entered text and respect source-link preferences',()=>{
 for(const language of ['en','sv']){const html=R.render({data:D,language,initial:{from:'<script>bad()</script>',to:'" onfocus="bad'}});assert(html.includes('&lt;script&gt;'));assert(!html.includes('<script>'));assert(!html.includes('undefined'));const r=route('Menethil Harbor','Auberdine','Alliance');assert(!R.resultHTML(r,{data:D,language}).includes('href='));assert(R.resultHTML(r,{data:D,language,showSources:true}).includes('href='));}
});
