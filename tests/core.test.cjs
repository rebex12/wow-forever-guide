const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../catalog.js'),'utf8'),ctx);
const catalog=JSON.parse(JSON.stringify(ctx.window.FOREVER_CATALOG));
const C=require('../core.js');
const URL='https://www.wowhead.com/forever/talent-calc/shaman/v2-0550020210401-5030500115013151_t5/1B2AEj1CFjhhp2ChKnPqRs1mmmm';
test('real Forever v2 link decodes 0/20/31 and the complete compressed talent order',()=>{
 const b=C.parseWowhead(URL,catalog,'shaman');assert.deepEqual(b.allocations.map(t=>t.reduce((a,b)=>a+b,0)),[0,20,31]);assert.equal(b.order.length,51);assert.equal(b.startLevel,5);
 const steps=C.buildSteps(b,catalog);assert.equal(steps[0].name,'Thundering Strikes');assert.equal(steps[4].rank,5);assert.equal(steps[5].name,'Improved Healing Wave');assert.equal(steps[15].name,'Water Shield');assert.equal(steps.at(-1).name,'Toughness');
 assert(C.validateOrder(b,catalog).some(w=>w.message.includes('Stormstrike')));
});
test('allocation-only links keep order absent, with no guessed leveling plan',()=>{const b=C.parseWowhead(URL.split('_')[0],catalog);assert.equal(b.order.length,0);assert.equal(b.startLevel,10);});
test('all nine class catalogs support rank import',()=>{for(const [id,c]of Object.entries(catalog.classes)){const target=c.trees[0].talents[0];const b=C.parseWowhead('https://www.wowhead.com/forever/talent-calc/'+id+'/v21',catalog,id);assert.equal(b.allocations[0][0],1);assert.equal(b.classId,id);assert(target.max>=1);}});
test('malformed links, disguised hosts, wrong classes and inconsistent orders are rejected',()=>{
 for(const u of ['https://wowhead.com.evil.test/forever/talent-calc/shaman/v21','javascript:alert(1)','https://www.wowhead.com/classic/talent-calc/shaman/123','https://www.wowhead.com/forever/talent-calc/shaman/v99999','https://www.wowhead.com/forever/talent-calc/shaman/v26','https://www.wowhead.com/forever/talent-calc/shaman/v21/0B'])assert.throws(()=>C.parseWowhead(u,catalog));
 assert.throws(()=>C.parseWowhead(URL,catalog,'mage'),/Shaman/);
});
test('save and restore preserves level, checked steps, notes, filters, compact mode and builds',()=>{
 const c=C.createCharacter({name:'Loreia',classId:'shaman',race:'Skyborne',level:23});c.done['shaman-water:0']=true;c.notes='Till nästa gång';c.compact=true;c.filters.categories=['quests'];c.builds=[C.parseWowhead(URL,catalog)];c.activeBuild=c.builds[0].id;
 const data={schema:1,characters:[c],activeId:c.id};let stored;C.storeState({setItem:(key,val)=>{assert.equal(key,C.KEY);stored=val;}},data);
 const out=C.normalise(JSON.parse(stored),catalog);assert.equal(out.characters[0].level,23);assert.equal(out.characters[0].done['shaman-water:0'],true);assert.equal(out.characters[0].notes,c.notes);assert.equal(out.characters[0].compact,true);assert.deepEqual(out.characters[0].filters.categories,['quests']);assert.equal(out.characters[0].builds[0].order.length,51);
});
test('backups with unsupported schemas and unknown classes are rejected atomically',()=>{
 assert.throws(()=>C.normalise({schema:2,characters:[]},catalog));const c=C.createCharacter();assert.throws(()=>C.normalise({schema:1,characters:[c,{...c,classId:'death-knight'}]},catalog));
});
test('duplicate profile ids are replaced and faction/race filters keep class quests relevant',()=>{
 const c=C.createCharacter({race:'Skyborne',classId:'shaman'});const out=C.normalise({schema:1,activeId:c.id,characters:[c,{...c,name:'Alt'}]},catalog);assert.notEqual(out.characters[0].id,out.characters[1].id);
 assert.equal(C.matchesCharacter({classId:'shaman',faction:'Horde',races:['Skyborne']},c),true);assert.equal(C.matchesCharacter({classId:'mage'},c),false);assert.equal(C.matchesCharacter({faction:'Alliance'},c),false);
});
test('lowering level leaves all quest progress intact and checklist steps are reversible',()=>{
 const c=C.createCharacter({level:20}),q={id:'test',steps:['One','Two']};C.setDone(c,q,true);c.level=19;assert.equal(C.questDone(q,c),true);assert.equal(c.done['test:1'],true);C.setDone(c,q,false);assert.equal(C.questDone(q,c),false);assert.deepEqual(c.done,{});
});
test('skipping is separate from completion and preserves partial steps when restored',()=>{
 const c=C.createCharacter(),q={id:'skip-test',steps:['One','Two']};
 c.done['skip-test:0']=true;C.setSkipped(c,q,true);
 assert(C.questSkipped(q,c));assert.equal(C.questDone(q,c),false);
 assert.equal(c.done['skip-test:0'],true);
 C.setSkipped(c,q,false);assert.equal(C.questSkipped(q,c),false);
 assert.equal(C.questDone(q,c),false);assert.equal(c.done['skip-test:0'],true);
 C.setDone(c,q,true);C.setSkipped(c,q,true);
 assert.equal(C.questDone(q,c),false);assert.equal(c.done[q.id],undefined);
 C.setDone(c,q,true);assert.equal(C.questSkipped(q,c),false);assert(C.questDone(q,c));
});
test('skipped prerequisites never unlock follow-up quests',()=>{
 const Q=require('../quest-chains.js'),c=C.createCharacter(),first={id:'first',steps:['One','Two']},next={id:'next',requiresQuests:['first']};
 C.setSkipped(c,first,true);assert.equal(Q.available(next,c,[first,next],C.questDone),false);
 C.setDone(c,first,true);assert.equal(Q.available(next,c,[first,next],C.questDone),true);
});
test('backups retain per-character skips and the all-skipped view, including future tasks',()=>{
 const c=C.createCharacter({level:1}),alt=C.createCharacter({name:'Alt'});
 C.setSkipped(c,{id:'future-task'},true);c.filters.view='skipped';c.filters.categories=[];c.filters.activity='solo';
 const out=C.normalise(JSON.parse(JSON.stringify({schema:1,activeId:c.id,characters:[c,alt]})),catalog);
 assert.deepEqual(out.characters[0].skipped,{'future-task':true});assert.equal(out.characters[0].filters.view,'skipped');
 assert.deepEqual(out.characters[1].skipped,{});assert.equal(out.characters[0].done['future-task'],undefined);
 const legacy={...c};delete legacy.skipped;assert.deepEqual(C.normalise({schema:1,characters:[legacy]},catalog).characters[0].skipped,{});
 c.skipped={'valid-task':true,'<invalid>':true,'not-skipped':false};
 assert.deepEqual(C.normalise({schema:1,characters:[c]},catalog).characters[0].skipped,{'valid-task':true});
});
test('content ids are unique and every class has its own quest content',()=>{
 const contentContext={window:{}};vm.createContext(contentContext);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../content.js'),'utf8'),contentContext);const d=contentContext.window.GUIDE_CONTENT;
 const ids=[...d.quests,...d.misc,...d.dungeons,...d.zones,...d.professions,...d.glossary,...catalog.abilities,...d.dungeons.flatMap(x=>x.quests)].map(x=>x.id);assert.equal(new Set(ids).size,ids.length);
 for(const id of Object.keys(catalog.classes))assert(d.quests.some(q=>q.classId===id));
});
