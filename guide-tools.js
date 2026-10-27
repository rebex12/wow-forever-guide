"use strict";

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;else root.GuideTools = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const places = {
    'zone-durotar': ['Valley of Trials', 'Sen’jin Village', 'Senjin Village', 'Razor Hill', 'Echo Isles', 'Skull Rock'],
    'zone-mulgore': ['Camp Narache', 'Red Cloud Mesa', 'Bloodhoof Village', 'Red Rocks'],
    'zone-tirisfal': ['Deathknell', 'Brill', 'Garren’s Haunt', 'Agamand Mills', 'Scarlet Monastery', 'Ruins of Lordaeron'],
    'zone-elwynn': ['Northshire', 'Northshire Abbey', 'Goldshire', 'Eastvale Logging Camp', 'Fargodeep Mine', 'Goldtooth'],
    'zone-dunmorogh': ['Coldridge Valley', 'Anvilmar', 'Kharanos', 'Gol’Bolar Quarry', 'Gnomeregan', 'Brewnall Village'],
    'zone-teldrassil': ['Shadowglen', 'Aldrassil', 'Dolanaar', 'Rut’theran Village', 'Oracle Glade', 'Ban’ethil Barrow Den'],
    'zone-barrens': ['Crossroads', 'The Crossroads', 'Ratchet', 'Camp Taurajo', 'Lushwater Oasis', 'The Forgotten Pools', 'The Stagnant Oasis', 'Northwatch Hold', 'Wailing Caverns', 'Razorfen Kraul', 'Razorfen Downs', 'The Sludge Fen'],
    'zone-silverpine': ['The Sepulcher', 'Sepulcher', 'Pyrewood Village', 'Fenris Isle', 'Ambermill', 'Shadowfang Keep', 'The Decrepit Ferry'],
    'zone-westfall': ['Sentinel Hill', 'Moonbrook', 'The Deadmines', 'Saldean’s Farm', 'Jangolode Mine'],
    'zone-darkshore': ['Auberdine', 'The Master’s Glaive', 'Ameth’Aran', 'Bashal’Aran', 'Tower of Althalaxx'],
    'zone-loch': ['Thelsamar', 'Valley of Kings', 'Stonewrought Dam', 'Ironband’s Excavation Site'],
    'zone-stonetalon': ['Sun Rock Retreat', 'Stonetalon Peak', 'Windshear Crag', 'The Charred Vale'],
    'zone-ashenvale': ['Astranaar', 'Splintertree Post', 'Zoram’gar Outpost', 'Zoram Strand', 'Blackfathom Deeps', 'Silverwind Refuge'],
    'zone-redridge': ['Lakeshire', 'Stonewatch', 'Render’s Camp', 'Alther’s Mill'],
    'zone-duskwood': ['Darkshire', 'Raven Hill', 'Raven Hill Cemetery', 'Twilight Grove', 'Tranquil Gardens Cemetery'],
    'zone-hillsbrad': ['Southshore', 'Tarren Mill', 'Hillsbrad Fields', 'Durnholde Keep', 'Dun Garok'],
    'zone-wetlands': ['Menethil Harbor', 'Dun Modr', 'Whelgar’s Excavation Site', 'Greenwarden’s Grove'],
    'zone-thousand-needles': ['Freewind Post', 'The Great Lift', 'The Shimmering Flats', 'Mirage Raceway'],
    'zone-desolace': ['Shadowprey Village', 'Nijel’s Point', 'Kodo Graveyard', 'Maraudon', 'Mannoroc Coven'],
    'zone-stranglethorn-vale': ['Booty Bay', 'Grom’gol Base Camp', 'Nesingwary’s Expedition', 'Rebel Camp', 'Gurubashi Arena', 'Zul’Gurub'],
    'zone-arathi-highlands': ['Hammerfall', 'Refuge Pointe', 'Stromgarde Keep', 'Faldir’s Cove'],
    'zone-dustwallow-marsh': ['Theramore', 'Brackenwall Village', 'Tabetha’s Farm', 'Witch Hill'],
    'zone-alterac-mountains': ['Dalaran', 'City of Dalaran', 'Chillwind Point', 'Crushridge Hold'],
    'zone-badlands': ['Kargath', 'Uldaman', 'Hammertoe’s Digsite'],
    'zone-swamp-of-sorrows': ['Stonard', 'The Harborage', 'The Temple of Atal’Hakkar', 'Sunken Temple'],
    'zone-the-hinterlands': ['Aerie Peak', 'Revantusk Village', 'Jintha’Alor', 'The Altar of Zul'],
    'zone-tanaris': ['Gadgetzan', 'Steamwheedle Port', 'Zul’Farrak', 'Caverns of Time'],
    'zone-feralas': ['Camp Mojache', 'Feathermoon Stronghold', 'Dire Maul', 'The Twin Colossals'],
    'zone-searing-gorge': ['Thorium Point', 'The Cauldron', 'Blackrock Mountain'],
    'zone-azshara': ['Valormok', 'Talrendis Point', 'Bay of Storms'],
    'zone-felwood': ['Emerald Sanctuary', 'Bloodvenom Post', 'Timbermaw Hold'],
    'zone-winterspring': ['Everlook', 'Frostfire Hot Springs', 'Frostsaber Rock'],
    'zone-silithus': ['Cenarion Hold', 'The Scarab Wall', 'Ahn’Qiraj'],
    'zone-ungoro-crater': ['Marshal’s Refuge', 'Fire Plume Ridge', 'Fungal Rock'],
    'zone-western-plaguelands': ['Chillwind Camp', 'The Bulwark', 'Andorhal', 'Scholomance', 'Caer Darrow', 'Hearthglen'],
    'zone-eastern-plaguelands': ['Light’s Hope Chapel', 'Corin’s Crossing', 'Stratholme', 'Tyr’s Hand'],
    'zone-burning-steppes': ['Flame Crest', 'Morgan’s Vigil', 'Blackrock Stronghold'],
    'zone-blasted-lands': ['Nethergarde Keep', 'The Dark Portal', 'The Tainted Scar'],
    'zone-orgrimmar': ['Valley of Strength', 'Valley of Wisdom', 'Valley of Honor', 'The Drag', 'Cleft of Shadow', 'Ragefire Chasm'],
    'zone-undercity': ['Apothecarium', 'Royal Quarter', 'Trade Quarter', 'Magic Quarter', 'Rogues’ Quarter'],
    'zone-thunder-bluff': ['Elder Rise', 'Spirit Rise', 'Hunter Rise', 'Pools of Vision'],
    'zone-stormwind-city': ['Stormwind', 'Trade District', 'Dwarven District', 'Mage Quarter', 'Old Town', 'Cathedral Square', 'The Stockade'],
    'zone-ironforge': ['The Commons', 'The Great Forge', 'Tinker Town', 'Old Ironforge', 'The Hall of Thanes'],
    'zone-darnassus': ['Cenarion Enclave', 'Temple Gardens', 'Warrior’s Terrace', 'Tradesmen’s Terrace']
  };
  // Explicit associations; do not guess nearby dungeons from similar place names.
  const dungeonZones = {
    rfc: 'zone-orgrimmar',
    wc: 'zone-barrens',
    deadmines: 'zone-westfall',
    thanes: 'zone-ironforge',
    sfk: 'zone-silverpine',
    ruins: 'zone-tirisfal',
    bfd: 'zone-ashenvale',
    stockade: 'zone-stormwind-city',
    excavation: 'zone-wetlands',
    gnomeregan: 'zone-dunmorogh',
    'sm-graveyard': 'zone-tirisfal',
    'sm-library': 'zone-tirisfal',
    rfk: 'zone-barrens',
    dalaran: 'zone-alterac-mountains'
  };
  const help = [{
    id: 1,
    en: 'Minimal',
    sv: 'Lite hjälp',
    desc: {
      en: 'Class milestones and important unlocks. Short cards, fewer reminders.',
      sv: 'Klassmilstolpar och viktiga upplåsningar. Korta kort och färre påminnelser.'
    }
  }, {
    id: 2,
    en: 'Balanced',
    sv: 'Lagom hjälp',
    desc: {
      en: 'Relevant tasks, zone suggestions and preparation tips. Open details when you need them.',
      sv: 'Relevanta uppgifter, zonförslag och förberedelser. Öppna detaljer när du behöver dem.'
    }
  }, {
    id: 3,
    en: 'Detailed',
    sv: 'Mycket hjälp',
    desc: {
      en: 'More tasks and expanded quest checklists, with locations and prerequisites.',
      sv: 'Fler uppgifter och öppna questchecklistor, med platser och förkrav.'
    }
  }, {
    id: 4,
    en: 'Step by step',
    sv: 'Steg för steg',
    desc: {
      en: 'Show every documented step and all matching tasks. This is not yet a complete quest-by-quest leveling route.',
      sv: 'Visa varje dokumenterat steg och alla matchande uppgifter. Detta är ännu inte en komplett levelingrutt för varje quest.'
    }
  }];
  const normalise = text => String(text ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’'`]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  function searchZones(zones, query, character, limit = 12) {
    const needle = normalise(query),
      tokens = needle.split(/\s+/).filter(Boolean),
      result = [];
    for (const z of zones) {
      const labels = [z.title, ...(z.places || [])];
      for (const label of labels) {
        const clean = normalise(label);
        if (!tokens.every(t => clean.includes(t))) continue;
        const exact = clean === needle,
          starts = clean.startsWith(needle),
          main = label === z.title;
        result.push({
          zoneId: z.id,
          zoneTitle: z.title,
          label,
          isSubzone: !main,
          faction: z.faction,
          score: (exact ? 100 : starts ? 60 : 20) + (main ? 3 : 0) + (character && z.faction !== character.faction && z.faction !== 'Both' ? -5 : 0)
        });
      }
    }
    return result.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label)).slice(0, limit);
  }
  function visibleAtHelp(item, character) {
    return (!item.beginnerOnly || character.beginner) && (character.helpLevel !== 1 || item.category !== 'tips') && (!item.minHelp || character.helpLevel >= item.minHelp);
  }
  function questsForZone(data, zone, character, matches) {
    const labels = [zone.title, ...(zone.places || [])].map(normalise);
    return [...data.quests, ...data.misc].filter(q => matches(q, character) && visibleAtHelp(q, character) && ((q.zoneIds || []).includes(zone.id) || labels.some(name => normalise(q.location).includes(name) && name.length > 4)));
  }
  function augment(data, extraZones = []) {
    const known = new Set(data.zones.map(z => z.title));
    for (const z of extraZones) if (!known.has(z.title)) {
      data.zones.push(z);
      known.add(z.title);
    }
    const beginnerDescriptions = {
      'zone-barrens': {
        en: 'The towns of Crossroads and Ratchet connect many quests. While questing here, prepare for Wailing Caverns, a dungeon designed for a group.',
        sv: 'Orterna Crossroads och Ratchet knyter samman många quests. Förbered ett besök i dungeonen Wailing Caverns medan du questar här. En dungeon är ett område som är avsett för en grupp.'
      },
      'zone-silverpine': {
        en: 'An option after the starting area. The Sepulcher is a settlement where you can gather quests. Shadowfang Keep is a group dungeon in this zone.',
        sv: 'Ett alternativ efter startområdet. The Sepulcher är en ort där du kan samla quests. Shadowfang Keep är en dungeon för en grupp i den här zonen.'
      },
      'zone-westfall': {
        en: 'Follow The Defias Brotherhood quest chain before visiting The Deadmines, a group dungeon. The settlement of Sentinel Hill is a useful meeting place.',
        sv: 'Följ questkedjan The Defias Brotherhood inför dungeonen The Deadmines, som är avsedd för en grupp. Orten Sentinel Hill är en bra samlingspunkt.'
      },
      'zone-ashenvale': {
        en: 'An option before Blackfathom Deeps, a group dungeon. Pay attention to which settlements belong to Horde or Alliance.',
        sv: 'Ett alternativ inför Blackfathom Deeps, en dungeon för en grupp. Var uppmärksam på vilka orter som tillhör Horde respektive Alliance.'
      },
      'zone-elwynn': {
        en: 'A starting area for Humans. Follow quests toward the town of Goldshire and get to know the capital city, Stormwind.',
        sv: 'Startområde för Humans. Följ quests mot orten Goldshire och bekanta dig med huvudstaden Stormwind.'
      },
      'zone-dunmorogh': {
        en: 'A starting area for Dwarves and Gnomes. Visit the town of Kharanos and learn the route toward the capital city, Ironforge.',
        sv: 'Startområde för Dwarves och Gnomes. Besök orten Kharanos och lär dig vägen mot huvudstaden Ironforge.'
      },
      'zone-redridge': {
        en: 'The town of Lakeshire gathers many quests. Read your quest log before taking on harder group objectives.',
        sv: 'Orten Lakeshire samlar många quests. Läs questloggen innan du går på svårare gruppmål.'
      },
      'zone-duskwood': {
        en: 'Quest chains around the town of Darkshire. Some objectives are best tackled with friends.',
        sv: 'Questkedjor kring orten Darkshire. En del mål passar bäst med vänner.'
      }
    };
    const barrensSteps = [{
      en: 'Gather quests in Crossroads or Ratchet and compare their locations in your quest log before setting out.',
      sv: 'Samla quests i Crossroads eller Ratchet och jämför platserna i questloggen innan du ger dig av.'
    }, {
      en: 'Before Wailing Caverns, check the dungeon quest list below. The Forgotten Pools chain leads to Leaders of the Fang; Raptor Horns is a prerequisite for Smart Drinks.',
      sv: 'Kontrollera dungeonquestsen nedan inför Wailing Caverns. Kedjan The Forgotten Pools leder till Leaders of the Fang; Raptor Horns är en förquest till Smart Drinks.'
    }, {
      en: 'Check which quests match your faction and level, then agree on group roles before your dungeon visit.',
      sv: 'Kontrollera vilka quests som passar din faction och level, och bestäm grupproller inför dungeonbesöket.'
    }];
    for (const z of data.zones) {
      z.places = places[z.id] || [];
      z.dungeonIds = data.dungeons.filter(d => dungeonZones[d.id] === z.id || (d.zoneIds || []).includes(z.id)).map(d => d.id);
      z.places = [...new Set([...z.places,...data.dungeons.filter(d=>z.dungeonIds.includes(d.id)).map(d=>d.title)])];
      if (beginnerDescriptions[z.id]) z.beginnerDesc = beginnerDescriptions[z.id];
      z.localSteps = z.id === 'zone-barrens' ? barrensSteps : [{
        en: 'Compare your quest log with the zone map. Group nearby objectives before setting out.',
        sv: 'Jämför questloggen med zonkartan. Samla närliggande mål innan du ger dig av.'
      }, {
        en: 'Check the class and dungeon tasks linked below. Read any prerequisite quests before traveling to an entrance.',
        sv: 'Kontrollera kopplade klass- och dungeonuppgifter nedan. Läs eventuella förquests innan du reser till en ingång.'
      }, {
        en: 'Choose objectives that suit your current level and group. Save your next goal in My notes before stopping.',
        sv: 'Välj mål som passar din nuvarande level och grupp. Spara ditt nästa mål i Mina anteckningar innan du slutar.'
      }];
    }
    for (const item of data.misc) if (['first-town', 'flight-paths', 'before-dungeon', 'keep-gold'].includes(item.id)) item.beginnerOnly = true;
    return data;
  }
  return {
    places,
    dungeonZones,
    help,
    normalise,
    searchZones,
    visibleAtHelp,
    questsForZone,
    augment
  };
});