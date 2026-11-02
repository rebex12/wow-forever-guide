'use strict';
// Reviewed Questbound discoveries from the scheduled 2026-11-01 check.
// Beta data: quest levels, rewards and NPC positions may change at launch.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.NovemberFindings = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const version = '0.7.13', findingsVersion = '0.7.11', updated = '2026-11-02';
  const text = (en, sv) => ({en, sv});
  const source = id => 'https://www.wowhead.com/forever/quest=' + id;
  const quest = (id, questId, title, level, faction, dungeonId, zoneIds, location, en, sv, extra = {}) => ({
    id, questId, title, category: 'quests', level, minLevel: 24, faction,
    dungeonId, group: 'Dungeon', zoneIds, location,
    desc: text(en, sv), steps: [], source: source(questId),
    status: 'sourced', beta: true, updated, ...extra
  });
  const gearH = 'Choose: Heavehammer (2H mace, 27.7 DPS, +32 Attack Power) / Healer\'s Staff (+12 Stamina, 5 mana per 5 sec) / Furs of the Earthen Ring';
  const gearA = 'Choose: Heavehammer (2H mace, 27.7 DPS, +32 Attack Power) / Healer\'s Staff (+12 Stamina, 5 mana per 5 sec) / Explorer\'s League Dustcover';
  const quests = [
    quest('excavation-changing-tastes', 95697, 'Changing Tastes', 31, 'Horde', 'excavation',
      ['zone-orgrimmar', 'zone-wetlands'], 'Borstan · The Drag, Orgrimmar (57.5, 53.4)',
      'Before entering Excavation Site, accept this from Borstan. Collect four Thicket Raptor Meat inside. The Cooking recipe is guaranteed; the trinket is an optional reward choice.',
      'Hämta hos Borstan före Excavation Site. Samla fyra Thicket Raptor Meat i dungeonen. Cooking-receptet är garanterat; trinketen är ett valbart alternativ.',
      {highValue: true, reward: text('Recipe: Twice-Spiced Raptor Slice + 5 portions; choose Satchel of Potions (trinket) OR Serrated Raptor Claw',
        'Recipe: Twice-Spiced Raptor Slice + 5 portioner; välj Satchel of Potions (trinket) ELLER Serrated Raptor Claw')}),
    quest('excavation-elder-knowledge', 95664, 'Elder Knowledge', 31, 'Horde', 'excavation',
      ['zone-wetlands', 'zone-thunder-bluff'], 'Titan Relic · Relic Guardian, Excavation Site → Bashana Runetotem · Elder Rise, Thunder Bluff',
      'Loot the Titan Relic from the final boss Relic Guardian; it starts this quest. Deliver it in Thunder Bluff and take the follow-up for a valuable weapon or cloak.',
      'Loota Titan Relic från slutbossen Relic Guardian; föremålet startar questen. Lämna i Thunder Bluff och ta fortsättningen för ett värdefullt vapen eller en cloak.'),
    quest('excavation-earthen-echo', 98823, 'Earthen Echo', 31, 'Horde', 'excavation',
      ['zone-thunder-bluff', 'zone-mulgore'], 'Muln Earthfury · Skywatcher Plateau, northwest Mulgore',
      'After Elder Knowledge, bring the provided Titan Relic to Muln Earthfury. The relic should be supplied again on the follow-up (fixed in later beta notes).',
      'Efter Elder Knowledge: ta med Titan Relic till Muln Earthfury. Föremålet ska ges igen i fortsättningen (rättat enligt senare betanoteringar).',
      {requiresQuests: ['excavation-elder-knowledge'], highValue: true,
       reward: text(gearH, 'Välj: Heavehammer (tvåhandsmace, 27,7 DPS, +32 Attack Power) / Healer\'s Staff (+12 Stamina, 5 mana per 5 sek) / Furs of the Earthen Ring')}),
    quest('excavation-lost-relic-carry', 95810, 'Lost Relic Carry', 31, 'Alliance', 'excavation',
      ['zone-wetlands'], 'Titan Relic · Relic Guardian, Excavation Site → Prospector Whelgar · Wetlands',
      'Loot the Titan Relic from Relic Guardian before leaving the dungeon. It starts this quest. Deliver it to Prospector Whelgar to unlock Prehistoric Prism.',
      'Loota Titan Relic från Relic Guardian innan ni lämnar dungeonen. Föremålet startar questen. Lämna till Prospector Whelgar för att låsa upp Prehistoric Prism.'),
    quest('excavation-prehistoric-prism', 98824, 'Prehistoric Prism', 31, 'Alliance', 'excavation',
      ['zone-wetlands', 'zone-ironforge'], 'High Explorer Magellas · Hall of Explorers, Ironforge',
      'After Lost Relic Carry, deliver the provided Titan Relic to High Explorer Magellas in Ironforge. Choose between two weapons and the Alliance cloak.',
      'Efter Lost Relic Carry: lämna Titan Relic till High Explorer Magellas i Ironforge. Välj mellan två vapen och Alliances cloak.',
      {requiresQuests: ['excavation-lost-relic-carry'], highValue: true,
       reward: text(gearA, 'Välj: Heavehammer (tvåhandsmace, 27,7 DPS, +32 Attack Power) / Healer\'s Staff (+12 Stamina, 5 mana per 5 sek) / Explorer\'s League Dustcover')}),
    quest('excavation-dragonmaw-rumors', 95663, 'Dragonmaw Rumors', 31, 'Horde', 'excavation',
      ['zone-arathi-highlands', 'zone-wetlands'], 'Zaruk · Hammerfall, Arathi Highlands (74.4, 35.6)',
      'Easy to miss: accept this in Hammerfall BEFORE travelling to Excavation Site. Meet the Deathstalker Agent in Wetlands above the Dragonmaw camp (about 51.4, 59.2) to unlock Open the Maw.',
      'Lätt att missa: hämta i Hammerfall INNAN resan till Excavation Site. Möt Deathstalker Agent i Wetlands ovanför Dragonmaw-lägret (cirka 51.4, 59.2) för att låsa upp Open the Maw.',
      {highValue: true, reward: text('Unlocks Open the Maw and its reward choices.', 'Låser upp Open the Maw och dess belöningsval.')}),
    quest('excavation-open-the-maw', 95682, 'Open the Maw', 31, 'Horde', 'excavation',
      ['zone-wetlands'], 'Deathstalker Agent · Wetlands, above Dragonmaw camp (about 51.4, 59.2)',
      'Requires completed Dragonmaw Rumors. In the dungeon kill 2 Dragonmaw Saboteurs, 4 Dragonmaw Warders, and collect Dragonmaw Dispatch.',
      'Kräver klar Dragonmaw Rumors. Besegra 2 Dragonmaw Saboteurs och 4 Dragonmaw Warders i dungeonen samt samla Dragonmaw Dispatch.',
      {requiresQuests: ['excavation-dragonmaw-rumors'], highValue: true,
       reward: text('Choose: Knife-Polishing Rag / Dirt-Heavy Bracers; also receive Bloody Map.',
         'Välj: Knife-Polishing Rag / Dirt-Heavy Bracers; du får också Bloody Map.')}),
    quest('dalaran-green-sample', 92456, 'A Green Sample', 33, 'Alliance', 'dalaran',
      ['zone-stormwind-city', 'zone-alterac-mountains'], 'Shylamiir · The Park, Stormwind (31.3, 62.9)',
      'Pick up before entering the City of Dalaran. Collect one Fel Infused Blossom in the central garden. You still need to arrange dungeon access through the faction access chain.',
      'Hämta före City of Dalaran. Samla en Fel Infused Blossom i den centrala trädgården. Du behöver även ordna tillträde via factionskedjan.',
      {highValue: true, reward: text('Choose: Vine Pruner\'s Cloak / Thorn Protecting Girdle',
        'Välj: Vine Pruner\'s Cloak / Thorn Protecting Girdle')}),
    quest('dalaran-opportunistic-education', 96987, 'Opportunistic Education', 33, 'Horde', 'dalaran',
      ['zone-alterac-mountains'], 'Rexxie Copperclutch · by the City of Dalaran sewer entrance',
      'Accept near the dungeon entrance, then recover The Founding of Dalaran from inside the city. Arrange sewer access through the faction access chain before entering.',
      'Hämta nära dungeoningången och leta upp The Founding of Dalaran inne i staden. Ordna tillträde via factionskedjan innan ni går in.',
      {highValue: true, reward: text('Choose: Solid Gold Band (ring) / Larcenist\'s Belt',
        'Välj: Solid Gold Band (ring) / Larcenist\'s Belt')})
  ];
  function apply(data) {
    if (data.novemberFindingsVersion === version) return data;
    const byId = new Map(data.quests.map(q => [q.id, q]));
    for (const authored of quests) {
      const q = JSON.parse(JSON.stringify(authored));
      if (byId.has(q.id)) Object.assign(byId.get(q.id), q);
      else { data.quests.push(q); byId.set(q.id, q); }
      const dungeon = data.dungeons.find(d => d.id === q.dungeonId);
      if (dungeon && !dungeon.quests.some(item => item.id === q.id)) dungeon.quests.push(byId.get(q.id));
    }
    const excavation = data.dungeons.find(d => d.id === 'excavation');
    if (excavation) {
      const note = excavation.note || text('', '');
      excavation.note = text(
        (note.en || '') + ' Before your run: Horde should pick up Changing Tastes from Borstan and complete Dragonmaw Rumors from Zaruk in Hammerfall. Both factions should loot Titan Relic from Relic Guardian to start the faction-specific weapon chain.',
        (note.sv || '') + ' Före besöket: Horde bör hämta Changing Tastes hos Borstan och klara Dragonmaw Rumors från Zaruk i Hammerfall. Båda factions bör loota Titan Relic från Relic Guardian för den factionspecifika vapenkedjan.');
    }
    const dalaran = data.dungeons.find(d => d.id === 'dalaran');
    if (dalaran) {
      const note = dalaran.note || text('', '');
      dalaran.note = text((note.en || '') + ' Additional quest: Alliance picks up A Green Sample in Stormwind; Horde picks up Opportunistic Education at the sewer entrance.',
        (note.sv || '') + ' Extra quest: Alliance hämtar A Green Sample i Stormwind; Horde hämtar Opportunistic Education vid kloakingången.');
    }
    data.changelog.unshift({version: findingsVersion, date: updated, text: text(
      'Added Changing Tastes and its Cooking recipe, both Titan Relic weapon chains, the mandatory Dragonmaw Rumors prerequisite, and faction-specific City of Dalaran reward quests (beta-sourced).',
      'Lagt till Changing Tastes och Cooking-receptet, båda Titan Relic-vapenkedjorna, Dragonmaw Rumors som förkrav samt factionspecifika belöningsquests i City of Dalaran (betakällor).')});
    data.changelog.unshift({version: '0.7.12', date: updated, text: text(
      'Regression audit: restored full-app test coverage and fixed the Cooking reward source link when source links are disabled. Added automated Chrome smoke tests for desktop and mobile.',
      'Regressionskontroll: återställd täckning för hela appen och rättad Cooking-belöningslänk när källänkar är avstängda. Automatiska Chrome-tester för desktop och mobil har lagts till.')});
    data.changelog.unshift({version, date: updated, text: text(
      'Added compact level controls to the header on all configured character pages except Overview, with direct input, +/- buttons, 1–60 limits and immediate saving and refresh.',
      'Lagt till kompakt levelkontroll i sidhuvudet på alla karaktärssidor utom Overview, med direktinmatning, +/- knappar, gränser 1–60 och omedelbar sparning och uppdatering.')});
    data.novemberFindingsVersion = version;
    data.version = version;
    data.updated = updated;
    return data;
  }
  return {version, updated, quests, apply};
});