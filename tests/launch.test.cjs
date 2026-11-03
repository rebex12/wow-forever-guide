'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const get=n=>fs.readFileSync(path.join(__dirname,'..',n),'utf8');
const boot=()=>{const window={};const ctx=vm.createContext({window});for(const file of ['catalog.js','talent-text.js','launch-talents.js'])vm.runInContext(get(file),ctx,{filename:file});return {catalog:window.FOREVER_CATALOG,text:window.TALENT_TEXT,launch:window.ForeverLaunch};};
const tree=(catalog,cls,no)=>catalog.classes[cls].trees[no].talents;
const named=(catalog,cls,no,name)=>tree(catalog,cls,no).find(t=>t.name===name);
test('launch data loads for all nine classes from the November 3 notes',()=>{
 const {catalog,launch}=boot();
 assert.equal(catalog.clientBuild,'1.60.1.70755');assert.equal(catalog.updated,'2026-11-03');
 assert.equal(Object.keys(catalog.classes).length,9);
 assert.equal(Object.keys(launch.classes).length,9);
});
test('all launch trees have unique positions, no dangling prerequisites and legal ranks',()=>{
 const {catalog,text}=boot();
 for(const [cls,c] of Object.entries(catalog.classes))for(let no=0;no<3;no++){
  const grid=new Set(),ids=new Set();
  for(const t of c.trees[no].talents){
   assert(t.row>=0&&t.row<=6,cls+' '+t.name+' row');
   assert(t.col>=0&&t.col<4,cls+' '+t.name+' column');
   assert(t.max>0&&t.max<=5,cls+' '+t.name+' ranks');
   assert.equal(t.required,t.row*5);
   const position=t.row+':'+t.col;assert(!grid.has(position),cls+' duplicate '+position);grid.add(position);
   assert(!ids.has(t.id),cls+' duplicate id '+t.id);ids.add(t.id);
   if(t.id<0){assert.equal(Object.keys(text[t.id]||{}).length,t.max,cls+' '+t.name+' missing rank descriptions');}
  }
  for(const t of c.trees[no].talents)for(const req of t.requires){assert(ids.has(req.id),cls+' '+t.name+' dangling prerequisite');assert(req.qty>0);}
 }
});
test('class changes: new talents, removed talents, tiers and rank caps',()=>{
 const {catalog}=boot();
 const check=(cls,i,n,max,row)=>{const t=named(catalog,cls,i,n);assert(t,cls+' '+n);if(max!==undefined)assert.equal(t.max,max);if(row!==undefined)assert.equal(t.row+1,row);return t;};
 check('shaman',1,'Improved Ghost Wolf',2,4);assert(!named(catalog,'shaman',0,'Lava Burst'));
 check('shaman',0,'Call of Thunder',1,5);check('shaman',0,'Lightning Mastery');
 check('warrior',1,'Reckless Swings',1,4);check('warrior',1,'Improved Whirlwind',2,6);check('warrior',1,'Flurry',3);
 check('hunter',0,'Pathfinding',2,3);assert(!named(catalog,'hunter',0,'Improved Revive Pet'));
 check('mage',0,'Arcane Resilience',3,1);assert(!named(catalog,'mage',0,'Arcane Focus'));check('mage',1,'Accelerant',5);
 check('mage',1,'Incineration',5);check('mage',1,'Critical Mass',3);
 check('priest',1,'Holy Binding',1);assert(!named(catalog,'priest',1,'Binding Heal'));
 check('paladin',0,'Oath of Light',1,4);check('paladin',0,'Boundless Light',2,5);
 check('paladin',1,'Stoicism',2,5);check('paladin',1,'Shieldsworn',1,7);
 check('paladin',2,'Unsealed Wrath',1,7);check('paladin',2,'Turn Evil',2,5);
 assert(!named(catalog,'paladin',2,'Twist of Light'));assert(!named(catalog,'paladin',0,'Voice of Truth'));
 check('rogue',0,'Blood Splatter',1,3);check('rogue',1,'Composure',2,3);
 check('rogue',1,'Flash of Steel',5,6);check('rogue',2,'Death Mark',1,7);
 check('druid',1,'Lacerate',1,4);check('druid',1,'Predatory Discipline',1,4);
 check('druid',2,'Bloom',1,3);check('druid',2,'Heart of the Wild',5,1);
});
test('saves from old trees are remapped by talent ID, never by the new index',()=>{
 const {catalog}=boot();
 // October catalog: Shaman Enhancement indexes 1=Thundering Strikes, 5=Ghost Wolf.
 const old={classId:'shaman',allocations:[[],Array(18).fill(0),[]],order:[{tree:1,index:1},{tree:1,index:5}],url:'https://www.wowhead.com/forever/talent-calc/shaman/v2-x'};
 old.allocations[1][1]=1;old.allocations[1][5]=1;
 const b=catalog.migrateLegacyBuild(old);
 const a=named(catalog,'shaman',1,'Thundering Strikes'),w=named(catalog,'shaman',1,'Improved Ghost Wolf');
 const newTree=tree(catalog,'shaman',1);
 assert.equal(b.allocations[1][newTree.indexOf(a)],1);
 assert.equal(b.allocations[1][newTree.indexOf(w)],1);
 assert.deepEqual(JSON.parse(JSON.stringify(b.order)),[{tree:1,index:newTree.indexOf(a)},{tree:1,index:newTree.indexOf(w)}]);
 assert.equal(b.talentData,catalog.dataVersion);assert.equal(b.url,'');
 // Removed talent points must never be reassigned to a different skill.
 const dead={classId:'rogue',allocations:[Array(17).fill(0),[],[]],order:[{tree:0,index:4}]};
 dead.allocations[0][4]=2; // old Murder, removed
 const clean=catalog.migrateLegacyBuild(dead);assert.equal(clean.allocations.flat().reduce((s,n)=>s+n,0),0);assert.equal(clean.order.length,0);
});
test('built-in launch information and offline script wiring are present',()=>{
 const {catalog}=boot();
 const html=get('index.html'),sw=get('sw.js');
 assert(html.indexOf('talent-text.js')<html.indexOf('launch-talents.js')&&html.indexOf('launch-talents.js')<html.indexOf('app.js'));
 assert.match(sw,/launch-talents\.js/);
 assert.match(get('app.js'),/Wavebreaker · launch Ghost Wolf/);
 assert.match(get('app.js'),/talentData=DB\.dataVersion/);
 const wolf=named(catalog,'shaman',1,'Improved Ghost Wolf');assert.equal(wolf.required,15);
});
