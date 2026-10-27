"use strict";

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;else root.GuideCore = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const KEY = 'wayfarer.forever.v1';
  const CATEGORIES = ['quests', 'dungeons', 'zones', 'abilities', 'gear', 'professions', 'tips'];
  const uuid = () => globalThis.crypto?.randomUUID?.() || 'c-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  const clean = (v, max = 300) => String(v ?? '').slice(0, max);
  const clamp = (n, a, b) => Math.min(b, Math.max(a, Number.isFinite(+n) ? Math.round(+n) : a));
  function createCharacter(values = {}) {
    return {
      id: uuid(),
      name: clean(values.name || 'New adventurer', 50),
      classId: values.classId || 'shaman',
      race: clean(values.race || 'Skyborne', 40),
      faction: values.faction === 'Alliance' ? 'Alliance' : 'Horde',
      level: clamp(values.level ?? 1, 1, 60),
      role: clean(values.role || 'DPS', 20),
      spec: clean(values.spec || '', 40),
      demo: !!values.demo,
      professionSkills: normaliseProfessionSkills(values.professionSkills),
      professions: Array.isArray(values.professions) ? values.professions.slice(0, 5) : [],
      done: {},
      skipped: {},
      notes: '',
      builds: [],
      activeBuild: null,
      filters: {
        categories: [...CATEGORIES],
        view: 'now',
        showDone: false
      },
      beginner: true,
      helpLevel: clamp(values.helpLevel ?? 2, 1, 4),
      journey: normaliseJourney(values.journey),
      companion: normaliseCompanion(values.companion),
      atlasMap: clean(values.atlasMap || 'world', 100),
      currentZone: clean(values.currentZone || '', 100),
      currentPlace: clean(values.currentPlace || '', 100),
      controller: ['xbox', 'playstation', 'generic'].includes(values.controller) ? values.controller : 'xbox',
      compact: false
    };
  }
  function normaliseJourney(v={}){v=v&&typeof v==='object'?v:{};return {from:clean(v.from||'',100),to:clean(v.to||'',100),faction:['Horde','Alliance'].includes(v.faction)?v.faction:'',transport:v.transport!==false,avoidEnemy:v.avoidEnemy!==false,flightMode:v.flightMode==='known'?'known':'all',planned:v.planned===true};}
  function normaliseCompanion(v={}){
    v=v&&typeof v==='object'&&!Array.isArray(v)?v:{};
    const safeKey=k=>typeof k==='string'&&k.length>0&&k.length<=180&&!['__proto__','constructor','prototype'].includes(k);
    const strings=(a,n)=>Array.isArray(a)?[...new Set(a.filter(safeKey))].slice(0,n):[];
    const trip=r=>({from:clean(r?.from||'',100),to:clean(r?.to||'',100),faction:['Alliance','Horde'].includes(r?.faction)?r.faction:'',transport:r?.transport!==false,avoidEnemy:r?.avoidEnemy!==false,flightMode:r?.flightMode==='known'?'known':'all'});
    return {
      inventory:Object.fromEntries(Object.entries(v.inventory&&typeof v.inventory==='object'?v.inventory:{}).filter(([k,n])=>safeKey(k)&&Number.isInteger(n)&&n>=0&&n<=1000000).slice(0,500)),
      flightPoints:strings(v.flightPoints,200),
      goals:Array.isArray(v.goals)?v.goals.filter(g=>g&&['quest','dungeon','craft'].includes(g.kind)&&safeKey(g.id)).slice(0,50).map(g=>({kind:g.kind,id:g.id,completed:g.completed===true})):[],
      favorites:strings(v.favorites,60),history:Array.isArray(v.history)?v.history.slice(0,15).map(trip).filter(r=>r.from&&r.to&&r.faction):[],
      town:clean(v.town||'',100),
      turnIns:Array.isArray(v.turnIns)?v.turnIns.filter(r=>r&&safeKey(r.id)&&safeKey(r.town)).slice(0,100).map(r=>({id:r.id,town:clean(r.town,100),ready:r.ready===true})):[],
      trainingDone:strings(v.trainingDone,200)
    };
  }
  function normaliseProfessionSkills(values){const names=['Alchemy','Blacksmithing','Enchanting','Engineering','Herbalism','Leatherworking','Mining','Skinning','Tailoring','Cooking','First Aid','Fishing'];return Object.fromEntries(Object.entries(values&&typeof values==='object'?values:{}).filter(([name,value])=>names.includes(name)&&Number.isInteger(value)&&value>=1&&value<=300));}
  function createBlankCharacter() {
    return {
      ...createCharacter(),
      name: '',
      classId: '',
      race: '',
      faction: '',
      role: '',
      blank: true
    };
  }
  function normalise(raw, catalog) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) || raw.schema !== 1 || !Array.isArray(raw.characters) || !raw.characters.length || raw.characters.length > 100) throw Error('Filen är inte en giltig backup från Questbound.');
    const ids = new Set();
    const characters = raw.characters.map(c => {
      if (!c || typeof c !== 'object' || !catalog.classes[c.classId] && !(c.blank === true && c.classId === '')) throw Error('En karaktär har en okänd klass.');
      const out = c.blank === true && !c.classId ? createBlankCharacter() : createCharacter(c);
      out.id = typeof c.id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(c.id) && !ids.has(c.id) ? c.id : uuid();
      ids.add(out.id);
      out.done = Object.fromEntries(Object.entries(c.done || {}).filter(([k, v]) => /^[a-zA-Z0-9_:.-]{1,180}$/.test(k) && v === true));
      out.skipped = Object.fromEntries(Object.entries(c.skipped || {}).filter(([k, v]) => /^[a-zA-Z0-9_:.-]{1,180}$/.test(k) && v === true));
      out.notes = clean(c.notes, 20000);
      out.journey=normaliseJourney(c.journey);out.atlasMap=clean(c.atlasMap||'world',100);
      out.companion=normaliseCompanion(c.companion);
      out.beginner = c.beginner !== false;
      out.compact = !!c.compact;
      out.filters = {
        categories: Array.isArray(c.filters?.categories) ? c.filters.categories.filter(x => CATEGORIES.includes(x)) : [...CATEGORIES],
        view: ['now', 'soon', 'all', 'skipped'].includes(c.filters?.view) ? c.filters.view : 'now',
        showDone: !!c.filters?.showDone
      };
      if(['solo','group'].includes(c.filters?.activity))out.filters.activity=c.filters.activity;
      out.builds = Array.isArray(c.builds) ? c.builds.slice(0, 30).map(b => normaliseBuild(b, catalog, out.classId)) : [];
      out.activeBuild = out.builds.some(b => b.id === c.activeBuild) ? c.activeBuild : out.builds[0]?.id || null;
      return out;
    });
    return {
      schema: 1,
      settings: {
        language: raw.settings?.language === 'sv' ? 'sv' : 'en',
        showSourceLinks: raw.settings?.showSourceLinks === true,
        theme: ['forest', 'dark', 'light', 'frost', 'parchment'].includes(raw.settings?.theme) ? raw.settings.theme : 'forest'
      },
      characters,
      activeId: characters.some(c => c.id === raw.activeId) ? raw.activeId : characters[0].id,
      updated: clean(raw.updated || new Date().toISOString(), 40)
    };
  }
  function normaliseBuild(b, catalog, classId) {
    if (!b || b.classId !== classId) throw Error('Buildens klass matchar inte karaktären.');
    const trees = catalog.classes[classId].trees;
    const allocations = trees.map((t, i) => t.talents.map((tal, j) => clamp(b.allocations?.[i]?.[j] ?? 0, 0, tal.max)));
    const order = Array.isArray(b.order) ? b.order.slice(0, 60).map(s => ({
      tree: clamp(s.tree, 0, 2),
      index: clamp(s.index, 0, 40)
    })) : [];
    if (order.some(s => !trees[s.tree].talents[s.index])) throw Error('Builden innehåller en okänd talang.');
    let url = '';
    if (b.url) {
      try {
        const u = new URL(b.url);
        if (u.protocol === 'https:' && ['wowhead.com', 'www.wowhead.com'].includes(u.hostname)) url = u.href;
      } catch {}
    }
    return {
      id: clean(b.id || uuid(), 100),
      name: clean(b.name || 'Imported build', 80),
      classId,
      url,
      allocations,
      order,
      startLevel: clamp(b.startLevel ?? 10, 5, 10),
      calculator: b.calculator===true,
      custom: !!b.custom,
      source: clean(b.source || '', 300)
    };
  }
  function parseWowhead(input, catalog, expectedClass) {
    let u;
    try {
      u = new URL(String(input).trim());
    } catch {
      throw Error('Klistra in en fullständig länk till Wowheads Forever-kalkylator.');
    }
    if (!['https:', 'http:'].includes(u.protocol) || !['www.wowhead.com', 'wowhead.com'].includes(u.hostname)) throw Error('Länken måste gå till wowhead.com.');
    const m = u.pathname.match(/^\/forever\/(?:[a-z]{2}\/)?talent-calc\/(?:embed\/)?([a-z-]+)\/([^/]+)(?:\/([^/]+))?\/?$/);
    if (!m || !catalog.classes[m[1]]) throw Error('Välj en build från Forever-kalkylatorn för en av de nio klasserna.');
    const classId = m[1];
    if (expectedClass && expectedClass !== classId) throw Error('Länken är för ' + catalog.classes[classId].name + '. Byt karaktär eller välj en build för rätt klass.');
    if (!m[2].startsWith(catalog.version)) throw Error('Denna version av Wowhead-länken stöds inte ännu. Spara om builden i den aktuella Forever-kalkylatorn.');
    const [points, ...options] = m[2].slice(catalog.version.length).split('_');
    if (!/^[0-5-]+$/.test(points)) throw Error('Poängkoden kunde inte läsas. Använd kalkylatorns delningslänk.');
    const parts = points.split('-');
    if (parts.length > 3) throw Error('Builden innehåller för många talangträd.');
    const trees = catalog.classes[classId].trees;
    const allocations = trees.map((t, i) => {
      const digits = parts[i] || '';
      if (digits.length > t.talents.length) throw Error('Buildens talangdata matchar inte den sparade kalkylatorversionen.');
      return t.talents.map((tal, j) => {
        const rank = +(digits[j] || 0);
        if (rank > tal.max) throw Error('En talang har fler poäng än tillåtet.');
        return rank;
      });
    });
    if (allocations.flat().reduce((a, b) => a + b, 0) > 51) throw Error('Builden innehåller fler än 51 talangpoäng.');
    const lower = 'abcdefghjkmnpqrstvwzxyilou468-~!',
      upper = 'ABCDEFGHJKMNPQRSTVWZXYILOU579_^.';
    const order = [];
    let tree = null;
    const spent = trees.map(t => t.talents.map(() => 0));
    for (const ch of m[3] || '') {
      if (/^[012]$/.test(ch)) {
        tree = +ch;
        continue;
      }
      if (tree === null) throw Error('Talangordningen saknar ett talangträd.');
      let index = lower.indexOf(ch),
        count = 1;
      if (index < 0) {
        index = upper.indexOf(ch);
        count = trees[tree].talents[index]?.max;
      }
      if (index < 0 || !trees[tree].talents[index] || !count) throw Error('Talangordningen kunde inte avkodas.');
      for (let n = 0; n < count; n++) {
        spent[tree][index]++;
        if (spent[tree][index] > allocations[tree][index]) throw Error('Talangordningen matchar inte poängfördelningen.');
        order.push({
          tree,
          index
        });
      }
    }
    const total = allocations.flat().reduce((a, b) => a + b, 0);
    if (order.length && order.length !== total) throw Error('Länken har en ofullständig talangordning. Spara om den i Wowhead eller dela en länk utan ordning.');
    const legacy = options.find(o => /^t[0-5]$/.test(o));
    const canonical = new URL(u.href);
    canonical.protocol = 'https:';
    return {
      id: uuid(),
      name: 'Imported ' + catalog.classes[classId].name + ' build',
      classId,
      url: canonical.href,
      allocations,
      order,
      startLevel: legacy ? 10 - +legacy.slice(1) : 10,
      custom: false
    };
  }
  function validateOrder(build, catalog) {
    const trees = catalog.classes[build.classId].trees;
    const spent = trees.map(t => t.talents.map(() => 0));
    const warnings = [];
    build.order.forEach((s, i) => {
      const t = trees[s.tree]?.talents[s.index];
      if (!t) {
        warnings.push({
          point: i + 1,
          message: 'Okänd talang.'
        });
        return;
      }
      const level = Math.min(60, build.startLevel + i);
      const prior = spent[s.tree].reduce((a, b, j) => a + (trees[s.tree].talents[j].row < t.row ? b : 0), 0);
      if (prior < t.required) warnings.push({
        point: i + 1,
        message: `${t.name} kräver ${t.required} tidigare poäng i trädet.`
      });
      if (level < t.minLevel) warnings.push({
        point: i + 1,
        message: `${t.name} behöver level ${t.minLevel}.`
      });
      for (const req of t.requires) {
        const j = trees[s.tree].talents.findIndex(x => x.id === req.id);
        if ((spent[s.tree][j] || 0) < req.qty) warnings.push({
          point: i + 1,
          message: `${t.name} saknar en förkravstalang.`
        });
      }
      spent[s.tree][s.index]++;
      if (spent[s.tree][s.index] > t.max) warnings.push({
        point: i + 1,
        message: `För många poäng i ${t.name}.`
      });
    });
    return warnings;
  }
  function buildSteps(build, catalog) {
    const counts = {};
    return build.order.map((s, i) => {
      const t = catalog.classes[build.classId].trees[s.tree].talents[s.index];
      const k = s.tree + ':' + s.index;
      counts[k] = (counts[k] || 0) + 1;
      return {
        ...s,
        level: build.startLevel + i,
        name: t.name,
        rank: counts[k],
        max: t.max,
        spell: t.spell,
        minLevel: t.minLevel,
        row: t.row,
        col: t.col,
        id: t.id,
        treeName: catalog.classes[build.classId].trees[s.tree].name
      };
    });
  }
  function matchesCharacter(item, c) {
    return (!item.classId || item.classId === c.classId) && (!item.faction || item.faction === c.faction || item.faction === 'Both') && (!item.races || item.races.includes(c.race));
  }
  function questDone(q, c) {
    return !questSkipped(q, c) && (!!c.done[q.id] || !!(q.steps?.length && q.steps.every((_, i) => c.done[q.id + ':' + i])));
  }
  function questSkipped(q, c) {
    return c.skipped?.[q.id] === true;
  }
  function setSkipped(c, item, skipped) {
    c.skipped ||= {};
    if (skipped) {
      if (questDone(item, c)) setDone(c, item, false);
      c.skipped[item.id] = true;
    } else delete c.skipped[item.id];
  }
  function setDone(c, item, done) {
    if (done && c.skipped) delete c.skipped[item.id];
    if (done) c.done[item.id] = true;else delete c.done[item.id];
    for (let i = 0; i < (item.steps?.length || 0); i++) {
      if (done) c.done[item.id + ':' + i] = true;else delete c.done[item.id + ':' + i];
    }
  }
  function storeState(storage, state) {
    state.updated = new Date().toISOString();
    storage.setItem(KEY, JSON.stringify(state));
  }
  return {
    KEY,
    CATEGORIES,
    uuid,
    clamp,
    clean,
    createCharacter,
    createBlankCharacter,
    normaliseCompanion,
    normalise,
    normaliseBuild,
    parseWowhead,
    validateOrder,
    buildSteps,
    matchesCharacter,
    questDone,
    questSkipped,
    setSkipped,
    setDone,
    storeState
  };
});
