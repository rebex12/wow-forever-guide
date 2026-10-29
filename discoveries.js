'use strict';
// Reviewed findings from the 28–29 October research runs. Quest IDs remain stable
// so checklists, skipped tasks and backups continue to refer to the same activity.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Discoveries = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const version = '0.7.10', updated = '2026-10-29';
  const text = (en, sv) => ({en, sv});
  const sources = {
    beginner: 'https://news.blizzard.com/en-us/article/24315280/new-players-starter-guide-welcome-to-world-of-warcraft-forever',
    bags: 'https://www.wowhead.com/classic/news/grab-free-bags-in-beginner-zones-with-quests-382982',
    starterBags: 'https://www.method.gg/wow-forever/best-early-bags-in-wow-forever-crafted-bags-quest-bags-vendor-bags-and-more',
    miningBook: 'https://www.wowhead.com/forever/item=247840/mining-for-dummies',
    shaman: 'https://www.wowhead.com/forever/news/unlock-powerful-weapons-with-level-30-shaman-quest-in-wow-forever-383290',
    dalaran: 'https://www.wowhead.com/forever/guide/city-of-dalaran-dungeon-overview-location-rewards',
    lyn: 'https://www.wowhead.com/news/how-to-find-the-secret-boss-in-the-city-of-dalaran-dungeon-in-wow-forever-383366',
    racials: 'https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-26/2360696/1'
  };
  const questSource = id => 'https://www.wowhead.com/forever/quest=' + id;
  const bookChoices = [
    {profession: 'Mining', title: 'Mining for Dummies', itemId: 247840},
    {profession: 'Herbalism', title: 'Wild Harvest', itemId: 247841},
    {profession: 'Skinning', title: 'Pelt Collecting for Beginners', itemId: 247846}
  ];
  function quest(id, title, level, zoneIds, location, en, sv, extra = {}) {
    return {id, title, category: 'quests', level, minLevel: 1, zoneIds, location,
      desc: text(en, sv), steps: [], status: 'sourced', beta: true, updated, ...extra};
  }
  function book(extra = {}) {
    return {gatheringBook: true, highValue: true,
      reward: text('Choose one: Mining for Dummies / Wild Harvest / Pelt Collecting for Beginners',
        'Välj en: Mining for Dummies / Wild Harvest / Pelt Collecting for Beginners'), ...extra};
  }
  const quests = [];
  const paxton = [
    ['nibbled', 91741, 'Nibbled-On Book', 2, 'Northshire kobolds → Brother Paxton · Northshire Abbey',
      'Loot the quest-starting book from Northshire kobolds and return it to Paxton. This chain leads to a profession book, a free bag and a weapon choice.',
      'Loota startboken från kobolder i Northshire och lämna den till Paxton. Kedjan leder till en professionsbok, en gratis väska och ett vapenval.'],
    ['rodents', 91743, 'Rascally Rodents', 2, 'Brother Paxton · Northshire Abbey',
      'Recover 8 Stolen Books from Northshire kobolds. Choose the manual for the gathering profession you want.',
      'Samla 8 Stolen Book från kobolder i Northshire. Välj manualen för den gathering-profession du vill ha.'],
    ['consultant', 91745, 'Mining Consultant', 3, 'Brother Paxton → Kelsey Fargo · Echo Ridge Mine',
      'Talk to Kelsey Fargo outside Echo Ridge Mine about the stolen books.',
      'Prata med Kelsey Fargo utanför Echo Ridge Mine om de stulna böckerna.'],
    ['picture', 91752, 'The Big Picture', 4, 'Kelsey Fargo · Echo Ridge Mine → Marshal McBride',
      'Recover Shinyfinder Narf’s sack of books in the mine and take it to McBride inside the abbey. Bring help for the elite if needed.',
      'Hämta Shinyfinder Narfs säck med böcker i gruvan och lämna den till McBride inne i klostret. Ta hjälp med eliten vid behov.'],
    ['follow', 91758, 'Follow That Kobold!', 4, 'Marshal McBride → Tordrin Sternblade · abbey stables',
      'Speak to the Hunter trainer behind Northshire Abbey, near the stable. All classes can follow this investigation.',
      'Prata med Hunter-tränaren bakom Northshire Abbey, vid stallet. Alla klasser kan följa utredningen.'],
    ['tracking', 91772, "Shhh! We're Hunting Kobolds", 4, 'Tordrin Sternblade → Marshal Dughan · Goldshire',
      'Use the supplied Kobold Tracking Kit, follow six tracks toward Goldshire and report to Dughan.',
      'Använd Kobold Tracking Kit, följ sex spår mot Goldshire och rapportera till Dughan.'],
    ['return', 91775, 'Book Return', 6, 'Marshal Dughan · Goldshire → Fargodeep Mine',
      'Recover 6 Lost Books and Fun with Elementals in Fargodeep Mine. Bring a friend for the dangerous mine depths.',
      'Hämta 6 Lost Book och Fun with Elementals i Fargodeep Mine. Ta med en vän till de farliga delarna av gruvan.'],
    ['rare', 91777, 'Rare Books', 7, 'Marshal Dughan · Goldshire → Jasperlode Mine → Brother Paxton',
      'Recover both named books from Mother Fang and Geosculptor Yip in Jasperlode Mine, then return to Paxton. Elite targets and summoned adds make a group useful.',
      'Hämta de två böckerna från Mother Fang och Geosculptor Yip i Jasperlode Mine och återvänd till Paxton. Eliter och framkallade fiender gör en grupp användbar.']
  ];
  paxton.forEach(([key, questId, title, level, location, en, sv], i) => {
    const q = quest('paxton-' + key, title, level, ['zone-elwynn'], location, en, sv,
      {questId, faction: 'Alliance', starterRaces: ['Human'], source: questSource(questId),
        requiresQuests: i ? ['paxton-' + paxton[i - 1][0]] : []});
    if (key === 'rodents') Object.assign(q, book());
    if (['picture', 'return', 'rare'].includes(key)) q.group = 'Elite';
    if (key === 'return') Object.assign(q, {bagSlots: 6, highValue: true, reward: text('Book Bag · 6 slots', 'Book Bag · 6 platser')});
    if (key === 'rare') Object.assign(q, {highValue: true, rewardKind: 'weapon',
      reward: "Apprentice's Spellstaff / Militia Shortblade / Militia Sword / Northshire Hammer / Militia Bow"});
    quests.push(q);
  });
  quests.push(
    quest('starter-mail-sten', 'Coldridge Valley Mail Delivery · Sten → Talin', 3, ['zone-dunmorogh'], 'Sten Stoutarm → Talin Keeneye · Coldridge Valley',
      'Take Sten’s letters to Talin. His follow-up delivery rewards a gathering manual.',
      'Lämna Stens brev till Talin. Hans fortsättningsquest ger en gathering-manual.',
      {questId: 233, faction: 'Alliance', starterRaces: ['Dwarf', 'Gnome'], source: questSource(233)}),
    quest('starter-mail-grelin', 'Coldridge Valley Mail Delivery · Talin → Grelin', 4, ['zone-dunmorogh'], 'Talin Keeneye → Grelin Whitebeard · Coldridge Valley',
      'Deliver Talin’s letter to Grelin and choose one profession book. This is the second mail delivery.',
      'Lämna Talins brev till Grelin och välj en professionsbok. Detta är den andra brevleveransen.',
      book({questId: 234, faction: 'Alliance', starterRaces: ['Dwarf', 'Gnome'], requiresQuests: ['starter-mail-sten'], source: questSource(234)})),
    quest('starter-woodland', 'The Woodland Protector', 1, ['zone-teldrassil'], 'Melithar Staghelm → Tarindrella · Shadowglen',
      'Find Tarindrella southwest of Aldrassil for a choice of gathering manual. Do not confuse this introduction with the later quest of the same name.',
      'Hitta Tarindrella sydväst om Aldrassil och välj en gathering-manual. Blanda inte ihop introduktionen med den senare questen med samma namn.',
      book({questId: 458, faction: 'Alliance', starterRaces: ['Night Elf'], source: questSource(458)})),
    quest('starter-cactus', "Galgar's Cactus Apple Surprise", 3, ['zone-durotar'], 'Galgar · Valley of Trials',
      'Bring Galgar 10 Cactus Apples for food and a gathering manual. Follow the opening Valley of Trials quests if it is not offered yet.',
      'Lämna 10 Cactus Apple till Galgar för mat och en gathering-manual. Följ startquestsen i Valley of Trials om den ännu inte erbjuds.',
      book({questId: 4402, faction: 'Horde', starterRaces: ['Orc', 'Troll'], source: questSource(4402)})),
    quest('starter-humble', 'A Humble Task', 2, ['zone-mulgore'], 'Chief Hawkwind → Greatmother Hawkwind · Camp Narache',
      'Find Greatmother Hawkwind by the well southeast of Camp Narache. This first task rewards the manual choice.',
      'Hitta Greatmother Hawkwind vid brunnen sydost om Camp Narache. Den första delen ger valet av manual.',
      book({questId: 752, faction: 'Horde', starterRaces: ['Tauren'], source: questSource(752)})),
    quest('starter-damned', 'The Damned', 2, ['zone-tirisfal'], 'Novice Elreth · Deathknell',
      'Complete Elreth’s wings-and-pelts task to unlock Marla’s Last Wish at level 3.',
      'Gör Elreths uppgift med vingar och pälsar för att låsa upp Marla’s Last Wish vid level 3.',
      {questId: 376, faction: 'Horde', starterRaces: ['Undead'], source: questSource(376)}),
    quest('starter-marla', "Marla's Last Wish", 5, ['zone-tirisfal'], 'Novice Elreth · Deathknell',
      'After The Damned, defeat Samuel Fipps, bury his remains at Marla’s grave and return to Elreth. Available from level 3.',
      'Efter The Damned: besegra Samuel Fipps, begrav hans kvarlevor vid Marlas grav och återvänd till Elreth. Tillgänglig från level 3.',
      book({questId: 6395, minLevel: 3, faction: 'Horde', starterRaces: ['Undead'], requiresQuests: ['starter-damned'], source: questSource(6395)})),
    quest('starter-windstones', 'Harvesting Windstones', 4, ['zone-zephras'], 'Dalia the Collector · Thendal Grove, Zephras Isle',
      'Collect 15 Windstone Clusters from Raw Windstones. Choose a gathering book; the quest also gives 3 Windstones. Follow the local opening quests first.',
      'Samla 15 Windstone Cluster från Raw Windstones. Välj en gathering-bok; questen ger även 3 Windstone. Följ först de lokala startquestsen.',
      book({questId: 93552, minLevel: 2, races: ['Skyborne'], starterRaces: ['Skyborne'], source: questSource(93552)}))
  );
  const bags = [
    ['grund', 97277, 'Grund and Gozwin', 6, 4, 'Alliance', ['Dwarf', 'Gnome'], 'zone-dunmorogh', 'Grund Drokda · Anvilmar', 'Canvas Latchbag',
      'Recover Gozwin’s Mechanic’s Log and defeat the Snow Leopard Prowler at the camp in the northwestern hills.',
      'Hämta Gozwin’s Mechanic’s Log och besegra Snow Leopard Prowler vid lägret i kullarna åt nordväst.'],
    ['grace', 95805, "Grace of An'she and Mu'sha", 4, 1, 'Horde', ['Tauren'], 'zone-mulgore', 'Seer Graytongue → Ritual Fire · southeastern hills', 'Scorched Leather Pouch',
      'Carry the incense to the shrine within ten minutes. Keep it out of the water.',
      'Bär rökelsen till helgedomen inom tio minuter. Håll den borta från vatten.'],
    ['weight', 791, 'Carry Your Weight', 7, 4, 'Horde', ['Orc', 'Troll'], 'zone-durotar', 'Furl Scornbrow · Razor Hill watchtower', 'Handmade Leather Bag',
      'Collect 8 Canvas Scraps while fighting the human or centaur enemies in Durotar, then return to Furl.',
      'Samla 8 Canvas Scrap från människorna eller kentaurerna i Durotar och återvänd till Furl.']
  ];
  for (const [key, questId, title, level, minLevel, faction, starterRaces, zone, location, reward, en, sv] of bags)
    quests.push(quest('starter-bag-' + key, title, level, [zone], location, en, sv,
      {questId, minLevel, faction, starterRaces, source: questSource(questId), highValue: true, bagSlots: 6, reward: text(reward + ' · 6 slots', reward + ' · 6 platser')}));
  quests.push(
    quest('starter-bag-saber', 'Soft Saber Pelts', 4, ['zone-teldrassil'], 'Aldia · Teldrassil',
      'Check Aldia’s quest near 55.4, 57.2 for a guaranteed early bag.',
      'Hämta Aldias quest nära 55.4, 57.2 för en garanterad tidig väska.',
      {minLevel: 4, faction: 'Alliance', starterRaces: ['Night Elf'], source: sources.starterBags, highValue: true, bagSlots: 6,
        reward: text('Soft Saber Sack · 6 slots', 'Soft Saber Sack · 6 platser')}),
    quest('starter-bag-sticks', 'Sticks and Bones', 4, ['zone-tirisfal'], 'Deathguard Bartholomew · Tirisfal Glades',
      'Check Bartholomew’s quest near 58.4, 51.4 for a guaranteed early bag.',
      'Hämta Bartholomews quest nära 58.4, 51.4 för en garanterad tidig väska.',
      {minLevel: 4, faction: 'Horde', starterRaces: ['Undead'], source: sources.starterBags, highValue: true, bagSlots: 6,
        reward: text('Collecting Basket · 6 slots', 'Collecting Basket · 6 platser')})
  );

  const weaponReward = "Lightning's Grasp / Tidebringer's Claw / Rage of the Storm";
  const shamanChains = {};
  for (const faction of ['Alliance', 'Horde']) {
    const side = faction === 'Alliance' ? 'a' : 'h';
    const alliance = side === 'a';
    const ids = alliance ? [96264, 79358, 96135, 96016] : [79360, 79364, 79361, 79366, 79442];
    const titles = ['Elemental Aid', ...(alliance ? [] : ['Eyes on the Sky']), 'Storm, Earth, and Fire', 'Heed My Call', "The Tempest's Weapons"];
    let previous = 'shaman-air';
    shamanChains[faction] = [];
    titles.forEach((title, i) => {
      const questId = ids[i], id = 'shaman-tempest-' + side + '-' + questId;
      const extra = {questId, minLevel: 30, faction, classId: 'shaman', source: questSource(questId), requiresQuests: [previous]};
      let level = 30, zoneIds = ['zone-thousand-needles'], location = alliance ? 'Veyric Thunderhame · Arathi Highlands' : 'Rau Cliffrunner / Prate Cloudseer · Thousand Needles';
      let en, sv;
      if (title === 'Elemental Aid') {
        zoneIds = ['zone-barrens', alliance ? 'zone-arathi-highlands' : 'zone-thousand-needles'];
        extra.group = 'Dungeon'; extra.dungeonId = 'rfk';
        en = 'After Call of Air, defeat Charlga Razorflank in Razorfen Kraul and loot the Tattered Note. The later reward is a choice of three weapons.';
        sv = 'Efter Call of Air: besegra Charlga Razorflank i Razorfen Kraul och loota Tattered Note. Senare väntar ett val mellan tre vapen.';
      } else if (title === 'Eyes on the Sky') {
        en = 'Follow the Horde handoff to Prate Cloudseer in Thousand Needles. This extra stage comes before collecting the totems.';
        sv = 'Följ Hordes överlämning till Prate Cloudseer i Thousand Needles. Denna extra del kommer före insamlingen av totems.';
      } else if (title === 'Storm, Earth, and Fire') {
        level = 35; zoneIds = ['zone-dustwallow-marsh', 'zone-desolace', 'zone-swamp-of-sorrows', 'zone-badlands'];
        en = 'Collect 5 of each Twisted Totem: Water from Mirefin murlocs in Dustwallow, Air from Maraudine centaur in Desolace, Earth from Lost Ones in Swamp of Sorrows and Fire from Dustbelcher ogres in Badlands. Enemies can be much higher than level 30.';
        sv = 'Samla 5 av varje Twisted Totem: Water från Mirefin-murlocs i Dustwallow, Air från Maraudine-kentaurer i Desolace, Earth från Lost Ones i Swamp of Sorrows och Fire från Dustbelcher-ogrer i Badlands. Fienderna kan vara långt över level 30.';
      } else if (title === 'Heed My Call') {
        level = 40; extra.group = 'Elite';
        en = 'Use the Corrupted Totems at the steam pools in Thousand Needles, survive the ritual encounter and loot the Eye of the Tempest. Plan a group for the roughly level-40 enemies; this is not a routine solo task at 30.';
        sv = 'Använd Corrupted Totems vid ångbassängerna i Thousand Needles, klara ritualstriden och loota Eye of the Tempest. Planera en grupp för fienderna runt level 40; detta är ingen vanlig soloquest vid 30.';
      } else {
        level = 40; zoneIds = ['zone-alterac-mountains']; location = "Bath'rah the Windwatcher · Alterac Mountains";
        en = 'Deliver the Eye of the Tempest to Bath’rah and choose one weapon. Compare it with your role and weapon skills.';
        sv = 'Lämna Eye of the Tempest till Bath’rah och välj ett vapen. Jämför med din roll och dina vapenfärdigheter.';
        Object.assign(extra, {highValue: true, rewardKind: 'weapon', reward: weaponReward + (alliance ? ' + Elementalist’s Guard' : ' + Rune of the Storm')});
      }
      quests.push(quest(id, title, level, zoneIds, location, en, sv, extra));
      shamanChains[faction].push(id); previous = id;
    });
  }

  const levelCaution = text('Beta references disagree on quest minimums. Plan this access preparation around level 30; this is not a confirmed dungeon entry minimum.',
    'Betakällor anger olika questkrav. Planera förberedelsen runt level 30; detta är inte en bekräftad lägsta inträdeslevel till dungeonen.');
  const access = {minLevel: null, status: 'preliminary', caution: levelCaution, source: sources.dalaran};
  quests.push(
    quest('dalaran-patrols-h', 'Dalaran Patrols', 30, ['zone-hillsbrad', 'zone-alterac-mountains'], 'Magus Wordeen Voidglare · Tarren Mill',
      'After Prison Break In, defeat 6 Dalaran Summoners and 12 Elemental Slaves. Keep Key to the City moving in parallel.',
      'Efter Prison Break In: besegra 6 Dalaran Summoner och 12 Elemental Slave. Fortsätt också med Key to the City.',
      {...access, faction: 'Horde', requiresQuests: ['dalaran-prison-h']}),
    quest('dalaran-blood-h', 'Blood in the Streets', 30, ['zone-hillsbrad', 'zone-alterac-mountains', 'zone-silverpine'], 'Magus Wordeen Voidglare → Image of Archmage Modera · Lordamere Lake',
      'Finish Key to the City and Dalaran Patrols, then take the Grimy Key along the lake to Modera by the sewer entrance. Keeper Bel’varil’s separate quests are not part of this prerequisite set.',
      'Gör klart Key to the City och Dalaran Patrols. Ta sedan Grimy Key längs sjön till Modera vid kloakingången. Keeper Bel’varils separata quests ingår inte i dessa förkrav.',
      {...access, faction: 'Horde', requiresQuests: ['dalaran-access-h', 'dalaran-patrols-h']})
  );
  for (const faction of ['Alliance', 'Horde']) {
    const side = faction === 'Alliance' ? 'a' : 'h';
    quests.push(quest('dalaran-heart-' + side, 'Heart of Disruption', 30, ['zone-alterac-mountains', 'zone-silverpine'], 'Image of Archmage Modera · Dalaran sewer entrance',
      'Accept the quest and check your keyring for the Dalaran Sewer Key before entering. Inside, recover the Arcane Mote. The key is supplied for the run; finishing the dungeon is not a prerequisite for getting it.',
      'Hämta questen och kontrollera Dalaran Sewer Key i nyckelringen innan ni går in. Hämta Arcane Mote inne i dungeonen. Nyckeln ges inför besöket; dungeonen behöver inte klaras först.',
      {...access, faction, group: 'Dungeon', dungeonId: 'dalaran', highValue: true,
        requiresQuests: [side === 'a' ? 'dalaran-access-a' : 'dalaran-blood-h'],
        reward: text('On acceptance: Dalaran Sewer Key · group access through the gate', 'Vid hämtning: Dalaran Sewer Key · gruppen kan passera porten')}));
  }
  quests.push(
    quest('dalaran-black-tome', 'Black Tome · prepare for Lyn the Ignored', 25, ['zone-silverpine'], 'Archmage Arugal’s table · Shadowfang Keep',
      'After defeating Arugal, click the book on his table. Keep the Black Tome for the optional City of Dalaran boss.',
      'Klicka på boken på Arugals bord när han besegrats. Spara Black Tome till den valfria bossen i City of Dalaran.',
      {minLevel: null, group: 'Dungeon', dungeonId: 'sfk', source: sources.lyn}),
    quest('dalaran-charge-tome', 'Tome of Dalaran · Ambermill Leyline Focus', 28, ['zone-silverpine'], 'Ambermill town hall · Silverpine Forest',
      'Use the Black Tome beside the Ambermill Leyline Focus to create the Tome of Dalaran.',
      'Använd Black Tome vid Ambermill Leyline Focus för att skapa Tome of Dalaran.',
      {minLevel: null, requiresQuests: ['dalaran-black-tome'], source: sources.lyn}),
    quest('dalaran-lyn', 'Lyn the Ignored · optional secret boss', 30, ['zone-alterac-mountains'], 'Purple sewer rune beyond Atrexis · City of Dalaran',
      'Defeat Atrexis, then continue straight through the sewer rather than turning toward the surface. Use the Tome of Dalaran at the purple rune. The tome is reusable with a three-minute cooldown.',
      'Besegra Atrexis och fortsätt rakt genom kloaken i stället för att svänga mot ytan. Använd Tome of Dalaran vid den lila runan. Boken kan återanvändas efter tre minuter.',
      {minLevel: null, group: 'Dungeon', dungeonId: 'dalaran', requiresQuests: ['dalaran-charge-tome'], source: sources.lyn,
        highValue: true, reward: text('Additional boss loot: Cartilage Shapers / Bonepile Gaze / Tendonscraper Dagger (possible drops)',
          'Extra bossloot: Cartilage Shapers / Bonepile Gaze / Tendonscraper Dagger (möjliga drops)')})
  );
  const glossary = [
    {id: 'term-experience-preset', title: 'Experience Preset · Classic / Enhanced',
      desc: text('Classic starts with SD visuals and fewer quest aids. Enhanced enables HD visuals, quest markers and One-Bag. Change individual settings later under Game Menu → Options.',
        'Classic börjar med SD-grafik och färre questhjälpmedel. Enhanced aktiverar HD-grafik, questmarkeringar och One-Bag. Ändra enskilda inställningar senare under Game Menu → Options.')},
    {id: 'term-ruleset-friends', title: text('Play with friends · Ruleset and faction', 'Spela med vänner · Ruleset och faction'),
      desc: text('Choose the same Ruleset and faction before creating characters. Both must match to group, join the same guild and run dungeons together.',
        'Välj samma Ruleset och faction innan ni skapar karaktärer. Båda måste stämma för att bilda grupp, gå med i samma guild och köra dungeons tillsammans.')}
  ].map(q => ({...q, category: 'glossary', source: sources.beginner, status: 'sourced', updated}));
  const misc = [
    {id: 'racial-tauren-running', races: ['Tauren'], title: 'Plainsrunning',
      desc: text('Up to 60% movement speed at full stacks. Does not increase mounted speed.',
        'Upp till 60 % rörelsehastighet vid fulla stacks. Ökar inte hastigheten på mount.')},
    {id: 'racial-skyborne-charged', races: ['Skyborne'], faction: 'Horde', title: 'Skysight · Charged',
      desc: text('Skysight: 15% speed for 15 seconds; 30% while Charged. Use it at an elemental convergence for Charged (1 hour, survives death, removed in raids). The speed boost still lasts 15 seconds.',
        'Skysight: 15 % fart i 15 sekunder; 30 % med Charged. Använd vid elemental convergence för Charged (1 timme, kvar efter död, tas bort i raids). Fartökningen varar fortfarande bara 15 sekunder.')},
    {id: 'racial-skyborne-attuned', races: ['Skyborne'], faction: 'Alliance', title: 'Read Leyline · Attuned',
      desc: text('Read Leyline: +50% health/mana regeneration for 15 seconds; +100% while Attuned. Use at a Ley Line for Attuned (1 hour, survives death, removed in raids). The regeneration boost still lasts 15 seconds.',
        'Read Leyline: +50 % hälso-/manaregenerering i 15 sekunder; +100 % med Attuned. Använd vid Ley Line för Attuned (1 timme, kvar efter död, tas bort i raids). Regenereringsökningen varar fortfarande bara 15 sekunder.')}
  ].map(q => ({...q, category: 'tips', level: 1, steps: [], source: sources.racials, beta: true, status: 'sourced', updated}));

  function apply(data) {
    if (data.discoveriesVersion === version) return data;
    const byId = new Map(data.quests.map(q => [q.id, q]));
    for (const authored of quests) {
      const q = JSON.parse(JSON.stringify(authored));
      if (byId.has(q.id)) Object.assign(byId.get(q.id), q);
      else { data.quests.push(q); byId.set(q.id, q); }
    }
    const air = byId.get('shaman-air');
    if (air) Object.assign(air, {minLevel: 30, beta: true, updated, source: sources.shaman,
      desc: text('Complete your faction’s Call of Air with the class trainer. The follow-up weapon chain starts at 30, but its later fights reach about level 40.',
        'Gör din factions Call of Air via klasstränaren. Vapenfortsättningen börjar vid 30, men de senare striderna är runt level 40.'),
      reward: 'Air Totem', status: 'sourced'});
    for (const id of ['dalaran-access-a', 'dalaran-access-h', 'dalaran-prison-h']) {
      const q = byId.get(id);
      if (q) Object.assign(q, access, {level: 30, updated, beta: true});
    }
    // Prison Break In and Key to the City are parallel starting quests, not a serial chain.
    const prison = byId.get('dalaran-prison-h');
    if (prison) { prison.title = 'Prison Break In'; prison.requiresQuests = []; }
    const key = byId.get('dalaran-access-h');
    if (key) key.desc = text('Pick up Key to the City and Prison Break In from Wordeen in parallel. Recover the Grimy Key and the required artifacts before the later patrol and sewer-access handoffs.',
      'Hämta Key to the City och Prison Break In från Wordeen parallellt. Samla Grimy Key och artefakterna inför patrullquesten och vägen till kloaken.');
    const prideclaws = byId.get('zephras-prideclaws');
    if (prideclaws) Object.assign(prideclaws, {bagSlots: 6, beta: true, updated,
      reward: text('Simple Leather Satchel · 6 slots', 'Simple Leather Satchel · 6 platser')});
    // Reuse the same object in both lists: one completion/skip state per activity.
    for (const q of byId.values()) if (q.dungeonId) {
      const dungeon = data.dungeons.find(d => d.id === q.dungeonId);
      if (dungeon && !dungeon.quests.some(item => item.id === q.id)) dungeon.quests.push(q);
    }
    const dalaran = data.dungeons.find(d => d.id === 'dalaran');
    if (dalaran) Object.assign(dalaran, {minLevel: null, updated,
      note: text('Published recommended range: 28–33. A hard entry minimum is unconfirmed; access-quest references differ. Plan preparation around 30. Horde follows Wordeen’s chain; Alliance starts An Alarming Request. Heart of Disruption supplies the key when accepted. One keyholder can open the gate for the group. Prepare the Tome of Dalaran for optional Lyn.',
        'Publicerat rekommenderat intervall: 28–33. Hård inträdesgräns är obekräftad och källor anger olika questkrav. Planera förberedelser runt 30. Horde följer Wordeens kedja; Alliance börjar med An Alarming Request. Heart of Disruption ger nyckeln när den hämtas. En nyckelbärare kan öppna porten för gruppen. Förbered Tome of Dalaran för valfria Lyn.')});
    for (const q of glossary) if (!data.glossary.some(item => item.id === q.id)) data.glossary.unshift(JSON.parse(JSON.stringify(q)));
    for (const q of misc) if (!data.misc.some(item => item.id === q.id)) data.misc.push(JSON.parse(JSON.stringify(q)));
    data.changelog.unshift({version, date: updated,
      text: text('Added starter profession books, free bag quests, Paxton’s full investigation, faction-specific Shaman weapon chains, Dalaran key and secret-boss preparation, racial reminders and official beginner setup tips.',
        'Lagt till professionsböcker i startområdena, gratis väskor, Paxtons hela utredning, factionspecifika Shaman-vapenkedjor, Dalarans nyckel- och bossförberedelser, raspåminnelser och officiella nybörjartips.')});
    data.discoveriesVersion = version; data.version = version; data.updated = updated;
    return data;
  }
  function suggestedFor(q, c, allQuests, isDone) {
    if (!q.starterRaces || q.starterRaces.includes(c.race) || q.zoneIds?.includes(c.currentZone)) return true;
    // A started chain remains suggested after leaving its zone, for any eligible race.
    return (q.requiresQuests || []).some(id => {
      const previous = allQuests.find(item => item.id === id);
      return previous ? isDone(previous, c) : !!c.done?.[id];
    });
  }
  function bookAdvice(c, language) {
    const chosen = bookChoices.filter(b => c.professions?.includes(b.profession));
    const names = (chosen.length ? chosen : bookChoices).map(b => b.title).join(' / ');
    const en = 'Choose one manual' + (chosen.length ? ' for your selected professions: ' : ': ') + names + '. Adds 2 skill, capped at 15; can teach the profession with a free primary slot. Two other primary professions block learning a new one.';
    const sv = 'Välj en manual' + (chosen.length ? ' för dina valda professions: ' : ': ') + names + '. Ger 2 skill, högst till 15; kan lära ut professionen med en ledig primary-plats. Två andra primary professions blockerar en ny.';
    return language === 'sv' ? sv : en;
  }
  return {version, updated, sources, quests, glossary, misc, bookChoices, shamanChains, apply, suggestedFor, bookAdvice};
});
