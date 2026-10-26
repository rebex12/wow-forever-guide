const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const C=require('../core.js');
const T=require('../guide-tools.js');
const file=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
function data(){const window={};for(const f of ['catalog.js','content.js','zone-data.js','controller-data.js'])vm.runInNewContext(file(f),{window});T.augment(window.GUIDE_CONTENT,window.GUIDE_EXTRA_ZONES);return window;}
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
  const window={addEventListener(){},scrollTo(){},isSecureContext:false};const storage=new Map();const context={window,document,location:{hash:'',protocol:'http:'},history:{replaceState(){}},navigator:{onLine:true},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},getComputedStyle:()=>({getPropertyValue:()=> '#000'}),URL,console,setTimeout:()=>1,clearTimeout(){}};
  vm.createContext(context);for(const f of ['i18n.js','locales.js','catalog.js','content.js','core.js','guide-tools.js','zone-data.js','controller-data.js'])vm.runInContext(file(f),context);
  vm.runInContext(file('app.js').replace('  fillIcons();', '  window.testAPI={state,character,go,settings,renderShell,renderContent,searchPage,questCard,zoneCard,overview,controllerPage};\n  fillIcons();'),context);
  return {api:window.testAPI,element,document,events,storage};
}
test('every page renders in both languages and preserves user-written notes',()=>{
  const a=app(),c=a.api.character();c.name='Spara';c.notes='Spara och Visa <script>alert(1)</script>';
  for(const lang of ['en','sv']){a.api.state.settings.language=lang;for(const page of ['overview','talents','quests','dungeons','zones','zone-guide','abilities','gear','professions','notes','glossary','controller']){a.api.go(page);assert(a.element('#content').innerHTML.length>20,page);assert(!a.element('#content').innerHTML.includes('[object Object]'),page);assert(!a.element('#content').innerHTML.includes('undefined'),page);}a.api.go('notes');assert(a.element('#content').innerHTML.includes('Spara och Visa &lt;script&gt;alert(1)&lt;/script&gt;'));assert.equal(a.document.documentElement.lang,lang);}
});
test('detailed assistance expands quest steps and highest assistance survives compact mode',()=>{
  const a=app(),c=a.api.character();c.helpLevel=4;c.compact=true;c.filters.view='all';const card=a.api.questCard({id:'test',title:'Test',category:'quests',level:1,steps:['One','Two']});assert.match(card,/<details[^>]+open/);
  const html=a.api.overview();assert(!html.includes('Matched place'));assert.match(html,/for="session-help-level"/);
});
test('all new scripts and styles are cached for offline use',()=>{
  const sw=file('sw.js'),html=file('index.html');for(const match of html.matchAll(/(?:src|href)="\.\/([^"#]+\.(?:js|css))"/g))assert(sw.includes("'./"+match[1]+"'"),match[1]);assert.match(sw,/0\.2\.0/);
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
