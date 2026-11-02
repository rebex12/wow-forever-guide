const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const C = require('../core.js'), Q = require('../quest-chains.js');
const V = require('../discoveries.js'), F = require('../november-findings.js');
function guide() {
  const window = {};
  for (const name of ['catalog.js','content.js','zone-data.js','release-content.js','release07.js'])
    vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',name),'utf8'),{window});
  const d = window.GUIDE_CONTENT;
  window.RELEASE_CONTENT.apply(d); window.RELEASE07.apply(d); V.apply(d); F.apply(d);
  return d;
}
test('November findings integrate without duplicate quests and can be applied twice', () => {
  const d = guide(), snapshot = JSON.stringify(d);
  F.apply(d);
  assert.equal(JSON.stringify(d), snapshot);
  assert.equal(F.quests.length, 9);
  assert.equal(d.version, '0.7.11');
  assert.equal(new Set(d.quests.map(x=>x.id)).size, d.quests.length);
  const ids = new Set(d.quests.map(x=>x.id));
  for (const q of F.quests) {
    assert.equal(q.minLevel, 24);
    assert.equal(q.beta, true);
    assert(q.source.endsWith(String(q.questId)));
    assert(d.dungeons.find(x=>x.id===q.dungeonId).quests.some(x=>x.id===q.id));
    for (const prerequisite of q.requiresQuests || []) assert(ids.has(prerequisite));
  }
});
test('Titan Relic final rewards require faction-specific first stage', () => {
  const d=guide();
  for (const [faction, first, last, other] of [
    ['Horde','excavation-elder-knowledge','excavation-earthen-echo','excavation-prehistoric-prism'],
    ['Alliance','excavation-lost-relic-carry','excavation-prehistoric-prism','excavation-earthen-echo']
  ]) {
    const c=C.createCharacter({faction});
    const initial=d.quests.find(q=>q.id===first), final=d.quests.find(q=>q.id===last);
    assert(C.matchesCharacter(initial,c));
    assert(!Q.available(final,c,d.quests,C.questDone));
    assert(Q.laterRewards(initial,c,d.quests,C.matchesCharacter,C.questDone).some(q=>q.id===last));
    C.setDone(c,initial,true);
    assert(Q.available(final,c,d.quests,C.questDone));
    assert(!C.matchesCharacter(d.quests.find(q=>q.id===other),c));
  }
});
test('Dragonmaw Rumors gates Open the Maw; Dalaran reward quests have correct sides', () => {
  const d=guide(), h=C.createCharacter({faction:'Horde'}), a=C.createCharacter({faction:'Alliance'});
  const first=d.quests.find(q=>q.id==='excavation-dragonmaw-rumors');
  const next=d.quests.find(q=>q.id==='excavation-open-the-maw');
  assert(!Q.available(next,h,d.quests,C.questDone));
  C.setDone(h,first,true); assert(Q.available(next,h,d.quests,C.questDone));
  assert(!C.matchesCharacter(next,a));
  for (const [id,faction] of [['dalaran-green-sample','Alliance'],['dalaran-opportunistic-education','Horde']]) {
    const q=d.quests.find(x=>x.id===id);
    assert.equal(q.faction,faction);
    assert(q.highValue);
    assert(q.reward.en.includes('Choose:'));
  }
});
test('Cooking recipe is separately documented without distorting the main fish leveling route', () => {
  const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
  assert(app.includes('Recipe: Twice-Spiced Raptor Slice'));
  assert(app.includes('Raptor Flesh'));
  assert(app.includes('5% bonus experience'));
});