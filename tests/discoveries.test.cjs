const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const C = require('../core.js'), Q = require('../quest-chains.js');
const V = require('../discoveries.js'), T = require('../guide-tools.js');
function guide() {
  const window = {};
  for (const f of ['catalog.js', 'content.js', 'zone-data.js', 'release-content.js', 'release07.js'])
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), {window});
  window.RELEASE_CONTENT.apply(window.GUIDE_CONTENT);
  window.RELEASE07.apply(window.GUIDE_CONTENT);
  V.apply(window.GUIDE_CONTENT);
  T.augment(window.GUIDE_CONTENT, window.GUIDE_EXTRA_ZONES);
  return window.GUIDE_CONTENT;
}
test('research updates are idempotent, preserve progress IDs and have no dangling or cyclic prerequisites', () => {
  const d = guide(), original = d.quests.find(q => q.id === 'shaman-air');
  const snapshot = JSON.stringify(d); V.apply(d);
  assert.equal(JSON.stringify(d), snapshot);
  assert.equal(d.quests.find(q => q.id === 'shaman-air'), original);
  const byId = new Map(d.quests.map(q => [q.id, q]));
  assert.equal(byId.size, d.quests.length);
  const zones = new Set(d.zones.map(z => z.id));
  function visit(id, parents = new Set()) {
    assert(!parents.has(id), 'cycle at ' + id);
    const q = byId.get(id); assert(q, 'missing prerequisite ' + id);
    for (const required of [...(q.requiresQuests || []), ...(q.requiresAny || [])])
      visit(required, new Set([...parents, id]));
  }
  for (const q of V.quests) {
    visit(q.id); assert(q.desc.en && q.desc.sv); assert(q.source.startsWith('https://'));
    for (const z of q.zoneIds) assert(zones.has(z), z);
  }
});
test('all nine races have a suggested gathering manual and a six-slot starter bag', () => {
  const d = guide();
  const expected = {
    Human: 'paxton-rodents', Dwarf: 'starter-mail-grelin', Gnome: 'starter-mail-grelin',
    'Night Elf': 'starter-woodland', Orc: 'starter-cactus', Troll: 'starter-cactus',
    Tauren: 'starter-humble', Undead: 'starter-marla', Skyborne: 'starter-windstones'
  };
  for (const [race, id] of Object.entries(expected)) {
    for (const faction of race === 'Skyborne' ? ['Alliance', 'Horde'] : [['Human', 'Dwarf', 'Gnome', 'Night Elf'].includes(race) ? 'Alliance' : 'Horde']) {
      const c = C.createCharacter({race, faction});
      const suggested = q => C.matchesCharacter(q, c) && V.suggestedFor(q, c, d.quests, C.questDone);
      assert.deepEqual([...d.quests.filter(q => q.gatheringBook && suggested(q)).map(q => q.id)], [id], race + ' / ' + faction);
      assert(d.quests.some(q => q.bagSlots === 6 && suggested(q)), race + ' bag');
    }
  }
});
test('starter recommendations follow zone visits and keep a started chain after travel', () => {
  const d = guide(), c = C.createCharacter({race: 'Dwarf', faction: 'Alliance'});
  const first = d.quests.find(q => q.id === 'paxton-nibbled'), next = d.quests.find(q => q.id === 'paxton-rodents');
  assert(!V.suggestedFor(first, c, d.quests, C.questDone));
  c.currentZone = 'zone-elwynn'; assert(V.suggestedFor(first, c, d.quests, C.questDone));
  C.setDone(c, first, true); c.currentZone = 'zone-dunmorogh';
  assert(V.suggestedFor(next, c, d.quests, C.questDone));
  C.setSkipped(c, first, true); assert(!Q.available(next, c, d.quests, C.questDone));
});
test('Paxton previews the actual bag and five-weapon choice while requiring each completed predecessor', () => {
  const d = guide(), c = C.createCharacter({race: 'Human', faction: 'Alliance'});
  const chain = d.quests.filter(q => q.id.startsWith('paxton-'));
  assert.equal(chain.length, 8);
  const rewards = Q.laterRewards(chain[0], c, d.quests, C.matchesCharacter, C.questDone);
  assert(rewards.some(q => q.bagSlots === 6));
  assert(rewards.some(q => q.id === 'paxton-rare'));
  for (let i = 0; i < chain.length; i++) {
    assert(Q.available(chain[i], c, d.quests, C.questDone));
    if (i + 1 < chain.length) {
      assert(!Q.available(chain[i + 1], c, d.quests, C.questDone));
      C.setSkipped(c, chain[i], true);
      assert(!Q.available(chain[i + 1], c, d.quests, C.questDone));
      C.setDone(c, chain[i], true);
    }
  }
  assert.equal(chain.at(-1).reward.split(' / ').length, 5);
});
test('Shaman chains use the proper faction handoffs and hide the other faction reward', () => {
  const d = guide();
  for (const faction of ['Alliance', 'Horde']) {
    const c = C.createCharacter({classId: 'shaman', faction}), ids = V.shamanChains[faction];
    C.setDone(c, d.quests.find(q => q.id === 'shaman-air'), true);
    for (const id of ids) {
      const q = d.quests.find(q => q.id === id);
      assert(C.matchesCharacter(q, c)); assert.equal(q.minLevel, 30);
      assert(Q.available(q, c, d.quests, C.questDone)); C.setDone(c, q, true);
    }
    assert.equal(ids.length, faction === 'Horde' ? 5 : 4);
    const final = d.quests.find(q => q.id === ids.at(-1));
    assert(final.reward.includes(faction === 'Alliance' ? 'Elementalist’s Guard' : 'Rune of the Storm'));
    assert(!final.reward.includes(faction === 'Alliance' ? 'Rune of the Storm' : 'Elementalist’s Guard'));
    assert(V.quests.filter(q => q.classId === 'shaman' && q.faction !== faction).every(q => !C.matchesCharacter(q, c)));
    const preview = Q.laterRewards(d.quests.find(q => q.id === 'shaman-air'), c, d.quests, C.matchesCharacter, () => false);
    assert.equal(preview.length, 1); assert.equal(preview[0].id, final.id);
  }
});
test('Dalaran accepts parallel initial quests, requires both paths before Blood, and shares dungeon progress', () => {
  const d = guide(), c = C.createCharacter({faction: 'Horde'}), byId = new Map(d.quests.map(q => [q.id, q]));
  const available = id => Q.available(byId.get(id), c, d.quests, C.questDone);
  assert(available('dalaran-access-h')); assert(available('dalaran-prison-h'));
  C.setDone(c, byId.get('dalaran-prison-h'), true);
  assert(available('dalaran-patrols-h')); C.setDone(c, byId.get('dalaran-patrols-h'), true);
  assert(!available('dalaran-blood-h')); C.setDone(c, byId.get('dalaran-access-h'), true);
  assert(available('dalaran-blood-h')); C.setDone(c, byId.get('dalaran-blood-h'), true);
  assert(available('dalaran-heart-h'));
  const dungeon = d.dungeons.find(q => q.id === 'dalaran');
  assert.equal(dungeon.level, 28); assert.equal(dungeon.minLevel, null);
  assert.equal(dungeon.quests.find(q => q.id === 'dalaran-heart-h'), byId.get('dalaran-heart-h'));
  assert.equal(dungeon.quests.find(q => q.id === 'dalaran-lyn'), byId.get('dalaran-lyn'));
  assert(!available('dalaran-lyn'));
  C.setDone(c, byId.get('dalaran-black-tome'), true); C.setDone(c, byId.get('dalaran-charge-tome'), true);
  assert(available('dalaran-lyn'));
});
test('book advice uses selected primary professions and states the skill and slot limits in both languages', () => {
  const c = C.createCharacter({professions: ['Skinning', 'Leatherworking', 'Cooking', 'Fishing', 'First Aid']});
  assert.match(V.bookAdvice(c, 'en'), /selected professions: Pelt Collecting for Beginners/);
  assert.match(V.bookAdvice(c, 'en'), /2 skill, capped at 15/);
  assert.match(V.bookAdvice(c, 'sv'), /2 skill, högst till 15/);
  assert.match(V.bookAdvice(c, 'sv'), /Två andra primary/);
  assert.match(V.bookAdvice({professions: ['Cooking']}, 'en'), /Mining for Dummies \/ Wild Harvest \/ Pelt Collecting/);
});
