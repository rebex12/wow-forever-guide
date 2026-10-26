"use strict";

(function () {
  'use strict';

  const W = 'https://www.wowhead.com/forever/';
  const guide = p => W + 'guide/' + p;
  const classGuide = (c, s, role = 'dps', level = 30) => guide(`classes/${c}/${s}/level-${level}-${role}-overview`);
  const sources = {
    shaman: classGuide('shaman', 'enhancement', 'dps', 20),
    druid: classGuide('druid', 'balance'),
    hunter: classGuide('hunter', 'survival'),
    warrior: classGuide('warrior', 'fury'),
    paladin: classGuide('paladin', 'protection', 'tank', 20),
    priest: classGuide('priest', 'holy', 'healer'),
    mage: classGuide('mage', 'arcane'),
    rogue: classGuide('rogue', 'combat', 'dps', 20),
    warlock: classGuide('warlock', 'affliction'),
    camp: guide('camping-overview-unlock-rewards'),
    dungeons: guide('dungeons-overview-locations-details'),
    zones: W + 'zones',
    wave: guide('wavebreaker-shaman-hybrid-guide-for-wow-forever-35074')
  };
  const quests = [];
  function q(id, cls, level, title, desc, steps, extra = {}) {
    quests.push({
      id,
      category: 'quests',
      classId: cls,
      level,
      title,
      desc,
      steps,
      source: cls ? sources[cls] : sources.camp,
      status: 'sourced',
      updated: '2026-10-26',
      location: 'Din klasstrainer',
      reward: 'Se klassguiden för din ras och questvariant.',
      ...extra
    });
  }
  q('shaman-earth', 'shaman', 4, 'Call of Earth', 'Din första totemquest. Gör varianten för din ras så du kan använda Earth Totems.', ['Hämta rasens Call of Earth hos din trainer.', 'Följ kedjan och hämta din Earth Totem.'], {
    reward: 'Earth Totem'
  });
  q('shaman-fire', 'shaman', 10, 'Call of Fire', 'Lås upp Fire Totems. Ta med kedjan när du planerar nästa träningsbesök.', ['Hämta rätt Call of Fire för din faction.', 'Slutför kedjan och hämta din Fire Totem.'], {
    reward: 'Fire Totem'
  });
  q('shaman-water', 'shaman', 20, 'Call of Water', 'Dags för Water Totems. Kedjan innehåller mycket resande: lär Ghost Wolf innan du ger dig av.', ['Hämta Call of Water hos din Shaman trainer.', 'Följ Horde- eller Alliance-kedjan enligt klassguiden.', 'Slutför kedjan och kontrollera att du har din Water Totem.'], {
    reward: 'Water Totem · möjlighet att använda Water Totems'
  });
  q('shaman-air', 'shaman', 30, 'Call of Air', 'En klassmilsten att kontrollera vid din trainer. Exakt Forever-variant kompletteras.', ['Kontrollera Call of Air hos din trainer.', 'Slutför din ras- och factionsvariant.'], {
    status: 'preliminary',
    source: W + 'quests/classes/shaman',
    reward: 'Air Totem – kontrollera i spelet.'
  });
  q('hunter-taming', 'hunter', 10, 'Taming the Beast', 'Gör tränarens petkedja för att kunna tämja och träna ditt eget djur.', ['Prata med Hunter-trainern i ditt startområde.', 'Slutför områdets Taming the Beast-kedja.', 'Välj ditt första permanenta pet och kontrollera petträningen.'], {
    reward: 'Möjlighet att tämja och träna pets'
  });
  q('druid-bear', 'druid', 10, 'Heeding the Call → Bear Form', 'Följ din ras klasskedja för Bear Form. Skyborne har en egen variant.', ['Hämta Heeding the Call eller rasens motsvarande introduktion.', 'Följ kedjan till Bear Form.'], {
    reward: 'Bear Form'
  });
  q('druid-poison', 'druid', 14, 'Lessons Anew', 'En kortare klasskedja för Cure Poison.', ['Prata med din Druid trainer.', 'Slutför rasens Lessons Anew / Power over Poison-kedja.'], {
    reward: 'Cure Poison'
  });
  q('druid-aquatic', 'druid', 16, 'A Lesson to Learn', 'Följ din klasskedja till Aquatic Form.', ['Hämta A Lesson to Learn.', 'Slutför kedjan, inklusive Trial of the Sea Lion.'], {
    reward: 'Aquatic Form'
  });
  q('druid-cat', 'druid', 20, 'The Great Cat Spirit', 'Cat Form kräver en klassquest i Forever. Skyborne följer sin Windborne-variant.', ['Hämta din ras variant av The Great Cat Spirit.', 'Res till Moonglade och följ uppdraget.', 'Slutför provet och lås upp Cat Form.'], {
    location: 'Moonglade · introduktion från din klasskedja',
    reward: 'Cat Form'
  });
  q('warrior-armor-h', 'warrior', 20, 'Brutal Armor', 'Kedjan kan börja nu, men delar ligger över din level och kan kräva hjälp.', ['Prata med din Warrior trainer i Orgrimmar.', 'Följ Brutal Armor-kedjan och samla dess material.', 'Planera hjälp för de svårare delarna och Razorfen Kraul.'], {
    faction: 'Horde',
    reward: 'Brutal Hauberk',
    source: classGuide('warrior', 'protection', 'tank', 20)
  });
  q('warrior-armor-a', 'warrior', 20, 'Fire Hardened Mail', 'Alliances rustningskedja. Hämta den tidigt och planera de svårare delarna med vänner.', ['Prata med din Warrior trainer i Stormwind.', 'Följ kedjan och samla material.', 'Ta hjälp med de svårare uppgifterna.'], {
    faction: 'Alliance',
    reward: 'Fire Hardened Hauberk',
    source: W + 'quests/classes/warrior'
  });
  q('warrior-berserker', 'warrior', 30, 'The Islander · Berserker Stance', 'Klasskedjan leder till Klannoc Macleod och ett stridsprov.', ['Ta introduktionen från din Warrior trainer.', 'Möt Klannoc Macleod och klara provet med Big Will.'], {
    reward: 'Berserker Stance',
    location: 'Från din trainer till Klannoc Macleod'
  });
  q('warrior-whirlwind', 'warrior', 30, 'Whirlwind Weapon', 'Ett starkt vapenmål. Kedjan kan hämtas på 30, men är svår att slutföra ensam då.', ['Fortsätt efter Berserker Stance till Bath’rah the Windwatcher.', 'Samla kedjans material enligt questloggen.', 'Ta hjälp med slutstriden och välj vapen.'], {
    reward: 'Whirlwind Axe eller annat vapenval',
    location: 'Bath’rah the Windwatcher · Alterac Mountains'
  });
  q('paladin-divinity', 'paladin', 12, 'The Tome of Divinity / A Lesson in Divinity', 'Följ din ras introduktion. Namn och steg varierar i Forever.', ['Kontrollera din klassquest hos Paladin-trainern.', 'Följ rätt rasvariant av Divinity-kedjan.'], {
    source: W + 'quests/classes/paladin',
    reward: 'Klassutveckling · se din questvariant'
  });
  q('paladin-weapon-a', 'paladin', 20, 'The Test of Righteousness', 'Samla delarna till Verigan’s Fist. Kedjan tar dig genom flera områden och dungeons.', ['Börja med Tome of Valor-kedjan i Stormwind.', 'Följ uppgifterna till Jordan Stilwell.', 'Samla material från The Deadmines, Shadowfang Keep, Blackfathom Deeps och Loch Modan.'], {
    faction: 'Alliance',
    reward: 'Verigan’s Fist',
    location: 'Stormwind → Jordan Stilwell, Ironforge'
  });
  q('paladin-weapon-h', 'paladin', 20, 'Diplomatic Incident → Wolfsbane', 'Undead Paladins har en egen vapenkedja i Forever.', ['Ta klasskedjan i Bandarion Keep.', 'Följ uppgifterna vidare till bland annat Lumina Windsinger.', 'Slutför vapenkedjan.'], {
    faction: 'Horde',
    races: ['Undead'],
    reward: 'Wolfsbane',
    location: 'Bandarion Keep'
  });
  q('paladin-cloak', 'paladin', 22, 'A Strange Artifact', 'En Alliance-kedja med en användbar mantel. Planera hjälp för svåra delar.', ['Hitta Strange Orb i Tower of Althalaxx.', 'Lämna den till Delgren the Purifier.', 'Följ kedjan vidare och slutför Return to Delgren.'], {
    faction: 'Alliance',
    location: 'Tower of Althalaxx, Darkshore',
    coords: '/way 56.2 26.5',
    reward: 'Cloak of the Divine Storm',
    source: classGuide('paladin', 'retribution')
  });
  q('rogue-tools', 'rogue', 16, 'Tools of the Trade', 'Kontrollera klassuppdragen kring låsdyrkning och följ din factions variant.', ['Besök din Rogue trainer för introduktionen.', 'Följ den relevanta Tools of the Trade-kedjan.'], {
    source: W + 'quests/classes/rogue',
    status: 'preliminary',
    reward: 'Klassuppdrag – rasvariant behöver bekräftas.'
  });
  q('rogue-poison-a', 'rogue', 20, 'Klaven’s Tower', 'Ett klassuppdrag med receptet till Thistle Tea som belöning.', ['Prata med din Rogue trainer och följ Alliance-introduktionen.', 'Genomför Klaven’s Tower.'], {
    faction: 'Alliance',
    source: W + 'quests/classes/rogue',
    reward: 'Recipe: Thistle Tea'
  });
  q('rogue-poison-h', 'rogue', 20, 'Mission: Possible But Not Probable', 'Ett klassuppdrag med receptet till Thistle Tea som belöning.', ['Följ Horde-introduktionen via din Rogue trainer.', 'Genomför uppdraget enligt questloggen.'], {
    faction: 'Horde',
    source: W + 'quests/classes/rogue',
    reward: 'Recipe: Thistle Tea'
  });
  q('rogue-xelthos', 'rogue', 20, 'The Horn of Xelthos', 'Ett stealth-inriktat klassmål med en ring som belöning. Exakt startkrav behöver kontrolleras.', ['Öppna klassguiden och hitta startpunkten för kedjan.', 'Planera stealth-delen och slutför uppdraget.'], {
    reward: 'Pyrewood Signet Ring',
    status: 'preliminary'
  });
  q('mage-materials', 'mage', 15, 'Gathering Materials', 'En tidig Mage-klassquest. Kontrollera varianten hos din trainer.', ['Prata med din Mage trainer.', 'Samla materialen som din questvariant kräver.'], {
    source: W + 'quests/classes/mage',
    status: 'preliminary'
  });
  q('mage-wand', 'mage', 30, 'Mage’s Wand', 'Kedjan kan börja på 30. Den kräver ett besök i Scarlet Monastery: Library.', ['Journey to the Marsh', 'Items of Power', 'Hidden Secrets', 'Get the Scoop', 'Rituals of Power · Scarlet Monastery: Library', 'Mage’s Wand · välj efter din spec'], {
    reward: 'Icefury Wand / Ragefire Wand / Nether Force Wand'
  });
  q('warlock-void', 'warlock', 10, 'The Binding · Voidwalker', 'Tränaren skickar dig till huvudstaden, vidare efter ett föremål och sedan till en ritual.', ['Ta din ras introduktionsquest hos Warlock-trainern.', 'Hämta föremålet som kedjan kräver.', 'Framkalla och besegra Voidwalker i ritualcirkeln.'], {
    reward: 'Summon Voidwalker'
  });
  q('warlock-sayaad', 'warlock', 20, 'Sayaad · Succubus / Incubus', 'Följ tränarens kedja för din valda demon. Succubus och Incubus har separata kedjor.', ['Besök din Warlock trainer.', 'Välj och följ relevant demonquest.', 'Slutför ritualen.'], {
    reward: 'Tillgång till en Sayaad-summon'
  });
  q('warlock-orb', 'warlock', 20, 'The Orb of Soran’ruk', 'En klassquest som kopplar samman flera dungeonbesök.', ['Hämta uppdraget hos Doan Karhan nära Camp Taurajo.', 'Samla delarna i Blackfathom Deeps och Shadowfang Keep.', 'Återvänd till Doan Karhan.'], {
    source: W + 'quests/classes/warlock',
    location: 'Doan Karhan · The Barrens',
    reward: 'Valbar klassbelöning'
  });
  const priestRaces = {
    Human: ['Divine Grace', 'Arcane Feedback'],
    Dwarf: ['Desperate Prayer', 'Chastise'],
    'Night Elf': ['Returning Home', 'Elune’s Grace'],
    Gnome: ['Confounding Flash', 'Contingency Plan'],
    Undead: ['Touch of Weakness', 'Dark Sacrifice'],
    Troll: ['Hex of Weakness', 'Shadowguard']
  };
  for (const [race, names] of Object.entries(priestRaces)) names.forEach((name, i) => q(`priest-${race.replace(/ /g, '-').toLowerCase()}-${10 + i * 10}`, 'priest', 10 + i * 10, name, 'En rasspecifik Priest-quest. Besök din trainer och följ rätt introduktion.', ['Besök din Priest trainer.', 'Genomför rasens questkedja.'], {
    races: [race],
    reward: 'Rasspecifik Priest-förmåga',
    status: race === 'Undead' && i === 1 ? 'preliminary' : 'sourced'
  }));
  q('camp-outdoors', null, 5, 'The Great Outdoors', 'Lås upp camping tidigt. Din lägereld blir en bra samlingsplats när ni spelar tillsammans.', ['Hitta The Great Outdoors i ditt tidiga questområde.', 'Sätt dig vid lägerelden med /sit.', 'Lär Cooking och följ introduktionen till ditt eget camp.'], {
    location: 'Ditt tidiga questområde',
    reward: 'Introduktion till Camping',
    source: sources.camp,
    kind: 'Milsten'
  });
  const misc = [{
    id: 'first-town',
    category: 'tips',
    level: 1,
    title: 'Gör ditt första besök i staden',
    desc: 'Hitta innkeeper, trainer och handlare. Ställ din Hearthstone där det passar din nuvarande resa.',
    steps: ['Prata med en innkeeper och välj lämplig hemplats.', 'Besök din klasstrainer och läs igenom dina abilities.', 'Sälj skräp och reparera utrustningen.']
  }, {
    id: 'flight-paths',
    category: 'tips',
    level: 1,
    title: 'Ta flygpunkten när du kommer fram',
    desc: 'Prata med Flight Master i nya orter. Det sparar restid vid senare quests.',
    steps: ['Lär flygpunkten när du besöker en ny ort.']
  }, {
    id: 'before-dungeon',
    category: 'tips',
    level: 10,
    title: 'Innan första dungeonen',
    desc: 'Bestäm vem som tankar och healar. Hämta quests och gör förquests innan ni möts vid ingången.',
    steps: ['Bestäm roller och vilken dungeon ni ska köra.', 'Läs dungeonens questlista.', 'Ta med mat, dryck och lagad utrustning.']
  }, {
    id: 'keep-gold',
    category: 'tips',
    level: 10,
    title: 'Spara lite guld till träning',
    desc: 'Prioritera abilities du använder. Kontrollera kommande träning, professions och resor innan du köper en dyr uppgradering.',
    steps: ['Kontrollera träningsbehov innan större inköp.']
  }, {
    id: 'healer-set',
    category: 'gear',
    level: 10,
    title: 'Håll koll på utrustning för din grupproll',
    desc: 'Om du växlar mellan healing och solo: spara användbara alternativ och jämför dem för respektive roll.',
    roles: ['Healer'],
    steps: ['Spara relevanta healingalternativ i väskan eller banken.']
  }].map(o => ({
    status: 'editorial',
    updated: '2026-10-26',
    ...o
  }));
  const dq = (id, title, level, location, extra = {}) => ({
    id,
    title,
    level,
    location,
    ...extra
  });
  const dungeons = [{
    id: 'rfc',
    title: 'Ragefire Chasm',
    short: 'RFC',
    faction: 'Horde',
    level: 13,
    maxLevel: 18,
    minLevel: 10,
    zone: 'Orgrimmar · Cleft of Shadow',
    source: guide('ragefire-chasm-dungeon-overview-location-rewards'),
    entrySource: W + 'zone=2437',
    quests: [dq('rfc-beast', 'Slaying the Beast', 9, 'Neeru Fireblade · The Drag, Orgrimmar', {
      coords: '/way 49 50'
    }), dq('rfc-power', 'The Power to Destroy…', 9, 'Varimathras · Royal Quarter, Undercity', {
      coords: '/way 56 92'
    }), dq('rfc-strength', 'Testing an Enemy’s Strength', 9, 'Rahauro · Elder Rise, Thunder Bluff', {
      coords: '/way 70 30'
    }), dq('rfc-satchel', 'Searching for the Lost Satchel', 9, 'Rahauro · Elder Rise, Thunder Bluff'), dq('rfc-enemies', 'Hidden Enemies', 9, 'Thrall · Valley of Wisdom, Orgrimmar', {
      coords: '/way 31 37',
      prereq: 'Gör introduktionskedjan med samma namn före dungeonbesöket.'
    })]
  }, {
    id: 'wc',
    title: 'Wailing Caverns',
    short: 'WC',
    faction: 'Both',
    level: 15,
    maxLevel: 25,
    minLevel: 10,
    zone: 'The Barrens · Lushwater Oasis',
    source: guide('wailing-caverns-dungeon-overview-location-rewards'),
    entrySource: W + 'zone=718',
    quests: [dq('wc-bloom', 'Serpentbloom', 14, 'Apothecary Zamah · Pools of Vision, Thunder Bluff', {
      faction: 'Horde',
      coords: '/way 34 21'
    }), dq('wc-drinks', 'Smart Drinks', 13, 'Mebok Mizzyrix · Ratchet', {
      coords: '/way 62 37',
      prereq: 'Gör Raptor Horns hos samma NPC först.'
    }), dq('wc-docks', 'Trouble at the Docks', 14, 'Crane Operator Bigglefuzz · Ratchet', {
      coords: '/way 63 37'
    }), dq('wc-hides', 'Deviate Hides', 13, 'Nalpak · grottan ovanför ingången', {
      coords: '/way 46 35'
    }), dq('wc-eradication', 'Deviate Eradication', 15, 'Ebru · grottan ovanför ingången'), dq('wc-shard', 'The Glowing Shard', 10, 'Startföremål från Mutanus the Devourer'), dq('wc-fang', 'Leaders of the Fang', 15, 'Nara Wildmane · Elder Rise, Thunder Bluff', {
      faction: 'Horde',
      coords: '/way 45 23',
      prereq: 'Följ kedjan från The Forgotten Pools hos Tonga Runetotem i Crossroads.'
    })]
  }, {
    id: 'deadmines',
    title: 'The Deadmines',
    short: 'DM',
    faction: 'Both',
    level: 18,
    maxLevel: 23,
    minLevel: null,
    zone: 'Westfall · Moonbrook',
    source: guide('the-deadmines-dungeon-overview-location-rewards'),
    entrySource: W + 'zone=1581',
    quests: [dq('dm-memories', 'Collecting Memories', 14, 'Wilder Thistlenettle · Dwarven District, Stormwind', {
      faction: 'Alliance',
      coords: '/way 65 21'
    }), dq('dm-brother', 'Oh Brother…', 15, 'Wilder Thistlenettle · Stormwind', {
      faction: 'Alliance'
    }), dq('dm-assault', 'Underground Assault', 15, 'Shoni the Shilent · Stormwind', {
      faction: 'Alliance',
      coords: '/way 55 13'
    }), dq('dm-letter', 'The Unsent Letter', 16, 'Startföremål från Edwin VanCleef', {
      faction: 'Alliance',
      prereq: 'Leder vidare mot The Stockade Riots.'
    }), dq('dm-bandanas', 'Red Silk Bandanas', 14, 'Scout Riell · Sentinel Hill', {
      faction: 'Alliance',
      coords: '/way 56 47',
      prereq: 'Följ The Defias Brotherhood-kedjan först.'
    }), dq('dm-defias', 'The Defias Brotherhood', 14, 'Gryan Stoutmantle · Sentinel Hill', {
      faction: 'Alliance',
      prereq: 'Slutdelen av kedjan i Westfall.'
    })]
  }, {
    id: 'thanes',
    title: 'The Hall of Thanes',
    short: 'HoT',
    faction: 'Both',
    level: 13,
    maxLevel: 18,
    minLevel: null,
    zone: 'Ironforge · Old Ironforge',
    source: guide('hall-of-thanes-dungeon-overview-location-rewards'),
    quests: [dq('hot-heirlooms', 'Important Heirlooms', 10, 'Thom Filch · Old Ironforge', {
      levelStatus: 'preliminary',
      coords: '/way 32.6 44.6'
    }), dq('hot-dead', 'The Restless Dead', 10, 'Afadra Dunwall · Old Ironforge', {
      faction: 'Alliance',
      levelStatus: 'preliminary'
    }), dq('hot-incursion', 'Old Ironforge Incursion', 9, 'Earthseer Farsen · Gol’Bolar Quarry', {
      faction: 'Alliance',
      prereq: 'Börja med Dark Iron Map / Underground Map.',
      levelStatus: 'preliminary'
    }), dq('hot-treaty', 'The Treaty of Understanding', 9, 'Föremål i Reliquary of Kings, sista rummet', {
      faction: 'Alliance',
      levelStatus: 'preliminary'
    }), dq('hot-grudge', 'An Ancient Grudge', 10, 'Ghostly Attendant · Anvilmar’s Rest', {
      levelStatus: 'preliminary'
    })],
    note: 'Questguiden och databasen skiljer sig om miniminivåer. Nivåerna här följer databasen och behöver kontrolleras i spelet.'
  }, {
    id: 'sfk',
    title: 'Shadowfang Keep',
    short: 'SFK',
    faction: 'Both',
    level: 22,
    maxLevel: 30,
    minLevel: 11,
    zone: 'Silverpine Forest · norr om Pyrewood Village',
    source: guide('shadowfang-keep-dungeon-overview-location-rewards'),
    entrySource: W + 'zone=209',
    quests: [dq('sfk-book', 'The Book of Ur', 16, 'Keeper Bel’dugur · Apothecarium, Undercity', {
      faction: 'Horde',
      coords: '/way 53 54'
    }), dq('sfk-death', 'Deathstalkers in Shadowfang', 18, 'High Executor Hadrec · The Sepulcher', {
      faction: 'Horde',
      coords: '/way 43 41'
    }), dq('sfk-arugal', 'Arugal Must Die', 18, 'Dalar Dawnweaver · The Sepulcher', {
      faction: 'Horde',
      coords: '/way 44 39',
      reward: 'Seal of Sylvanas'
    }), dq('sfk-orb', 'The Orb of Soran’ruk', 20, 'Doan Karhan · The Barrens', {
      classId: 'warlock'
    }), dq('sfk-righteous', 'The Test of Righteousness', 20, 'Jordan Stilwell · Ironforge', {
      classId: 'paladin',
      faction: 'Alliance',
      prereq: 'Följ Tome of Valor-kedjan.'
    }), dq('sfk-moon', 'A Moon-Kissed Blade', 20, 'Lumina Windsinger · The Sepulcher', {
      classId: 'paladin',
      faction: 'Horde',
      prereq: 'Följ Diplomatic Incident-kedjan.'
    })]
  }, {
    id: 'ruins',
    title: 'Ruins of Lordaeron',
    short: 'RoL',
    faction: 'Both',
    level: 15,
    maxLevel: 20,
    minLevel: null,
    zone: 'Tirisfal Glades · Lordaeron',
    source: sources.dungeons,
    quests: [dq('rol-request', 'A Frightened Request', 15, 'Startplats kompletteras', {
      levelStatus: 'preliminary'
    }), dq('rol-wrath', 'The Wrath of Rath’mael', 15, 'Startplats kompletteras', {
      levelStatus: 'preliminary'
    })],
    partial: true,
    note: 'Urval av quests. Rekommenderat intervall skiljer sig mellan guider; planera cirka 15–22 och kontrollera gruppens förutsättningar.'
  }, {
    id: 'bfd',
    title: 'Blackfathom Deeps',
    short: 'BFD',
    faction: 'Both',
    level: 24,
    maxLevel: 32,
    minLevel: 15,
    zone: 'Ashenvale · Zoram Strand',
    source: sources.dungeons,
    entrySource: W + 'zone=719',
    quests: [dq('bfd-thaelrid', 'In Search of Thaelrid', 18, 'Se questdatabasen', {
      faction: 'Alliance'
    }), dq('bfd-knowledge', 'Knowledge in the Deeps', 18, 'Se questdatabasen', {
      faction: 'Alliance'
    })],
    partial: true
  }, {
    id: 'stockade',
    title: 'The Stockade',
    short: 'Stocks',
    faction: 'Alliance',
    level: 22,
    maxLevel: 30,
    minLevel: 15,
    zone: 'Stormwind · Mage Quarter',
    source: sources.dungeons,
    entrySource: W + 'zone=717',
    quests: [],
    partial: true
  }, {
    id: 'excavation',
    title: 'Excavation Site: Wetlands',
    short: 'ES',
    faction: 'Both',
    level: 24,
    maxLevel: 29,
    minLevel: null,
    zone: 'Wetlands',
    source: sources.dungeons,
    quests: [],
    partial: true
  }, {
    id: 'gnomeregan',
    title: 'Gnomeregan',
    short: 'Gnomer',
    faction: 'Both',
    level: 29,
    maxLevel: 38,
    minLevel: 19,
    zone: 'Dun Morogh',
    source: sources.dungeons,
    entrySource: W + 'zone=721',
    quests: [],
    partial: true
  }, {
    id: 'sm-graveyard',
    title: 'Scarlet Monastery: Graveyard',
    short: 'SM GY',
    faction: 'Both',
    level: 28,
    maxLevel: 38,
    minLevel: 20,
    zone: 'Tirisfal Glades',
    source: sources.dungeons,
    entrySource: W + 'zone=796',
    quests: [],
    partial: true
  }, {
    id: 'sm-library',
    title: 'Scarlet Monastery: Library',
    short: 'SM Lib',
    faction: 'Both',
    level: 29,
    maxLevel: 39,
    minLevel: 20,
    zone: 'Tirisfal Glades',
    source: sources.dungeons,
    entrySource: W + 'zone=796',
    quests: [dq('sm-rituals', 'Rituals of Power', 30, 'Del av Mage’s Wand-kedjan', {
      classId: 'mage'
    })],
    partial: true
  }, {
    id: 'rfk',
    title: 'Razorfen Kraul',
    short: 'RFK',
    faction: 'Both',
    level: 30,
    maxLevel: 40,
    minLevel: 25,
    zone: 'Södra The Barrens',
    source: sources.dungeons,
    entrySource: W + 'zone=491',
    quests: [],
    partial: true
  }, {
    id: 'dalaran',
    title: 'City of Dalaran',
    short: 'Dalaran',
    faction: 'Both',
    level: 28,
    maxLevel: 33,
    minLevel: null,
    zone: 'Alterac Mountains',
    source: sources.dungeons,
    quests: [dq('dalaran-power', 'Source of Power', 24, 'Startplats kompletteras', {
      levelStatus: 'preliminary'
    })],
    partial: true
  }].map(d => ({
    category: 'dungeons',
    status: d.level > 30 ? 'preliminary' : 'sourced',
    updated: '2026-10-26',
    ...d
  }));
  const zones = [['zephras', 'Zephras Isle', 1, 12, 'Both', 'Ditt startområde som Skyborne. Följ den lokala berättelsen och lär känna din klass innan du reser vidare.', 'Skyborne'], ['durotar', 'Durotar', 1, 10, 'Horde', 'Ett startområde för Orcs och Trolls. Följ orternas quests och kontrollera din trainer.', 'Orc,Troll'], ['mulgore', 'Mulgore', 1, 10, 'Horde', 'Ett naturligt startområde för Tauren. Gör klart dina tidiga klassuppdrag innan du fortsätter.', 'Tauren'], ['tirisfal', 'Tirisfal Glades', 1, 12, 'Horde', 'Startområde för Undead. Följ uppdragen mellan orterna och lär flygpunkterna.', 'Undead'], ['elwynn', 'Elwynn Forest', 1, 8, 'Alliance', 'Startområde för Humans. Följ quests mot Goldshire och bekanta dig med Stormwind.', 'Human'], ['dunmorogh', 'Dun Morogh', 1, 56, 'Alliance', 'Startområde för Dwarves och Gnomes. Besök Kharanos och lär dig vägen mot Ironforge.', 'Dwarf,Gnome'], ['teldrassil', 'Teldrassil', 1, 11, 'Alliance', 'Startområde för Night Elves. Följ startkedjorna och håll koll på dina klassquests.', 'Night Elf'], ['barrens', 'The Barrens', 10, 33, 'Horde', 'Crossroads och Ratchet knyter samman många quests. Förbered Wailing Caverns medan du questar här.'], ['silverpine', 'Silverpine Forest', 10, 20, 'Horde', 'Ett alternativ efter startområdet, med The Sepulcher som en viktig knutpunkt.'], ['westfall', 'Westfall', 9, 18, 'Alliance', 'Följ The Defias Brotherhood-kedjan inför The Deadmines. Sentinel Hill är en bra samlingspunkt.'], ['darkshore', 'Darkshore', 11, 19, 'Alliance', 'Fortsätt längs kusten och samla uppdrag kring orterna.'], ['loch', 'Loch Modan', 10, 18, 'Alliance', 'Ett alternativ efter Dun Morogh. Samla uppdrag och följ vägarna mellan dem.'], ['stonetalon', 'Stonetalon Mountains', 15, 25, 'Both', 'Kan kombineras med närliggande zoner. Välj uppdrag som passar din level och grupp.'], ['ashenvale', 'Ashenvale', 19, 30, 'Both', 'Ett alternativ inför Blackfathom Deeps. Var uppmärksam på vilka orter som tillhör din faction.'], ['redridge', 'Redridge Mountains', 15, 25, 'Alliance', 'Lakeshire samlar många uppdrag. Läs questloggen innan du går på svårare gruppmål.'], ['duskwood', 'Duskwood', 10, 30, 'Alliance', 'Questkedjor kring Darkshire. En del mål passar bäst med vänner.'], ['hillsbrad', 'Hillsbrad Foothills', 20, 31, 'Both', 'En möjlig fortsättning när du lämnar de tidiga zonerna. Håll koll på faction och eventuell PvP.'], ['wetlands', 'Wetlands', 20, 30, 'Both', 'Flera questområden och anslutningar till andra zoner. Kontrollera resvägen innan du lämnar din nuvarande ort.'], ['riverglades', 'Riverglades', 35, 45, 'Both', 'En ny Forever-zon. En detaljerad levelingrutt fylls på när underlaget är bättre.']].map(([id, title, level, maxLevel, faction, desc, races]) => ({
    id: 'zone-' + id,
    category: 'zones',
    title,
    level,
    maxLevel,
    faction,
    desc,
    races: races?.split(','),
    status: level > 30 ? 'preliminary' : 'sourced',
    source: id === 'zephras' || id === 'riverglades' ? guide('content-release-roadmap') : sources.zones,
    updated: '2026-10-26',
    travel: 'Följ dina questkedjor hit och ta flygpunkten när du kommer fram. Detaljerade resvägar kompletteras.'
  }));
  const professions = [['Alchemy', 'Mana Well'], ['Blacksmithing', 'Sharpening Wheel'], ['Enchanting', 'Enchanted Lute'], ['Engineering', 'Campingföremål – kompletteras'], ['Herbalism', 'Incense Candle'], ['Leatherworking', 'Camp Tent'], ['Mining', 'Lodestone'], ['Skinning', 'Camp Chair'], ['Tailoring', 'Faction Banner'], ['Cooking', 'Basic Campfire'], ['First Aid', 'First Aid Kit'], ['Fishing', 'Fish Bowl']].map(([name, item]) => ({
    id: 'profession-' + name.toLowerCase().replace(/ /g, '-'),
    category: 'professions',
    title: name,
    item,
    level: 5,
    desc: name === 'Cooking' ? 'Lär Cooking efter The Great Outdoors för att skapa din egen lägereld.' : 'Kontrollera professionens campingrecept och lär det när din skill räcker till.',
    source: sources.camp,
    updated: '2026-10-26',
    status: name === 'Engineering' ? 'preliminary' : 'sourced'
  }));
  const glossary = [['Aggro', 'När en fiende väljer att attackera dig. Låt vanligtvis tanken ta första kontakten i en dungeon.'], ['Trainer', 'En lärare för din klass eller profession. Besök dem för att kontrollera ny träning.'], ['Spec', 'Din inriktning inom klassen, formad av dina talentval.'], ['Build', 'En bestämd uppsättning talents. En levelingplan beskriver också i vilken ordning du tar poängen.'], ['Pull', 'Att starta en strid med en fiende eller grupp. I en dungeon brukar tanken styra detta.'], ['Tank', 'Grupprollen som håller fiendernas uppmärksamhet och tar huvuddelen av skadan.'], ['Healer', 'Grupprollen som håller de andra vid liv med healing och stöd.'], ['DPS', 'Damage per second. Används också som namn på grupprollen som främst gör skada.'], ['NPC', 'En figur som styrs av spelet, exempelvis en questgivare, trainer eller handlare.'], ['Förquest', 'Ett tidigare uppdrag som måste göras innan nästa del av en kedja blir tillgänglig.'], ['Hearthstone', 'Föremålet som tar dig till din valda hemort. Prata med en innkeeper för att välja hemplats.'], ['Crowd control / CC', 'Förmågor som tillfälligt begränsar en fiende, exempelvis genom sömn, rädsla eller bedövning.'], ['/way', 'Ett koordinatkommando för karttillägg som stöder det. Utan ett sådant tillägg får du leta efter platsen på kartan.'], ['Rested XP', 'En bonus till erfarenhet som byggs upp vid vila. Camping har också funktioner som kan ge rested experience.']].map(([title, desc], i) => ({
    id: 'term-' + i,
    category: 'glossary',
    title,
    desc
  }));
  window.GUIDE_CONTENT = {
    version: '0.3.0',
    updated: '2026-10-26',
    sources,
    quests,
    misc,
    dungeons,
    zones,
    professions,
    glossary,
    notes: 'Första utkastet innehåller ett urval klass- och dungeonquests, inte en komplett questdatabas. Namn och träningsnivåer för abilities samt talangfakta kommer från Wowheads aktuella Forever-kalkylator. Inträdeskrav är databasuppgifter och kan behöva bekräftas i spelet. Information över level 30 och detaljerade resrutter byggs ut löpande.',
    changelog: [{date:'2026-10-26',version:'0.3.0',text:{en:'Questbound branding, a blank first profile, in-game icons, visual talent trees with current and next choices, build deletion, back navigation, class-aware character options, grouped professions, zone tips on Overview, ordered complete task lists, clearer controller arrows and a simpler interface.',sv:'Questbound, tom startprofil, spelikoner, visuella talentträd med nuvarande och nästa val, borttagning av builds, bakåtknapp, klassanpassade karaktärsval, uppdelade professions, zontips på Overview, kompletta uppgifter i levelordning, tydligare controllerpilar och enklare gränssnitt.'}}, {
      date: '2026-10-26', version: '0.2.0',
      text: {en: 'English by default with Swedish language choice; five themes including OLED dark mode; saved zone and subzone search; four assistance levels; beginner-only basics and clearer zone descriptions; searchable controller reference. Existing profile data is preserved.', sv: 'Engelska som standard med svenskt språkval; fem teman inklusive OLED-mörkerläge; sparad zon- och subzonsökning; fyra hjälpnivåer; grundtips bara för nybörjare och tydligare zontexter; sökbar handkontrollsguide. Befintliga profiluppgifter bevaras.'}
    }, {
      date: '2026-10-26',
      version: '0.1.0',
      text: 'Första utkastet: nio klasser, profiler och autosparning, backup, talents med Wowhead-import, klassquests, dungeons, zoner, sökning, nybörjarstöd, spelläge och offlinecache.'
    }]
  };
})();
