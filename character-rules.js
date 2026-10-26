"use strict";

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;else root.CharacterRules = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  // Original combinations plus Forever additions; Skyborne class access depends on faction.
  const races = {
    Human: ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'mage', 'warlock'],
    Dwarf: ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman'],
    'Night Elf': ['warrior', 'hunter', 'rogue', 'priest', 'druid'],
    Gnome: ['warrior', 'rogue', 'priest', 'mage', 'warlock'],
    Orc: ['warrior', 'hunter', 'rogue', 'shaman', 'mage', 'warlock'],
    Undead: ['warrior', 'paladin', 'rogue', 'priest', 'mage', 'warlock'],
    Tauren: ['warrior', 'hunter', 'shaman', 'druid'],
    Troll: ['warrior', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock'],
    Skyborne: ['warrior', 'hunter', 'rogue', 'druid']
  };
  const factions = {
    Human: 'Alliance',
    Dwarf: 'Alliance',
    'Night Elf': 'Alliance',
    Gnome: 'Alliance',
    Orc: 'Horde',
    Undead: 'Horde',
    Tauren: 'Horde',
    Troll: 'Horde'
  };
  const roles = {
    warrior: ['DPS', 'Tank'],
    paladin: ['DPS', 'Healer', 'Tank'],
    hunter: ['DPS'],
    rogue: ['DPS'],
    priest: ['DPS', 'Healer'],
    shaman: ['DPS', 'Healer'],
    mage: ['DPS'],
    warlock: ['DPS'],
    druid: ['DPS', 'Healer', 'Tank']
  };
  const secondary = ['Cooking', 'First Aid', 'Fishing'];
  function availableRaces(classId, faction) {
    return Object.keys(races).filter(r => (r === 'Skyborne' || factions[r] === faction) && (races[r].includes(classId) || r === 'Skyborne' && (faction === 'Horde' && classId === 'shaman' || faction === 'Alliance' && classId === 'mage')));
  }
  function valid(c) {
    return availableRaces(c.classId, c.faction).includes(c.race) && (roles[c.classId] || []).includes(c.role) && new Set(c.professions.filter(p => !secondary.includes(p))).size <= 2;
  }
  return {
    races,
    factions,
    roles,
    secondary,
    availableRaces,
    valid
  };
});