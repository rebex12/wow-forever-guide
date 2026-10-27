const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const C=require('../core.js');
const T=require('../guide-tools.js');
const file=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
function data(){const window={};for(const f of ['catalog.js','content.js','zone-data.js','controller-data.js','release-content.js'])vm.runInNewContext(file(f),{window});window.RELEASE_CONTENT.apply(window.GUIDE_CONTENT);Object.assign(T.dungeonZones,window.RELEASE_CONTENT.dungeonZones);T.augment(window.GUIDE_CONTENT,window.GUIDE_EXTRA_ZONES);return window;}
function language(){const L=require('../i18n.js');vm.runInNewContext(file('locales.js'),{window:{GuideI18n:L}});L.setLanguage('en');return L;}

test('old saves gain English defaults without losing progress, builds, notes or display choices',()=>{
  const w=data(),old=C.createCharacter({name:'Spara min karaktär',classId:'shaman',level:20});
  delete old.helpLevel;delete old.currentZone;delete old.currentPlace;delete old.controller;
  old.notes='Spara och Visa · <script>alert(1)</script>';old.beginner=false;old.compact=true;old.done={'shaman-water:0':true};old.filters.categories=['quests'];
  const next=C.normalise({schema:1,characters:[old],activeId:old.id},w.FOREVER_CATALOG);
  assert.equal(next.settings.language,'en');assert.equal(next.settings.theme,'forest');
  assert.equal(next.characters[0].notes,old.notes);assert.deepEqual(next.characters[0].done,old.done);assert.deepEqual(next.characters[0].filters,old.filters);
  assert.equal(next.characters[0].name,old.name);assert.equal(next.characters[0].beginner,false);assert.equal(next.characters[0].compact,true);assert.equal(next.characters[0].helpLevel,2);
});
test('zone, assistance and controller choice round trip separately for each profile',()=>{
  const w=data(),a=C.createCharacter({currentZone:'zone-barrens',currentPlace:'Crossroads',helpLevel:4,controller:'playstation'}),b=C.createCharacter({currentZone:'zone-westfall',currentPlace:'Moonbrook',helpLevel:1});
  const next=C.normalise(JSON.parse(JSON.stringify({schema:1,settings:{language:'sv',theme:'dark'},characters:[a,b],activeId:b.id})),w.FOREVER_CATALOG);
  assert.equal(next.settings.language,'sv');assert.equal(next.settings.theme,'dark');assert.equal(next.characters[0].currentZone,'zone-barrens');assert.equal(next.characters[0].currentPlace,'Crossroads');assert.equal(next.characters[0].helpLevel,4);assert.equal(next.characters[0].controller,'playstation');assert.equal(next.characters[1].helpLevel,1);assert.equal(next.activeId,b.id);
});
test('one zone search resolves towns, dungeons, punctuation and capitals to their parent zone',()=>{
  const zones=data().GUIDE_CONTENT.zones,c=C.createCharacter();
  for(const q of ['Crossroads','ratchet','The Crossroads','Wailing Caverns'])assert.equal(T.searchZones(zones,q,c)[0].zoneId,'zone-barrens',q);
  assert.equal(T.searchZones(zones,'Goldshire',c)[0].zoneId,'zone-elwynn');
  assert.equal(T.searchZones(zones,'Senjin',c)[0].zoneId,'zone-durotar');
  assert.equal(T.searchZones(zones,'Stormwind',c)[0].zoneId,'zone-stormwind-city');
  assert.equal(T.searchZones(zones,'NO SUCH PLACE',c).length,0);
  assert.equal(new Set(zones.map(z=>z.id)).size,zones.length);
});
test('basic reminders stay hidden outside beginner mode at every assistance level',()=>{
  const d=data().GUIDE_CONTENT,c=C.createCharacter();
  const basics=d.misc.filter(q=>['first-town','flight-paths','before-dungeon','keep-gold'].includes(q.id));assert.equal(basics.length,4);
  for(const helpLevel of [1,2,3,4])for(const q of basics)assert.equal(T.visibleAtHelp(q,{...c,helpLevel,beginner:false}),false);
  assert(basics.every(q=>T.visibleAtHelp(q,{...c,helpLevel:2,beginner:true})));
  assert(basics.every(q=>!T.visibleAtHelp(q,{...c,helpLevel:1,beginner:true})));
});
test('beginner zone prose explains dungeon names, while normal prose remains shorter',()=>{
  const L=language(),d=L.localize(data().GUIDE_CONTENT),b=d.zones.find(z=>z.id==='zone-barrens');
  assert.match(b.beginnerDesc,/Wailing Caverns.*dungeon/);assert.match(b.beginnerDesc,/towns.*Crossroads and Ratchet/);assert(b.beginnerDesc.length>b.desc.length);
  L.setLanguage('sv');const sv=L.localize(data().GUIDE_CONTENT).zones.find(z=>z.id==='zone-barrens');assert.match(sv.beginnerDesc,/dungeonen Wailing Caverns/);
});
test('localization translates authored text and preserves interpolated names and notes',()=>{
  const L=language(),user='Spara och Visa <b>Min build</b>';
  assert.equal(L.h`<p>Spara ${user}</p>`,'<p>Save '+user+'</p>');
  const d=L.localize(data().GUIDE_CONTENT);assert.equal(d.quests.find(q=>q.id==='shaman-water').title,'Call of Water');assert.match(d.quests.find(q=>q.id==='shaman-water').desc,/Water Totems/);
  L.setLanguage('sv');assert.equal(L.h`<p>Spara ${user}</p>`,'<p>Spara '+user+'</p>');assert.equal(L.t({en:'English text',sv:'Svensk text'}),'Svensk text');
});
test('controller entries have unique ids, bilingual help and a pinned client source',()=>{
  const controls=data().GUIDE_CONTROLS.rows;assert(controls.length>=60);assert.equal(new Set(controls.map(r=>r.id)).size,controls.length);
  for(const r of controls){assert(r.title.en&&r.title.sv&&r.desc.en&&r.desc.sv);assert(r.keys.length);assert.match(r.source,/^https:\/\/github\.com\/Gethe\/wow-ui-source\/blob\/[a-f0-9]{40}\//);}
  const L=language(),rows=L.localize(controls);assert(rows.some(r=>/map/i.test(r.title)));assert(rows.some(r=>/yourself/i.test(r.title)));L.setLanguage('sv');assert(L.localize(controls).some(r=>/karta/i.test(r.title)));
});

// A small DOM adapter exercises the real rendering functions and event wiring without a browser dependency.
function app(){
  const elements=new Map(),events={};
  const element=s=>{if(!elements.has(s))elements.set(s,{innerHTML:'',textContent:'',value:'',hidden:false,dataset:{},classList:{toggle(){},add(){},remove(){}},setAttribute(){},addEventListener(){},focus(){},close(){this.open=false},showModal(){this.open=true}});return elements.get(s);};
  const document={querySelector:element,querySelectorAll:()=>[],addEventListener:(n,f)=>events[n]=f,documentElement:{dataset:{}},body:{classList:{toggle(){}}}};
  const window={addEventListener(){},scrollTo(){},isSecureContext:false};const storage=new Map();const context={window,document,location:{hash:'',protocol:'http:'},history:{replaceState(){},pushState(){}},navigator:{onLine:true},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},getComputedStyle:()=>({getPropertyValue:()=> '#000'}),URL,console,setTimeout:()=>1,clearTimeout(){}};
  vm.createContext(context);for(const f of ['i18n.js','locales.js','catalog.js','content.js','core.js','guide-tools.js','zone-data.js','controller-data.js','character-rules.js','game-assets.js','quest-chains.js','release-content.js','talent-text.js','profession-planner.js'])vm.runInContext(file(f),context);
  vm.runInContext(file('app.js').replace('  fillIcons();', '  window.testAPI={state,character,go,settings,renderShell,renderContent,searchPage,questCard,zoneCard,overview,controllerPage,actionableItems,summary,builtIn,talents,goBack,sourceLine,dungeonCard,zoneGuide,talentInfo,showTalentTooltip,hideTalentTooltip,professionsPage,professionMaterials,professionGear};\n  fillIcons();'),context);
  return {api:window.testAPI,element,document,events,storage};
}
test('every page renders in both languages and preserves user-written notes',()=>{
  const a=app(),c=a.api.character();Object.assign(c,C.createCharacter({name:'Spara',level:20}));c.name='Spara';c.blank=false;c.notes='Spara och Visa <script>alert(1)</script>';
  for(const lang of ['en','sv']){a.api.state.settings.language=lang;for(const page of ['overview','talents','quests','dungeons','zones','zone-guide','abilities','gear','professions','notes','glossary','controller']){a.api.go(page);assert(a.element('#content').innerHTML.length>20,page);assert(!a.element('#content').innerHTML.includes('[object Object]'),page);assert(!a.element('#content').innerHTML.includes('undefined'),page);}a.api.go('notes');assert(a.element('#content').innerHTML.includes('Spara och Visa &lt;script&gt;alert(1)&lt;/script&gt;'));assert.equal(a.document.documentElement.lang,lang);}
});
test('detailed assistance expands quest steps and highest assistance survives compact mode',()=>{
  const a=app(),c=a.api.character();Object.assign(c,C.createCharacter({level:20}));c.blank=false;c.helpLevel=4;c.compact=true;c.filters.view='all';const card=a.api.questCard({id:'test',title:'Test',category:'quests',level:1,steps:['One','Two']});assert.match(card,/<details[^>]+open/);
  const html=a.api.overview();assert(!html.includes('Matched place'));assert(!html.includes('session-help-level'));a.api.settings();assert.match(a.element('#dialog-content').innerHTML,/settings-help-level/);
});
test('all new scripts and styles are cached for offline use',()=>{
  const sw=file('sw.js'),html=file('index.html');for(const match of html.matchAll(/(?:src|href)="\.\/([^"#]+\.(?:js|css))"/g))assert(sw.includes("'./"+match[1]+"'"),match[1]);assert(sw.includes("'"+data().GUIDE_CONTENT.version+"'"));
});
test('all five palettes keep normal text readable on their main surfaces',()=>{
  const css=file('styles.css')+'\n'+file('themes.css');
  const tokens=s=>Object.fromEntries([...s.matchAll(/--([\w-]+):(#[a-fA-F0-9]{3}(?:[a-fA-F0-9]{3})?)(?=[;}])/g)].map(m=>[m[1],m[2].length===4?'#'+[...m[2].slice(1)].map(c=>c+c).join(''):m[2]]));
  const base=tokens(css.slice(0,css.indexOf('\n')));
  const luminance=hex=>hex.slice(1).match(/../g).map(h=>parseInt(h,16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[0.2126,0.7152,0.0722][i],0);
  const contrast=(a,b)=>{const l=[luminance(a),luminance(b)].sort((a,b)=>a-b);return(l[1]+0.05)/(l[0]+0.05);};
  for(const theme of ['forest','dark','light','frost','parchment']){
    const block=css.match(new RegExp(':root\\[data-theme='+theme+'\\]\\{([^}]+)'))?.[1]||'';
    const palette={...base,...tokens(block+'}')};
    for(const fg of ['text','muted','faint','accent'])for(const bg of ['bg','panel','panel2'])assert(contrast(palette[fg],palette[bg])>=4.5,theme+' '+fg+' on '+bg);
    if(theme==='dark')assert.equal(palette.bg,'#000000');
  }
});


test('first launch and saved unconfigured profile stay empty',()=>{
 const a=app(),c=a.api.character();assert.equal(c.name,'');assert.equal(c.classId,'');assert.equal(c.blank,true);assert.equal(c.builds.length,0);assert.equal(c.professions.length,0);
 assert.match(a.element('#content').innerHTML,/Create character/);assert(!a.element('#content').innerHTML.includes('Loreia'));
 const restored=C.normalise(JSON.parse(a.storage.get(C.KEY)),data().FOREVER_CATALOG);assert.equal(restored.characters[0].blank,true);assert.equal(restored.characters[0].classId,'');
});
test('Forever class, faction and role choices exclude invalid combinations',()=>{
 const R=require('../character-rules.js');assert.deepEqual(R.availableRaces('paladin','Horde'),['Undead']);assert(!R.availableRaces('paladin','Horde').includes('Orc'));
 assert(R.availableRaces('shaman','Alliance').includes('Dwarf'));assert(R.availableRaces('mage','Horde').includes('Orc'));assert(!R.availableRaces('mage','Horde').includes('Skyborne'));assert(R.availableRaces('mage','Alliance').includes('Skyborne'));assert(!R.availableRaces('shaman','Alliance').includes('Skyborne'));
 for(const c of ['mage','warlock','hunter','rogue'])assert.deepEqual(R.roles[c],['DPS']);assert(R.roles.shaman.includes('Healer'));assert(!R.roles.shaman.includes('Tank'));
 const c={classId:'shaman',faction:'Horde',race:'Skyborne',role:'Healer',professions:['Skinning','Leatherworking',...R.secondary]};assert(R.valid(c));assert(!R.valid({...c,professions:[...c.professions,'Mining']}));
});
test('All tasks stay in ascending level order and completed level-one tasks survive leveling',()=>{
 const a=app(),c=a.api.character();Object.assign(c,C.createCharacter({name:'Test',level:1}));c.blank=false;c.filters.view='all';c.filters.showDone=true;c.done['first-town']=true;c.done['flight-paths']=true;
 const before=a.api.actionableItems().map(q=>q.id);assert(before.includes('first-town'));c.level=2;
 const tasks=a.api.actionableItems();assert(tasks.some(q=>q.id==='first-town'));assert(tasks.some(q=>q.id==='flight-paths'));assert(tasks.every((q,i)=>!i||tasks[i-1].level<=q.level));
 const html=a.api.overview();assert(html.includes('data-check="first-town"'));assert(html.includes('data-check="flight-paths"'));assert.match(html,/data-check="first-town"[^>]*checked/);
});
test('current and next talent cards use exact imported levels and real tree positions',()=>{
 const a=app(),c=a.api.character();Object.assign(c,C.createCharacter({name:'Test',level:20}));c.blank=false;const b=a.api.builtIn();c.builds=[b];c.activeBuild=b.id;
 const html=a.api.summary();assert(html.includes('Talent at this level'));assert(html.includes('Next talent point'));assert(html.includes('Level 20'));assert(html.includes('Level 21'));assert(html.includes('Row'));assert(html.includes('Column'));
 const talents=a.api.talents();assert(talents.includes('data-talent='));assert(!talents.includes('data-action="edit-order"'));assert(talents.includes('data-action="request-delete-build"'));assert(talents.includes('class="talent-grid"'));assert(talents.includes('current-point'));assert(talents.includes('next-point'));
});
test('Overview contains selected-zone guidance and no assistance controls or greetings',()=>{
 const a=app(),c=a.api.character();Object.assign(c,C.createCharacter({level:20,currentZone:'zone-barrens',currentPlace:'Crossroads'}));c.blank=false;const html=a.api.overview();assert(html.includes('Tips for The Barrens'));assert(html.includes('Wailing Caverns'));assert(!html.includes('type="range"'));assert(!html.includes('Hello,'));assert(!file('index.html').includes('id="beginner-toggle"'));assert(!html.includes('Level and checkmarks are saved automatically'));
});
test('back navigation returns to the previous app page',()=>{
 const a=app();Object.assign(a.api.character(),C.createCharacter({name:'Test'}),{blank:false});a.api.go('talents');a.api.go('notes');a.api.goBack();assert.match(a.element('#page-heading').innerHTML,/Talents/);a.api.goBack();assert.match(a.element('#page-heading').innerHTML,/Overview/);
});
test('every talent uses a bundled game icon and each catalogue position stays in its grid',()=>{
 const window={};vm.runInNewContext(file('game-assets.js'),{window});const assets=window.GAME_ASSETS;for(const cl of Object.values(data().FOREVER_CATALOG.classes))for(const t of cl.trees)for(const tal of t.talents){assert(assets.icons[assets.talents[tal.id]],tal.name);assert(tal.row>=0&&tal.col>=0&&tal.col<4);}
});

test('source links default off, persist when enabled, and affect cards across categories',()=>{
 const a=app(),c=a.api.character();Object.assign(c,C.createCharacter({name:'Test',level:20}),{blank:false});
 assert.equal(a.api.state.settings.showSourceLinks,false);assert.equal(a.api.sourceLine({source:'https://www.wowhead.com/forever/quest=1'}),'');assert(!a.api.controllerPage().includes('Client source'));
 a.api.state.settings.showSourceLinks=true;assert(a.api.sourceLine({source:'https://www.wowhead.com/forever/quest=1'}).includes('href='));assert(a.api.controllerPage().includes('Client source'));
 const saved=C.normalise(JSON.parse(JSON.stringify(a.api.state)),data().FOREVER_CATALOG);assert.equal(saved.settings.showSourceLinks,true);
 a.api.state.settings.showSourceLinks=false;assert(!a.api.dungeonCard(data().GUIDE_CONTENT.dungeons[0]).includes('href='));
});
test('all task views sort ascending and locked followups stay out of quests and zone tips',()=>{
 const a=app(),c=a.api.character();Object.assign(c,C.createCharacter({name:'Test',level:20,currentZone:'zone-barrens'}),{blank:false});
 for(const view of ['now','soon','all']){c.filters.view=view;const rows=a.api.actionableItems();assert(rows.every((q,i)=>!i||rows[i-1].level<=q.level));}
 c.filters.view='all';assert(!a.api.actionableItems().some(q=>q.id==='oasis-stagnant'));assert(!a.api.overview().includes('data-check="oasis-stagnant"'));assert(a.api.overview().includes('Later in this chain'));assert(a.api.overview().includes('Crescent Staff'));
 c.done['oasis-pools']=true;assert(a.api.actionableItems().some(q=>q.id==='oasis-stagnant'));assert(a.api.overview().includes('data-check="oasis-stagnant"'));delete c.done['oasis-pools'];assert(!a.api.actionableItems().some(q=>q.id==='oasis-stagnant'));
});
test('all dependency branches resolve and no chain contains a cycle',()=>{
 const Q=require('../quest-chains'),d=data().GUIDE_CONTENT,byId=new Map(d.quests.map(q=>[q.id,q]));
 for(const q of d.quests)for(const dep of [...(q.requiresQuests||[]),...(q.requiresAny||[])])assert(byId.has(dep),q.id+' -> '+dep);
 const visit=(id,path=[])=>{assert(!path.includes(id),'cycle '+[...path,id]);for(const dep of [...(byId.get(id)?.requiresQuests||[]),...(byId.get(id)?.requiresAny||[])])visit(dep,[...path,id]);};for(const q of d.quests)visit(q.id);
 const c=C.createCharacter({faction:'Horde'}),sleep=byId.get('sleep-stones');assert(!Q.available(sleep,c,d.quests,C.questDone));c.done['sleep-note-horde']=true;assert(Q.available(sleep,c,d.quests,C.questDone));
 const oox=byId.get('oox-reward');c.done['oox-tn-rescue']=true;c.done['oox-hl-rescue']=true;assert(!Q.available(oox,c,d.quests,C.questDone));c.done['oox-fe-rescue']=true;assert(Q.available(oox,c,d.quests,C.questDone));
});
test('Cozy Sleeping Bag is recommended at 20 with minimum 14 and faction-specific starts',()=>{
 const d=data().GUIDE_CONTENT,sleep=d.quests.filter(q=>q.id.startsWith('sleep-'));assert.equal(sleep.length,7);assert(sleep.every(q=>q.level===20&&q.minLevel===14));assert.equal(sleep.find(q=>q.id==='sleep-note-horde').faction,'Horde');assert.equal(sleep.find(q=>q.id==='sleep-note-alliance').faction,'Alliance');
});
test('dungeon coverage reaches 60 and every guide zone has mapped quest content',()=>{
 const d=data().GUIDE_CONTENT;assert.equal(d.dungeons.length,36);for(const id of ['sm-armory','sm-cathedral','rfd','uldaman','zf','mara-falls','sunken-temple','brd','lbrs','ubrs','scholomance','stratholme','dire-maul-east','dire-maul-west','dire-maul-north','blackmaw','shaper'])assert(d.dungeons.some(x=>x.id===id),id);
 for(const z of d.zones)assert(d.quests.some(q=>q.zoneIds?.includes(z.id)),z.title);
 for(const dungeon of d.dungeons){assert(dungeon.level<=dungeon.maxLevel);assert(dungeon.maxLevel<=60);assert(dungeon.level>=13);}
});
test('all nine talent classes have local backgrounds and every rank has readable effect text',()=>{
 const window={};vm.runInNewContext(file('talent-text.js'),{window});let count=0;
 for(const cl of Object.values(data().FOREVER_CATALOG.classes))for(const tree of cl.trees){assert(fs.existsSync(path.join(__dirname,'../assets/talents',tree.id+'.jpg')));for(const t of tree.talents)for(let rank=1;rank<=t.max;rank++){assert(window.TALENT_TEXT[t.id]?.[rank]?.length>5,t.name+' '+rank);count++;}}
 assert(count>1000);const a=app(),c=a.api.character();Object.assign(c,C.createCharacter({level:20}),{blank:false});const b=a.api.builtIn();c.builds=[b];c.activeBuild=b.id;const html=a.api.talents();assert(html.includes('talent-arrows'));assert(html.includes('data-tooltip='));assert(html.includes('assets/talents/'));const info=a.api.talentInfo(1,0);assert(info.includes('talent-effect'));assert(!info.includes('Effect text is not available'));
});
test('profession skills survive backup and character switching and reject invalid values',()=>{
 const db=data().FOREVER_CATALOG,a=C.createCharacter({professionSkills:{Cooking:125,'First Aid':80,Fishing:300,Alchemy:400,Unknown:100,Mining:-1,Tailoring:'50'}}),b=C.createCharacter({professionSkills:{Cooking:10}});
 const s=C.normalise({schema:1,characters:[a,b],activeId:b.id},db);assert.deepEqual(s.characters[0].professionSkills,{Cooking:125,'First Aid':80,Fishing:300});assert.equal(s.characters[1].professionSkills.Cooking,10);assert.deepEqual(C.createCharacter().professionSkills,{});
});
test('material budgets count leveling only and drop completed stages at exact boundaries',()=>{
 const P=require('../profession-planner');const c=P.shopping('Cooking',1).filter(x=>!x.preliminary);assert.equal(c.find(x=>x.name==='Raw Brilliant Smallfish').total,52);assert.equal(c.find(x=>x.name==='Raw Bristle Whisker Catfish').total,120);assert(!c.some(x=>x.name==='Giant Egg'));
 const mid=P.shopping('Cooking',125).find(x=>x.name==='Raw Bristle Whisker Catfish');assert.equal(mid.current,28);assert.equal(mid.future,65);assert.equal(mid.total,93);
 assert(!P.shopping('Cooking',50).some(x=>x.name==='Raw Brilliant Smallfish'));assert.equal(P.shopping('First Aid',1).filter(x=>!x.preliminary).find(x=>x.name==='Linen Cloth').total,175);assert(!P.shopping('First Aid',80).some(x=>x.name==='Linen Cloth'));assert.deepEqual(P.shopping('Cooking',300),[]);assert.deepEqual(P.shopping('First Aid',300),[]);assert.deepEqual(P.shopping('Fishing',1),[]);assert.deepEqual(P.shopping('Cooking',undefined),[]);
});
test('crafted gear respects every class, role, chosen professions and the imported talent school',()=>{
 const P=require('../profession-planner'),db=data().FOREVER_CATALOG;
 for(const [classId,roles]of Object.entries(P.specializations))for(const role of Object.keys(roles)){const c=C.createCharacter({classId,role,professions:['Blacksmithing','Leatherworking','Tailoring','Enchanting','Engineering']});const items=P.suggestions(c,null,db);assert(items.length,classId+' '+role);assert(items.every(x=>x.classId===classId&&x.role===role));}
 const c=C.createCharacter({classId:'mage',role:'DPS',professions:['Tailoring']});const trees=db.classes.mage.trees;const b={allocations:trees.map(t=>t.talents.map((x,i)=>t.name==='Fire'&&i===0?1:0))};const items=P.suggestions(c,b,db);assert(items.every(g=>g.profession==='Tailoring'&&g.spec==='Fire'));assert(items.some(g=>g.name.includes('Flame')));assert(!items.some(g=>g.name.includes('Pearly')));assert.deepEqual(P.suggestions({...c,professions:['Mining']},b,db),[]);
});
test('profession plans render in English and Swedish and retain source-link preferences',()=>{
 const a=app(),c=a.api.character();Object.assign(c,C.createCharacter({classId:'mage',role:'DPS',professions:['Tailoring','Enchanting','Cooking','First Aid','Fishing'],professionSkills:{Cooking:125,'First Aid':80,Fishing:200}}),{blank:false});
 for(const language of ['en','sv']){a.api.state.settings.language=language;a.api.go('professions');const html=a.element('#content').innerHTML;assert(!html.includes('[object Object]'));assert(!html.includes('undefined'));assert(html.includes('data-profession-skill="Fishing"'));assert(html.includes('Raw Bristle Whisker Catfish'));assert(html.includes('93'));assert(html.includes('Clamlette Surprise'));assert(!html.includes('href='));}
});
test('editing a profession skill updates the real view and saved profile immediately',()=>{
 const a=app(),c=a.api.character();Object.assign(c,C.createCharacter({name:'Test',professions:['Cooking'],professionSkills:{Cooking:1}}),{blank:false});a.api.go('professions');
 a.events.change({target:{dataset:{professionSkill:'Cooking'},value:'125',closest:()=>null,setCustomValidity(){}}});assert.equal(c.professionSkills.Cooking,125);assert(a.element('#content').innerHTML.includes('≈ 93'));const saved=JSON.parse(a.storage.get(C.KEY));assert.equal(saved.characters[0].professionSkills.Cooking,125);
 a.events.change({target:{dataset:{professionSkill:'Cooking'},value:'301',closest:()=>null,setCustomValidity(){},reportValidity(){}}});assert.equal(c.professionSkills.Cooking,125);
});
