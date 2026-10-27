"use strict";

(function () {
  'use strict';

  const C = window.GuideCore,
    DB = window.FOREVER_CATALOG,
    RAW = window.GUIDE_CONTENT,
    L = window.GuideI18n,
    T = window.GuideTools;
  RAW.controls = window.GUIDE_CONTROLS.rows;
  const Q=window.QuestChains;
  window.RELEASE_CONTENT.apply(RAW);
  Object.assign(T.dungeonZones,window.RELEASE_CONTENT.dungeonZones);
  T.augment(RAW, window.GUIDE_EXTRA_ZONES);
  const R = window.CharacterRules;
  let navTrail = [],
    dialogTrail = [],
    dialogTitle = '';
  let D = RAW;
  const $ = s => document.querySelector(s),
    esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[c]);
  const paths = {
    back: '<path d="M20 12H4m6-6-6 6 6 6"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6Z"/>',
    home: '<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
    zap: '<path d="m13 2-9 12h7l-1 8 10-12h-7Z"/>',
    scroll: '<path d="M6 4h13v14a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3h13v-3M6 18V5a2 2 0 1 0-4 0v3h4m4 0h5m-5 4h5"/>',
    dungeon: '<path d="M3 21V7l4-4 5 4 5-4 4 4v14Z"/><path d="M9 21v-6a3 3 0 0 1 6 0v6M7 9v2m10-2v2"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15m6-12v15"/>',
    book: '<path d="M12 5C8 2 4 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-4-2-7-1-10 1Zm0 0v16"/>',
    swords: '<path d="m3 3 14 14m-2 3 5-5m-3 5 3-3M3 3v5h5M21 3 7 17m2 3-5-5m3 5-3-3M21 3v5h-5"/>',
    shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
    leaf: '<path d="M20 3c1 9-2 16-9 16-5 0-8-5-5-9 3-5 10-2 14-7ZM4 21l11-11"/>',
    sprout: '<path d="M12 22V12M12 15C4 15 3 8 3 6c7 0 9 4 9 9Zm0-4c0-6 4-9 9-9 0 5-3 9-9 9"/>',
    flame: '<path d="M12 2c1 6-5 7-5 11 0 2 2 3 3 1 0-3 2-5 3-5 0 4 5 4 5 9a6 6 0 0 1-12 0c-5-6 2-11 6-16Z"/>',
    moon: '<path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z"/>',
    sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Zm7-1v4m-2-2h4M3 18v4m-2-2h4"/>',
    bow: '<path d="M4 4c13-2 18 3 16 16M4 4l16 16M4 4v16h16M2 22 18 6m-5 0h5v5"/>',
    dagger: '<path d="m20 3-5 12-4-2-2-4Zm-8 9-8 8m-2-2 4 4m2-12 6 6"/>',
    pickaxe: '<path d="m4 20 12-12M8 3c6-2 11 3 13 9l-5-4-4-1-4-4Z"/>',
    tent: '<path d="m3 21 9-18 9 18Zm5 0 4-9 4 9M5 4l14 17M19 4 5 21"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    sliders: '<path d="M4 6h4m4 0h8M4 12h9m4 0h3M4 18h2m4 0h10"/><circle cx="10" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',
    settings: '<path d="m9 3-1 3-3 1-2 5 2 1 1 4 4 1 2 3 3-2 4-1 1-4 2-2-2-4-3-1-2-3Z"/><circle cx="12" cy="12" r="3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    chevron: '<path d="m8 10 4 4 4-4"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    gamepad: '<path d="M7 7h10c3 0 5 7 4 11-1 3-5-2-6-3H9c-1 1-5 6-6 3C2 14 4 7 7 7Z"/><path d="M7 9v5m-2-2h5m6-2h.01m2 3h.01"/>',
    wifi: '<path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-10 4a5 5 0 0 1 6 0m-3 4h.01"/>',
    wifiOff: '<path d="m3 3 18 18M2 8a16 16 0 0 1 8-3m4 0a16 16 0 0 1 8 3M5 12a11 11 0 0 1 7-2m-3 6a5 5 0 0 1 6 0m-3 4h.01"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    upload: '<path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/>',
    external: '<path d="M14 3h7v7m0-7L10 14M10 3H3v18h18v-7"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    edit: '<path d="m14 4 6 6M3 21l5-1L21 7l-6-6L2 14Z"/>',
    note: '<path d="M4 3h16v18H4Zm4 5h8m-8 4h8m-8 4h5"/>',
    copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
    mountain: '<path d="m2 21 7-15 4 8 3-5 6 12Zm4-8 3 2 3-3"/>',
    pin: '<path d="M19 9c0 5-7 12-7 12S5 14 5 9a7 7 0 1 1 14 0Z"/><circle cx="12" cy="9" r="2"/>',
    heart: '<path d="M20 5c-3-3-7 0-8 2-1-2-5-5-8-2-5 5 8 15 8 15S25 10 20 5Z"/>',
    warning: '<path d="m12 3 10 18H2Zm0 6v5m0 3h.01"/>'
  };
  const safeSource = value => {
    try {
      const u = new URL(value);
      return u.protocol === 'https:' && ['www.wowhead.com', 'wowhead.com', 'worldofwarcraft.blizzard.com'].includes(u.hostname) ? u.href : '';
    } catch {
      return '';
    }
  };
  const utilityIcon = n => L.h`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[n] || paths.compass}</svg>`;
  const icon=n=>window.GAME_ASSETS.categories?.[n]?gameIcon(window.GAME_ASSETS.categories[n]):utilityIcon(n);
  const nav = [['overview', 'Översikt', 'compass'], ['talents', 'Talents & builds', 'zap'], ['quests', 'Quests', 'scroll'], ['dungeons', 'Dungeons', 'dungeon'], ['zones', 'Levelingzoner', 'map'], ['zone-guide', 'Min zon', 'pin'], ['abilities', 'Abilities & träning', 'sparkles'], ['gear', 'Utrustning', 'shield'], ['professions', 'Professions', 'pickaxe'], ['notes', 'Mina anteckningar', 'note'], ['glossary', 'Nybörjarguiden', 'book'], ['controller', 'Handkontroll', 'gamepad']];
  const categoryNames = {
    quests: 'Quests',
    dungeons: 'Dungeons',
    zones: 'Levelingzoner',
    abilities: 'Abilities & träning',
    gear: 'Utrustning',
    professions: 'Professions',
    tips: 'Speltips'
  };
  const categoryIcons = {
    quests: 'scroll',
    dungeons: 'dungeon',
    zones: 'map',
    abilities: 'sparkles',
    gear: 'shield',
    professions: 'pickaxe',
    tips: 'sprout'
  };
  let state,
    query = '',
    searchEveryone = false,
    page = location.hash.slice(1) || 'overview',
    brokenRaw = null,
    foreignChange = false,
    toastTimer,
    registration,
    controllerQuery = '',
    controllerGroup = 'all',
    updateAvailable = false;
  function builtIn() {
    const definitions = [[1, 'Thundering Strikes', 5], [1, 'Improved Ghost Wolf', 2], [2, 'Improved Healing Wave', 5], [2, 'Totemic Focus', 5], [2, 'Water Shield', 1], [1, 'Ancestral Knowledge', 5], [1, 'Shamanistic Focus', 1], [1, 'Elemental Weapons', 2], [2, 'Mindfulness', 3], [2, 'Healing Focus', 1], [1, 'Stormstrike', 1], [2, 'Tidal Mastery', 5], [2, 'Mana Tide Totem', 1], [2, 'Healing Way', 3], [2, 'Nature\'s Swiftness', 1], [2, 'Purification', 5], [2, 'Riptide', 1], [1, 'Toughness', 4]];
    const trees = DB.classes.shaman.trees,
      order = [],
      allocations = trees.map(t => t.talents.map(() => 0));
    for (const [tree, name, count] of definitions) {
      const index = trees[tree].talents.findIndex(t => t.name === name);
      if (index < 0) throw Error(L.m('Talangen ') + name + L.m(' saknas i katalogen.'));
      for (let i = 0; i < count; i++) order.push({
        tree,
        index
      });
      allocations[tree][index] = count;
    }
    return {
      id: 'wavebreaker-early-wolf-v1',
      name: 'Wavebreaker · early Ghost Wolf',
      classId: 'shaman',
      allocations,
      order,
      startLevel: 10,
      url: 'https://www.wowhead.com/forever/talent-calc/shaman/v2-0550020210401-5030500115013151',
      custom: true,
      source: D.sources.wave
    };
  }
  function initialState() {
    const c = C.createBlankCharacter();
    return {
      schema: 1,
      characters: [c],
      activeId: c.id,
      updated: new Date().toISOString()
    };
  }
  try {
    const raw = localStorage.getItem(C.KEY);
    state = raw ? C.normalise(JSON.parse(raw), DB) : initialState();
  } catch (e) {
    try {
      brokenRaw = localStorage.getItem(C.KEY);
    } catch {}
    state = initialState();
    if (!brokenRaw) brokenRaw = L.t('Webbläsaren blockerar lokal lagring.');
  }
  state.settings ||= {
    language: 'en',
    theme: 'forest'
  };
  state.settings.showSourceLinks=state.settings.showSourceLinks===true;
  L.setLanguage(state.settings.language);
  D = L.localize(RAW);
  const character = () => state.characters.find(c => c.id === state.activeId) || state.characters[0];
  const klass = () => DB.classes[character().classId] || DB.classes.warrior;
  const activeBuild = () => character().builds.find(b => b.id === character().activeBuild);
  function notify(message) {
    $('#toast').textContent = message;
    $('#toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3800);
  }
  function save() {
    const el = $('#save-status');
    try {
      if (brokenRaw || foreignChange) throw Error(L.t('Lagringen behöver kontrolleras.'));
      C.storeState(localStorage, state);
      el.innerHTML = L.m('<i></i> Sparat på enheten');
      el.classList.remove('error');
      return true;
    } catch (e) {
      el.textContent = foreignChange ? L.t('Ändrad i annan flik – öppna backup') : L.t('Kunde inte spara – öppna backup');
      el.classList.add('error');
      return false;
    }
  }
  function fillIcons(root = document) {
    root.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));
  }
  function avatar(c, large = false) {
    if (!c.classId) return `<span class="class-avatar ${large ? 'large' : ''}">${icon('plus')}</span>`;
    return `<span class="class-avatar ${large ? 'large' : ''}" style="--class-color:${DB.classes[c.classId].color}">${gameIcon(window.GAME_ASSETS.classes[c.classId])}</span>`;
  }
  function sourceLine(item) {
 if(!state.settings.showSourceLinks)return '';
 const status=item.status==='preliminary'?L.t('Preliminärt'):item.status==='editorial'?L.t('Praktiskt tips'):L.t('Källuppgift');
 return `<div class="source-line"><span><i class="status-dot ${item.status==='preliminary'?'preliminary':''}"></i> ${status}${item.updated?' · '+esc(item.updated):''}</span>${safeSource(item.source)?`<a href="${esc(safeSource(item.source))}" target="_blank" rel="noopener noreferrer">${bi('Source','Källa')} ${icon('external')}</a>`:''}</div>`;
}
  function levelTag(level, done = false) {
    const l = character().level;
    return L.h`<span class="level-tag ${level < l && !done ? 'overdue' : level > l ? 'future' : ''}">LV ${level}${level < l && !done ? L.m(' · kvar att göra') : ''}</span>`;
  }
  function coverage(){return `<div class="coverage-note">${utilityIcon('info')}<span>${bi('Selected quests and rewards, not a complete quest route. Level tags are suggested task levels; documented minimum requirements are shown separately.','Utvalda quests och belöningar, inte en komplett questrutt. Level-taggar visar föreslagen level; dokumenterade minimikrav visas separat.')} <button class="term" data-action="about">${bi('Content status and sources','Innehållsstatus och källor')}</button></span></div>`;}
  function tabs() {
    const c = character();
    return L.h`<div class="section-top"><div class="view-tabs" role="group" aria-label="Vilka levels ska visas?">${[['now', L.t('Aktuellt nu')], ['soon', L.t('Kommande')], ['all', L.t('Allt')]].map(([v, t]) => L.h`<button data-view="${v}" class="${c.filters.view === v ? 'active' : ''}" aria-pressed="${c.filters.view === v}">${L.t(t)}</button>`).join('')}</div><label class="form-check small"><input type="checkbox" id="show-done" ${c.filters.showDone ? 'checked' : ''}> Visa klara</label></div>`;
  }
  function inView(item) {
    const c = character(),
      v = c.filters.view;
    return v === 'all' || (v === 'soon' ? item.level > c.level && item.level <= Math.min(60, c.level + 10) : item.level <= c.level);
  }
  function visible(item) {
    const c = character();
    return C.matchesCharacter(item, c) && T.visibleAtHelp(item, c) && (!item.roles || item.roles.includes(c.role)) && c.filters.categories.includes(item.category);
  }
  function actionableItems() {
 const c=character();
 return [...D.quests,...D.misc].filter(q=>visible(q)&&inView(q)&&Q.available(q,c,D.quests,C.questDone)&&(c.filters.showDone||!C.questDone(q,c))).sort((a,b)=>a.level-b.level||a.title.localeCompare(b.title));
}
  function questCard(q) {
 const c=character(),done=C.questDone(q,c),partial=q.steps?.filter((_,i)=>c.done[q.id+':'+i]).length||0;
 return `<article class="quest-card ${done?'done':''}"><div class="quest-head"><input class="quest-check" type="checkbox" data-check="${esc(q.id)}" aria-label="${bi('Mark as completed','Markera som klar')}: ${esc(q.title)}" ${done?'checked':''}><div class="quest-copy"><div class="card-meta">${levelTag(q.level,done)}<span>${q.classId?esc(DB.classes[q.classId].name)+' · '+bi('Class quest','Klassquest'):esc(q.kind||L.t(categoryNames[q.category])||'Quest')}</span>${q.highValue?`<span class="reward-tag">${bi('Notable reward','Bra belöning')}</span>`:''}${q.group?`<span>${bi('Group','Grupp')}: ${esc(q.group)}</span>`:''}${partial&&!done?`<span>· ${partial}/${q.steps.length} ${bi('steps','steg')}</span>`:''}</div><h3>${esc(q.title)}</h3>${c.helpLevel>=2?`<p>${esc(q.desc||bi('Check this task when it becomes available.','Kontrollera uppgiften när den blir tillgänglig.'))}</p>`:''}${q.highValue&&q.reward?`<p class="quest-reward">${esc(q.reward)}</p>`:''}${q.status==='preliminary'?`<small class="content-caution">${esc(q.caution||bi('Preliminary: check the quest log for the current Forever requirements and reward.','Preliminärt: kontrollera aktuella Forever-krav och belöning i questloggen.'))}</small>`:''}${rewardPreview(q)}</div><span class="quest-icon">${q.classId?gameIcon(window.GAME_ASSETS.classes[q.classId]):icon(categoryIcons[q.category]||'scroll')}</span></div><details class="quest-details" ${c.helpLevel>=3?'open':''}><summary>${bi('Show steps and location','Visa steg och plats')}</summary><div class="details-inner">${q.location||q.reward?`<dl>${q.location?`<dt>${bi('Start / location','Start / plats')}</dt><dd>${esc(q.location)} ${q.coords?coordinate(q.coords):''}</dd>`:''}${q.reward&&!q.highValue?`<dt>${bi('Reward','Belöning')}</dt><dd>${esc(q.reward)}</dd>`:''}${q.minLevel?`<dt>${bi('Minimum level','Lägsta level')}</dt><dd>${q.minLevel}</dd>`:''}</dl>`:''}${q.audience?`<p>${bi('Useful for','Passar för')}: ${esc(q.audience)}</p>`:''}${q.prereq?`<p>${bi('Prerequisites','Förkrav')}: ${esc(q.prereq)}</p>`:''}${q.category==='abilities'?`<p>${bi('First training level from the Forever calculator. A class quest or another unlock may also be required.','Första träningsnivå enligt Forever-kalkylatorn. En klassquest eller annan upplåsning kan också krävas.')}</p>`:''}${q.steps?.length?`<div class="step-list">${q.steps.map((s,i)=>`<label class="step-row ${c.done[q.id+':'+i]?'completed':''}"><input type="checkbox" data-step="${esc(q.id)}" data-index="${i}" ${c.done[q.id+':'+i]?'checked':''}><span>${esc(s)}</span></label>`).join('')}</div>`:''}${sourceLine(q)}</div></details></article>`;
}
  function coordinate(coords) {
    return L.h`<button class="coordinate" data-copy="${esc(coords)}" aria-label="Kopiera koordinater">${esc(coords)} ${icon('copy')}</button>`;
  }
  function availableDungeons(view = true) {
    const c = character();
    return D.dungeons.filter(d => visible(d) && (!view || c.filters.view === 'all' || (c.filters.view === 'soon' ? d.level > c.level && d.level <= c.level + 10 : (d.minLevel || d.level) <= c.level && d.maxLevel >= c.level))).sort((a, b) => Math.abs((a.level + a.maxLevel) / 2 - c.level) - Math.abs((b.level + b.maxLevel) / 2 - c.level));
  }
  function recommendedZones() {
    const c = character();
    return D.zones.filter(z => !z.isCity && visible(z) && (c.filters.view === 'all' || (c.filters.view === 'soon' ? z.level > c.level && z.level <= c.level + 10 : z.level <= c.level && z.maxLevel >= c.level))).sort((a, b) => Number(!!b.races) - Number(!!a.races) || Math.abs(a.level + (a.maxLevel - a.level) * .45 - c.level) - Math.abs(b.level + (b.maxLevel - b.level) * .45 - c.level));
  }
  function dungeonCard(d,all=false) {
 const c=character(),quests=d.quests.filter(q=>(all||C.matchesCharacter(q,c))&&Q.available(q,c,D.quests,C.questDone));
 return `<article class="dungeon-card"><div class="dungeon-banner"><span class="dungeon-symbol">${icon('dungeon')}</span><div><div class="card-meta"><span class="level-tag">${bi('REC.','REK.')} ${d.level}–${d.maxLevel}</span><span>${esc(d.short)} · ${d.faction==='Both'?bi('Both factions','Båda factions'):esc(d.faction)}</span></div><h3>${esc(d.title)}</h3><small>${esc(d.zone)}</small></div></div><div class="dungeon-stats"><div><span>${bi('MINIMUM ENTRY LEVEL','LÄGSTA INTRÄDESLEVEL')}</span>${d.minLevel?'Level '+d.minLevel:bi('Not confirmed','Ej bekräftad')}</div><div><span>${bi('FOR YOUR LEVEL','FÖR DIN LEVEL')}</span>${c.level<d.level?bi('Plan for later','Planera inför senare'):c.level<=d.maxLevel?bi('Within recommended range','Inom rekommenderat intervall'):bi('Above recommended range','Över rekommenderat intervall')}</div></div><div class="dungeon-quests">${d.rangeEstimated?`<p class="content-caution">${bi('Estimated recommended range.','Uppskattat rekommenderat intervall.')}</p>`:''}${d.note?`<p class="small">${esc(d.note)}</p>`:''}${quests.length?quests.map(questCard).join(''):`<p class="small">${bi('No unlocked quests in this selection. Check the Quests list for prerequisite chains.','Inga upplåsta quests i detta urval. Se förquestkedjor i questlistan.')}</p>`}${sourceLine(d)}${state.settings.showSourceLinks&&d.entrySource?`<a class="small" href="${esc(d.entrySource)}" target="_blank" rel="noopener noreferrer">${bi('Entry source','Källa för inträdeskrav')} ${utilityIcon('external')}</a>`:''}</div></article>`;
}
  function zoneCard(z, matchedPlace = '') {
    const desc = character().beginner && z.beginnerDesc ? z.beginnerDesc : z.desc;
    return L.h`<article class="zone-card"><div class="card-meta"><span class="level-tag">${z.isCity ? bi('CAPITAL CITY', 'HUVUDSTAD') : 'LEVEL ' + z.level + '–' + z.maxLevel}</span><span>${z.faction === 'Both' ? bi('Both factions', 'Båda factions') : esc(z.faction)}</span></div><span class="zone-icon">${icon('mountain')}</span><h3>${esc(z.title)}</h3>${matchedPlace && matchedPlace !== z.title ? L.h`<p class="small">${bi('Matched place', 'Matchad plats')}: <strong>${esc(matchedPlace)}</strong></p>` : ''}<p>${esc(desc)}</p>${character().beginner && character().helpLevel >= 2 ? L.h`<div class="route-hint">${icon('pin')}<span>${esc(z.travel)}</span></div>` : ''}<div class="zone-controls"><button class="secondary-button" data-select-zone="${esc(z.id)}" data-place="${esc(matchedPlace || z.title)}">${bi('I am here · show tips', 'Jag är här · visa tips')}</button></div>${sourceLine(z)}</article>`;
  }
  function empty(title = L.t('Här är det lugnt just nu'), text = L.t('Prova Kommande eller Allt, eller välj fler kategorier.')) {
    return L.h`<div class="empty-state">${icon('compass')}<h3>${title}</h3><p>${text}</p><button class="secondary-button" data-view="all">Visa alla levels</button></div>`;
  }
  function heading() {
 const c=character(),n=nav.find(n=>n[0]===page)||nav[0];
 $('#page-heading').innerHTML=`<div class="heading-row"><button class="icon-button mobile-menu" data-action="menu" aria-label="${bi('Open menu','Öppna menyn')}">${utilityIcon('menu')}</button><button class="icon-button" id="back-button" data-action="back" aria-label="${bi('Back','Tillbaka')}" ${navTrail.length?'':'disabled'}>${utilityIcon('back')}</button><h1>${c.blank?bi('Create your character','Skapa din karaktär'):esc(L.t(n[1]))}</h1><button class="draft-badge" data-action="about">0.4.0</button></div>`;
}
  function renderShell() {
    applyPreferences();
    const c = character();

    $('#sidebar-character').innerHTML = L.h`<button class="character-switch" data-action="characters" aria-label="${bi('Switch or manage character', 'Byt eller hantera karaktär')}">${avatar(c)}<span class="character-copy"><strong>${esc(c.name || bi('New character', 'Ny karaktär'))}</strong><small>${c.blank ? '—' : 'Level ' + c.level + ' · ' + esc(klass().name)}</small></span>${icon('chevron')}</button>`;

    $('#navigation').innerHTML = nav.map(([id, name, ic], i) => L.h`${i === 9 ? '<div class="nav-separator"></div>' : ''}<button data-page="${id}" class="${page === id ? 'active' : ''}" ${page === id ? 'aria-current="page"' : ''}>${icon(ic)}${esc(L.t(name))}</button>`).join('');


    $('#filter-count').textContent = c.filters.categories.length;
    heading();
    renderContent();
    offlineStatus();
  }
  function hero() {
    const c = character();
    return `<section class="character-bar" aria-label="${bi('Character and level', 'Karaktär och level')}"><div class="character-bar-name">${avatar(c, true)}<div><strong>${esc(c.name)}</strong><small>${esc(klass().name)} · ${esc(c.race)} · ${esc(c.faction)}</small></div><button class="text-button" data-action="edit-character">${icon('edit')} ${bi('Edit', 'Redigera')}</button></div><div class="level-controls"><button class="level-button" data-action="level-down" aria-label="${bi('Decrease level', 'Minska level')}" ${c.level === 1 ? 'disabled' : ''}>${icon('minus')}</button><label class="current-level-label"><span>${bi('Level', 'Level')}</span><input id="character-level" type="number" min="1" max="60" inputmode="numeric" value="${c.level}" aria-label="${bi('Your current level', 'Din nuvarande level')}"></label><button class="level-button" data-action="level-up" aria-label="${bi('Increase level', 'Öka level')}" ${c.level === 60 ? 'disabled' : ''}>${icon('plus')}</button></div></section>`;
  }
  function summary() {
    const c = character(),
      b = activeBuild(),
      steps = b ? C.buildSteps(b, DB) : [],
      now = steps.find(s => s.level === c.level),
      next = steps.find(s => s.level > c.level),
      q = D.quests.filter(q => q.classId && C.matchesCharacter(q, c) && Q.available(q,c,D.quests,C.questDone) && !C.questDone(q, c) && q.level <= c.level + 10).sort((a, b) => Math.abs(a.level - c.level) - Math.abs(b.level - c.level))[0],
      ds = availableDungeons();
    return `<div class="summary-grid">${talentPointCard(bi('Talent at this level', 'Talent för denna level'), now, b)}${talentPointCard(bi('Next talent point', 'Nästa talentpoäng'), next, b)}<button class="summary-card" data-page="quests" ${c.filters.categories.includes('quests') ? '' : 'hidden'}><span class="summary-title">${icon('scroll')} ${bi('Class quest', 'Klassquest')}</span><strong>${q ? esc(q.title) : bi('All listed milestones completed', 'Alla noterade milstolpar klara')}</strong><small>${q ? 'Level ' + q.level : bi('Open class quests', 'Öppna klassquests')}</small></button><button class="summary-card" data-page="dungeons" ${c.filters.categories.includes('dungeons') ? '' : 'hidden'}><span class="summary-title">${icon('dungeon')} Dungeons</span><strong>${ds.length ? esc(ds[0].title) : bi('No dungeon in this range', 'Ingen dungeon i intervallet')}</strong><small>${bi('Open dungeon list', 'Öppna dungeonlistan')}</small></button></div>`;
  }
  function overview() {
    const c = character(),
      tasks = actionableItems(),
      all = c.filters.view === 'all' || c.filters.showDone,
      limit = all || c.helpLevel === 4 ? Infinity : c.helpLevel === 1 ? 3 : c.helpLevel === 2 ? 6 : 12,
      zones = recommendedZones().slice(0, 2);
    return hero() + sessionPanel() + summary() + zoneOverview() + `<section><div class="section-top"><h2>${icon('scroll')} ${bi('To do now', 'Att göra nu')}</h2><button class="text-button" data-page="quests">${bi('All quests', 'Alla quests')} ${icon('arrow')}</button></div>${tabs()}<div class="quest-list">${tasks.length ? tasks.slice(0, limit).map(questCard).join('') : empty()}</div>${tasks.length > limit ? `<button class="text-button" data-page="quests">${bi('See more tasks', 'Se fler uppgifter')} ${icon('arrow')}</button>` : ''}</section>${!c.currentZone && c.filters.categories.includes('zones') ? `<section class="zone-section"><div class="section-top"><h2>${bi('Suggested zones', 'Föreslagna zoner')}</h2></div><div class="card-grid">${zones.map(z => zoneCard(z)).join('')}</div></section>` : ''}` + coverage();
  }
  function talents() {
    const c = character(),
      b = activeBuild();
    let html = `<div class="build-toolbar"><select id="active-build" aria-label="${bi('Active build', 'Aktiv build')}">${!c.builds.length ? `<option value="">${bi('No saved build', 'Ingen build sparad')}</option>` : c.builds.map(b => `<option value="${esc(b.id)}" ${b.id === c.activeBuild ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select><button class="primary-button" data-action="import-build">${icon('plus')} ${bi('Import from Wowhead', 'Importera från Wowhead')}</button>${b ? `<button class="secondary-button" data-action="edit-build">${bi('Rename build', 'Byt namn på build')}</button><button class="danger-button" data-action="request-delete-build">${bi('Delete build', 'Ta bort build')}</button>` : ''}${c.classId === 'shaman' && !c.builds.some(b => b.id === 'wavebreaker-early-wolf-v1') ? `<button class="secondary-button" data-action="add-wavebreaker">${bi('Use Wavebreaker', 'Välj Wavebreaker')}</button>` : ''}</div>`;
    if (!b) return html + `<section class="info-card"><h2>${bi('Import your talent build', 'Importera din talentbuild')}</h2><p>${bi('Include a saved point order in the Wowhead link to see talent choices for each level.', 'Ta med en sparad poängordning i Wowhead-länken för att se talentval för varje level.')}</p><a href="https://www.wowhead.com/forever/talent-calc/${c.classId}" target="_blank" rel="noopener noreferrer">${bi('Open calculator', 'Öppna kalkylatorn')} ${icon('external')}</a></section>`;
    const steps = C.buildSteps(b, DB),
      now = steps.find(s => s.level === c.level),
      next = steps.find(s => s.level > c.level),
      warnings = C.validateOrder(b, DB);
    html += `<section class="info-card"><h2>${esc(b.name)}</h2><div class="talent-summary">${klass().trees.map((t, i) => `<div class="tree-total"><strong>${b.allocations[i].reduce((a, b) => a + b, 0)}</strong><small>${esc(t.name)}</small></div>`).join('')}</div>${b.url ? `<a class="secondary-button" href="${esc(b.url)}" target="_blank" rel="noopener noreferrer">${bi('Open in Wowhead', 'Öppna i Wowhead')} ${icon('external')}</a>` : ''}</section><div class="summary-grid talent-point-pair">${talentPointCard(bi('Talent at this level', 'Talent för denna level'), now, b)}${talentPointCard(bi('Next talent point', 'Nästa talentpoäng'), next, b)}</div>`;
    if (warnings.length) html += `<p class="talent-warning">${bi('Check the imported order:', 'Kontrollera den importerade ordningen:')} ${esc(L.m(warnings[0].message))}</p>`;
    if (!steps.length) html += `<p class="coverage-note">${bi('This link contains an allocation but no leveling order. Import a Wowhead share link with a saved order for level-by-level choices.', 'Länken innehåller en poängfördelning men ingen levelingordning. Importera en Wowhead-länk med sparad ordning för val vid varje level.')}</p>`;
    html += talentTrees(b);
    if (steps.length) html += `<section class="zone-section"><h2>${bi('Leveling plan', 'Levelingplan')}</h2><div class="talent-table">${steps.map(s => `<button class="talent-table-row ${s.level === c.level ? 'current' : ''}" data-talent="${s.tree}:${s.index}"><span>LV ${s.level}</span><div class="talent-table-name">${gameIcon(window.GAME_ASSETS.talents[s.id])}<span>${esc(s.name)} <span class="talent-rank">${s.rank}/${s.max}</span></span></div><span class="talent-tree-label">${positionLabel(s)}</span></button>`).join('')}</div></section>`;
    return html;
  }
  function questsPage() {
    const items = actionableItems().filter(q => q.category === 'quests');
    return tabs() + L.h`<div class="quest-list">${items.length ? items.map(questCard).join('') : empty()}</div>` + coverage();
  }
  function dungeonsPage() {
    const ds = availableDungeons();
    return tabs() + L.h`<div class="coverage-note">${icon('info')}<span>Inträdeslevel är ett tekniskt krav från databasen. Rekommenderad level hjälper dig välja en rimlig utmaning. Gruppens utrustning och erfarenhet spelar också roll.</span></div><div class="card-grid">${ds.length ? ds.map(d => dungeonCard(d)).join('') : empty(L.t('Inga dungeons i det valda intervallet'))}</div>` + coverage();
  }
  function zonesPage() {
    const zs = recommendedZones();
    return L.h`<div class="info-card" style="margin-bottom:20px"><h2>${bi('Find the zone you are in', 'Hitta zonen du befinner dig i')}</h2><p>${bi('Search zones and subzones together. Crossroads or Ratchet both lead to The Barrens.', 'Sök zoner och subzoner i samma ruta. Crossroads och Ratchet leder båda till The Barrens.')}</p><button class="primary-button" data-action="choose-zone">${icon('search')} ${bi('Search zone or subzone', 'Sök zon eller subzon')}</button>${character().currentZone ? L.h`<button class="text-button" data-page="zone-guide">${bi('Open my zone', 'Öppna min zon')} ${icon('arrow')}</button>` : ''}</div>` + tabs() + L.h`<div class="card-grid">${zs.length ? zs.map(z => zoneCard(z)).join('') : empty()}</div>` + coverage();
  }
  function abilitiesPage() {
    const c = character(),
      abilities = DB.abilities.filter(a => visible(a) && inView(a) && (c.filters.showDone || !c.done[a.id]) && (c.filters.view !== 'now' || a.level >= c.level - 3)).sort((a, b) => a.level - b.level);
    return tabs() + L.h`<div class="coverage-note">${icon('sparkles')}<span>Här visas första träningsnivån för varje förmåga. Högre ranks och träningskostnader kompletteras. Klassquests kan vara ett extra krav.</span></div><div class="quest-list">${abilities.length ? abilities.map(questCard).join('') : empty()}</div>`;
  }
  function gearPage() {
    const c = character(),
      examples = D.quests.filter(q => q.classId && C.matchesCharacter(q, c) && Q.available(q,c,D.quests,C.questDone) && q.reward && /Axe|Hauberk|Fist|Wolfsbane|Wand|Cloak|Ring/.test(q.reward));
    return L.h`<div class="info-card"><div class="card-meta"><span class="level-tag">${esc(c.role)}</span><span>${esc(klass().name)}</span></div><h2>Välj gear för det du spelar</h2><p style="margin-top:12px">Utgå från din valda specs aktuella klassguide. Vapnets egenskaper, användbara stats och förmågan att överleva behöver vägas ihop under leveling.</p><p>Fullständig statprioritering och dungeonloot för varje spec fylls på. Sparade Wowhead-builds ändrar inte automatiskt dessa råd.</p><a class="secondary-button" href="${esc(D.sources[c.classId])}" target="_blank" rel="noopener noreferrer">Öppna ${esc(klass().name)}-guiden ${icon('external')}</a></div><div class="section-top" style="margin-top:25px"><h2>Vapen och andra klassmål</h2></div><div class="quest-list">${examples.length ? examples.map(questCard).join('') : questCard({
      id: 'gear-class-review',
      category: 'gear',
      level: 1,
      title: L.t('Jämför nästa uppgradering'),
      desc: L.t('Läs klassguidens gearförslag och skriv gärna upp ditt nästa vapen- eller rustningsmål i Mina anteckningar.'),
      source: D.sources[c.classId],
      updated: DB.updated,
      status: 'editorial'
    })}</div>` + coverage();
  }
  function professionsPage() {
 const c=character(),names=c.professions,P=window.ProfessionPlanner;
 const intro=`<section class="info-card"><div class="section-top"><h2>${bi('Your professions','Dina professions')}</h2><button class="text-button" data-action="edit-character">${utilityIcon('edit')} ${bi('Choose professions','Välj professions')}</button></div><p>${bi('Enter your base skill, without temporary bonuses. Each character keeps its own values.','Ange grundskill utan tillfälliga bonusar. Varje karaktär har egna värden.')}</p>${names.length?`<div class="profession-skills">${names.map(n=>`<label class="profession-skill-field">${gameIcon(window.GAME_ASSETS.professions[n])}<span>${esc(n)}<small>${R.secondary.includes(n)?bi('Secondary','Secondary'):bi('Primary','Primary')}</small></span><input type="number" min="1" max="300" step="1" inputmode="numeric" data-profession-skill="${esc(n)}" value="${c.professionSkills?.[n]??''}" placeholder="—" aria-label="${esc(n)} ${bi('current skill','nuvarande skill')}"><small>/ 300</small></label>`).join('')}</div>`:`<p>${bi('Choose professions to track their skills and see material plans.','Välj professions för att följa skill och se materialplaner.')}</p>`}</section>`;
 const plans=names.filter(n=>R.secondary.includes(n)).map(n=>professionMaterials(n)).join('');
 const gear=professionGear();
 const items=D.professions.filter(p=>names.includes(p.title));
 return intro+plans+gear+`<section class="profession-section"><h2>${bi('Camping features','Campingföremål')}</h2><div class="card-grid">${items.map(p=>`<article class="info-card"><div class="card-meta">${gameIcon(window.GAME_ASSETS.professions[p.title])}<span>${esc(p.title)}</span></div><h3>${esc(p.item)}</h3><p>${esc(p.desc)}</p><label class="form-check"><input type="checkbox" data-check="${esc(p.id)}" ${c.done[p.id]?'checked':''}> ${bi('Recipe / unlock checked','Recept / upplåsning kontrollerad')}</label>${sourceLine(p)}</article>`).join('')}</div></section><div style="margin-top:20px">${questCard(D.quests.find(q=>q.id==='camp-outdoors'))}</div>`;
}
  function glossaryPage() {
    return L.h`<div class="beginner-note" style="margin-bottom:20px"><h3>${icon('sprout')} Börja enkelt</h3><p>Prata med figurer som har uppdrag, läs din questlogg och prova förmågorna i lugn takt. Välj din karaktärs riktiga level med + och −. Bocka av sådant du gjort. Inför en dungeon: bestäm roller och hämta uppdragen tillsammans.</p></div><div class="glossary-grid">${D.glossary.map(t => L.h`<article class="glossary-term"><h3>${esc(t.title)}</h3><p>${esc(t.desc)}</p></article>`).join('')}</div>`;
  }
  function searchPage() {
    const c = character(),
      tokens = T.normalise(query).split(/\s+/).filter(Boolean);
    const talents = Object.entries(DB.classes).flatMap(([classId, cl]) => cl.trees.flatMap(t => t.talents.map(tal => ({
      id: 'talent-' + tal.id,
      category: 'talents',
      classId,
      title: tal.name,
      desc: t.name,
      source: 'https://www.wowhead.com/forever/spell=' + tal.spell,
      level: 1,
      status: 'sourced'
    }))));
    const zoneMatches = T.searchZones(D.zones, query, c, 100),
      zoneMap = new Map();
    for (const r of zoneMatches) if (!zoneMap.has(r.zoneId)) zoneMap.set(r.zoneId, r.label);
    const all = [...D.quests, ...D.misc, ...D.dungeons, ...D.zones, ...DB.abilities, ...D.professions, ...D.glossary, ...D.controls, ...talents];
    const results = all.filter(item => Q.available(item,c,D.quests,C.questDone) && T.visibleAtHelp(item, c) && (searchEveryone || item.category === 'zones' || C.matchesCharacter(item, c)) && (item.category === 'zones' ? zoneMap.has(item.id) : tokens.every(t => T.normalise(JSON.stringify([item.title, item.desc, item.steps, item.quests, item.location, item.reward, item.item, item.aliases, item.keys?.map(controlLabel)])).includes(t))));
    return L.h`<div class="section-top"><h2>${results.length} ${bi('results for', 'träffar för')} ”${esc(query)}”</h2><button class="text-button" data-action="clear-search">${bi('Clear search', 'Rensa sökning')} ${icon('close')}</button></div><div class="quest-list">${results.length ? results.slice(0, 100).map(item => item.category === 'controller' ? controllerCard(item) : item.category === 'dungeons' ? dungeonCard(item, searchEveryone) : item.category === 'zones' ? zoneCard(item, zoneMap.get(item.id)) : item.category === 'glossary' ? L.h`<article class="glossary-term"><h3>${esc(item.title)}</h3><p>${esc(item.desc)}</p></article>` : item.category === 'talents' ? L.h`<article class="info-card"><div class="card-meta">${bi('TALENT', 'TALANG')} · ${esc(DB.classes[item.classId].name)} · ${esc(item.desc)}</div><h3>${esc(item.title)}</h3>${sourceLine(item)}</article>` : questCard(item)).join('') : empty(bi('No result yet', 'Ingen träff ännu'), bi('Try a zone, subzone, English game name or controller function.', 'Prova en zon, subzon, ett engelskt spelnamn eller en handkontrollsfunktion.'))}</div>`;
  }
  function renderContent() {
    const c = character();
    if (c.blank) {
      $('#content').innerHTML = welcome();
      return;
    }
    $('#search-options').hidden = !query;
    let html;
    if (query) html = searchPage();else if (page === 'overview') html = overview();else if (page === 'zone-guide') html = zoneGuide();else if (page === 'controller') html = controllerPage();else if (C.CATEGORIES.includes(page) && !c.filters.categories.includes(page)) html = L.h`<div class="empty-state">${icon('sliders')}<h3>Kategorin är dold</h3><p>Du har dolt ${L.t(categoryNames[page]).toLowerCase()} för den här karaktären.</p><button class="secondary-button" data-action="filters">Ändra kategorier</button></div>`;else if (page === 'talents') html = talents();else if (page === 'quests') html = questsPage();else if (page === 'dungeons') html = dungeonsPage();else if (page === 'zones') html = zonesPage();else if (page === 'abilities') html = abilitiesPage();else if (page === 'gear') html = gearPage();else if (page === 'professions') html = professionsPage();else if (page === 'glossary') html = glossaryPage();else if (page === 'notes') html = L.h`<section class="info-card"><h2>Till nästa gång</h2><p style="margin-top:10px">Skriv ned nästa quest, var du parkerade karaktären eller vad du vill göra med gruppen.</p><label class="form-field"><span>Anteckningar för ${esc(c.name)}</span><textarea id="character-notes" class="notes-area" placeholder="Nästa gång ska jag…">${esc(c.notes)}</textarea></label><span class="note-footer">Sparas automatiskt för den här karaktären.</span></section>`;else {
      page = 'overview';
      html = overview();
    }
    $('#content').innerHTML = html;
  }
  function go(id, back = false) {
    const nextPage = nav.some(n => n[0] === id) ? id : 'overview';
    if (!back && (page !== nextPage || query)) navTrail.push({
      page,
      query
    });
    page = nextPage;
    query = '';
    $('#search').value = '';
    history.pushState(null, '', '#' + page);
    closeMenu();
    renderShell();
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }
  function closeMenu() {
    $('#sidebar').classList.remove('open');
    $('#menu-backdrop').hidden = true;
  }
  function dialog(title, body, footer = '') {
    const el = $('#dialog');
    if (!el.open) dialogTrail = [];else if (title !== dialogTitle) dialogTrail.push({
      title: dialogTitle,
      html: $('#dialog-content').innerHTML
    });
    dialogTitle = title;
    $('#dialog-content').innerHTML = `<div class="dialog-top"><button class="icon-button" data-action="back" aria-label="${bi('Back', 'Tillbaka')}">${icon('back')}</button><h2>${title}</h2><button class="icon-button" data-action="close-dialog" aria-label="${bi('Close dialog', 'Stäng dialog')}">${icon('close')}</button></div><div class="dialog-body">${body}</div>${footer ? `<div class="dialog-footer">${footer}</div>` : ''}`;
    if (!el.open) el.showModal();
  }
  function charactersDialog() {
    dialog(L.t('Dina karaktärer'), L.h`<p>Välj vem som fortsätter äventyret. Varje karaktär har egna framsteg och inställningar.</p><div class="character-list">${state.characters.map(c => L.h`<button class="character-option ${c.id === state.activeId ? 'active' : ''}" data-character="${c.id}">${avatar(c)}<div><strong>${esc(c.name || bi('New character', 'Ny karaktär'))}${c.demo ? L.m(' · Exempel') : ''}</strong><small>Level ${c.level} · ${esc(c.race)} ${DB.classes[c.classId]?.name || ''} · ${c.faction}</small></div>${c.id === state.activeId ? icon('check') : icon('arrow')}</button>`).join('')}</div><div class="character-actions"><button class="primary-button" data-action="new-character">${icon('plus')} Ny karaktär</button><button class="secondary-button" data-action="edit-character">${icon('edit')} Redigera vald</button></div>`);
  }
  function characterForm(edit = false) {
    const c = edit ? character() : C.createCharacter({
        classId: 'warrior',
        race: 'Orc',
        faction: 'Horde'
      }),
      configured = !!c.classId,
      primary = D.professions.filter(p => !R.secondary.includes(p.title)),
      secondary = D.professions.filter(p => R.secondary.includes(p.title));
    dialog(edit ? bi('Your character', 'Din karaktär') : bi('New character', 'Ny karaktär'), `<form id="character-form" data-edit="${edit}"><div class="form-grid"><label class="form-field wide"><span>${bi('Character name', 'Karaktärens namn')}</span><input name="name" value="${edit ? esc(c.name) : ''}" maxlength="50" required autocomplete="off"></label><label class="form-field"><span>${bi('Class', 'Klass')}</span><select name="classId" required ${edit && configured ? 'disabled' : ''}>${!configured ? `<option value="">${bi('Choose class', 'Välj klass')}</option>` : ''}${Object.entries(DB.classes).map(([id, cl]) => `<option value="${id}" ${c.classId === id ? 'selected' : ''}>${cl.name}</option>`).join('')}</select></label><label class="form-field"><span>Faction</span><select name="faction" required><option ${c.faction === 'Horde' ? 'selected' : ''}>Horde</option><option ${c.faction === 'Alliance' ? 'selected' : ''}>Alliance</option></select></label><label class="form-field"><span>${bi('Race', 'Ras')}</span><select name="race" required></select></label><label class="form-field"><span>Level</span><input name="level" type="number" min="1" max="60" value="${c.level}" required></label><label class="form-field" id="role-field"><span>${bi('Role', 'Roll')}</span><select name="role"></select></label></div>${[[primary, bi('Primary professions · choose up to 2', 'Huvudprofessions · välj högst 2'), 'primary'], [secondary, bi('Secondary professions · choose any', 'Sekundära professions · välj fritt'), 'secondary']].map(([ps, title, kind]) => `<fieldset class="profession-group"><legend>${title}</legend><div class="profession-options">${ps.map(p => `<label class="form-check"><input type="checkbox" name="professions" data-profession-kind="${kind}" value="${esc(p.title)}" ${c.professions.includes(p.title) ? 'checked' : ''}>${gameIcon(window.GAME_ASSETS.professions[p.title])}<span>${esc(p.title)}</span></label>`).join('')}</div></fieldset>`).join('')}<div id="form-error" class="error-text" hidden></div><button type="submit" hidden></button></form>`, `<button class="secondary-button" data-action="close-dialog">${bi('Cancel', 'Avbryt')}</button><button class="primary-button" type="submit" form="character-form">${bi('Save character', 'Spara karaktär')}</button>`);
    updateCharacterOptions(c.race, c.role);
    limitProfessions();
  }
  function filterDialog() {
    const c = character();
    dialog(L.t('Välj vad du vill se'), L.h`<p>Inställningarna gäller ${esc(c.name)}. Sökfunktionen hittar även innehåll i dolda kategorier.</p><div class="filter-options">${C.CATEGORIES.map(cat => L.h`<label class="filter-option">${icon(categoryIcons[cat])}<span>${L.t(categoryNames[cat])}</span><input type="checkbox" data-category="${cat}" ${c.filters.categories.includes(cat) ? 'checked' : ''}></label>`).join('')}</div>`, L.h`<button class="secondary-button" data-action="all-categories">Visa alla kategorier</button><button class="primary-button" data-action="close-dialog">Klart</button>`);
  }
  function settings() {
    if ($('#dialog').open && $('#language-select')) dialogTitle = L.t('Inställningar & backup');
    dialog(L.t('Inställningar & backup'), L.h`${preferencesMarkup()}<div class="settings-row"><span><strong>Automatisk sparning</strong><small>${brokenRaw ? L.t('Lagringen behöver ses över. Exportera säkerhetskopian nedan.') : foreignChange ? L.t('En annan flik har ändrat datan. Exportera ditt arbete och ladda sedan om.') : L.t('Aktiv i den här webbläsaren för alla karaktärer.')}</small></span>${icon(brokenRaw || foreignChange ? 'warning' : 'check')}</div><div class="settings-row"><span><strong>Offlineläge</strong><small>${location.protocol === 'file:' ? L.t('Öppna den publicerade sidan för att aktivera offlinecache.') : navigator.serviceWorker?.controller ? L.t('Guidens lokala filer är tillgängliga offline.') : L.t('Aktiveras när sidan har laddats via HTTPS.')}</small></span>${icon('wifi')}</div><div class="backup-notice">Profilerna finns i denna webbläsare. Exportera en backup om du ska byta enhet eller rensa webbplatsdata.</div><h3>Exportera och importera</h3><div class="button-row"><button class="primary-button" data-action="export">${icon('download')} Alla karaktärer</button><button class="secondary-button" data-action="export-character">${icon('download')} Bara ${esc(character().name)}</button><button class="secondary-button" data-action="import-backup">${icon('upload')} Importera backup</button>${brokenRaw ? L.m('<button class="danger-button" data-action="export-raw">Spara tidigare rådata</button>') : ''}</div><p class="field-hint" style="margin-top:12px">Importerade karaktärer läggs till som nya profiler. Dina befintliga profiler behålls.</p><h3>Vald karaktär</h3><div class="button-row"><button class="secondary-button" data-action="edit-character">${icon('edit')} Redigera ${esc(character().name)}</button><button class="danger-button" data-action="delete-character" ${state.characters.length <= 1 ? 'disabled' : ''}>Ta bort karaktär</button></div>${brokenRaw ? L.m('<div class="backup-notice">Tidigare data har skyddats från överskrivning. Exportera den först. Du kan sedan välja att starta om den lokala sparningen.</div><button class="danger-button" data-action="reset-broken">Starta om lokal sparning</button>') : ''}`);
  }
  function about() {
    dialog(L.t('Om guiden & källor'), L.h`<p>${esc(D.notes)}</p><div class="backup-notice">Funktionerna fungerar för alla nio klasser. Innehållet är ett första urval. Klassquests kan ha flera rasvarianter; exakta NPC:er och belöningar kompletteras där de saknas.</div><h3>Vad betyder statusen?</h3><p><strong>Källuppgift:</strong> hittad i aktuell Forever-källa, inte självtestad i spelet.<br><strong>Preliminärt:</strong> behöver mer kontroll eller bättre underlag.<br><strong>Praktiskt tips:</strong> redaktionellt råd.</p><h3>Huvudkällor</h3><ul class="sources-list"><li><a href="https://www.wowhead.com/forever/talent-calc" target="_blank" rel="noopener noreferrer">Wowheads Forever-kalkylator</a><small>Talangnamn, ranktak, förkrav, poänglänkar och första träningsnivåer. Dataversion v2, hämtad ${DB.updated}.</small></li><li><a href="${D.sources.wave}" target="_blank" rel="noopener noreferrer">Wavebreaker Shaman Hybrid</a><small>Utgångspunkt för den modifierade Shaman-planen. Talangnamn följer aktuella kalkylatordata.</small></li><li><a href="${D.sources.dungeons}" target="_blank" rel="noopener noreferrer">Forever dungeonöversikt</a><small>Rekommenderade intervall. Separata dungeonkällor finns i korten.</small></li><li><a href="${D.sources.camp}" target="_blank" rel="noopener noreferrer">Forever Camping</a></li><li><a href="${D.sources.zones}" target="_blank" rel="noopener noreferrer">Forever-zondatabasen</a><small>Levelintervall och inträdesuppgifter. Nollvärden tolkas som okänt krav.</small></li></ul><h3>${bi('Controller source', 'Handkontrollskälla')}</h3><p><a href="https://github.com/Gethe/wow-ui-source/tree/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns" target="_blank" rel="noopener noreferrer">${bi('Blizzard client UI source · Forever branch', 'Blizzards UI-kod · Forever-grenen')}</a></p><p class="small">${bi('Button actions come from the client UI code, not an in-game test. The game’s own prompts take precedence.', 'Knappfunktionerna kommer från klientens UI-kod och är inte testade i spelet. Spelets egna knappförklaringar gäller i första hand.')}</p><h3>Senaste ändringar</h3><div class="changelog">${D.changelog.map(x => L.h`<strong>${esc(x.version)} · ${x.date}</strong><p>${esc(x.text)}</p>`).join('')}</div><p class="small">Inofficiellt hjälpmedel. World of Warcraft tillhör Blizzard Entertainment. Guidens egna profiluppgifter skickas inte till en server.</p>`);
  }
  let pendingBuild = null;
  function importBuild() {
    pendingBuild = null;
    dialog(L.t('Importera från Wowhead'), L.h`<p>Öppna kalkylatorn för Forever, välj dina talents och klistra in hela delningslänken. En sparad poängordning importeras också.</p><form id="build-import-form"><label class="form-field"><span>Buildens namn</span><input name="name" maxlength="80" placeholder="Till exempel Solo eller Resto"></label><label class="form-field" style="margin-top:13px"><span>Wowhead-länk</span><input name="url" type="url" required placeholder="https://www.wowhead.com/forever/talent-calc/…"></label><div id="build-import-error" class="error-text" hidden></div><div id="build-import-preview"></div></form><p style="margin-top:15px"><a class="small" href="https://www.wowhead.com/forever/talent-calc/${character().classId}" target="_blank" rel="noopener noreferrer">Öppna ${esc(klass().name)}-kalkylatorn ${icon('external')}</a></p>`, L.h`<button class="secondary-button" data-action="close-dialog">Avbryt</button><button class="primary-button" type="submit" form="build-import-form">Läs in och granska</button><button class="primary-button" data-action="save-build" id="save-build" hidden>Spara build</button>`);
  }
  function download(filename, text) {
    const blob = new Blob([text], {
        type: 'application/json;charset=utf-8'
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportBackup(single = false) {
    const data = single ? {
      ...state,
      characters: [character()],
      activeId: character().id
    } : state;
    download('fardvag-' + (single ? character().name.replace(/[^a-zA-Z0-9-]/g, '-') : 'backup') + '-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(data, null, 2));
    notify(L.t('Backup exporterad.'));
  }
  function changeLevel(value) {
    const c = character();
    c.level = C.clamp(value, 1, 60);
    save();
    renderShell();
  }
  document.addEventListener('click', async e => {
    const target = e.target.closest('button,[data-page]');
    if (!target) return;
    if (target.dataset.selectZone) {
      const c = character(),
        z = D.zones.find(z => z.id === target.dataset.selectZone);
      if (!z) return;
      const place = target.dataset.place || z.title;
      c.currentZone = z.id;
      c.currentPlace = [z.title, ...z.places].includes(place) ? place : z.title;
      save();
      $('#dialog').close();
      go(page === 'overview' ? 'overview' : 'zone-guide');
      return;
    }
    if (target.dataset.talent) {
      const [tree, index] = target.dataset.talent.split(':').map(Number),
        tal = klass().trees[tree]?.talents[index];
      if (tal) dialog(esc(tal.name),talentInfo(tree,index));
      return;
    }
    if (target.dataset.page) {
      go(target.dataset.page);
      return;
    }
    if (target.dataset.view) {
      character().filters.view = target.dataset.view;
      save();
      renderContent();
      return;
    }
    if (target.dataset.character) {
      state.activeId = target.dataset.character;
      save();
      $('#dialog').close();
      renderShell();
      notify(L.m('Fortsätter med ') + character().name);
      return;
    }
    if (target.dataset.term) {
      const t = D.glossary.find(t => t.title === target.dataset.term);
      if (t) dialog(esc(t.title), L.h`<p>${esc(t.desc)}</p>`);
      return;
    }
    if (target.dataset.dungeon) {
      const d = D.dungeons.find(d => d.id === target.dataset.dungeon);
      if (d) dialog(esc(d.title), dungeonCard(d));
      return;
    }
    if (target.dataset.copy) {
      try {
        await navigator.clipboard.writeText(target.dataset.copy);
        notify(L.m('Koordinater kopierade.'));
      } catch {
        dialog(L.t('Koordinater'), L.h`<label class="form-field"><span>Kopiera raden</span><input readonly value="${esc(target.dataset.copy)}"></label>`);
      }
      return;
    }
    const a = target.dataset.action,
      c = character();
    if (a === 'choose-zone') {
      zoneDialog();
      return;
    }
    if (a === 'back') {
      goBack();
      return;
    }
    if (a === 'request-delete-build') {
      const build = activeBuild();
      if (build) dialog(bi('Delete build?', 'Ta bort build?'), `<p>${esc(build.name)}</p>`, `<button class="secondary-button" data-action="close-dialog">${bi('Cancel', 'Avbryt')}</button><button class="danger-button" data-action="delete-build">${bi('Delete build', 'Ta bort build')}</button>`);
      return;
    }
    if (a === 'level-up') changeLevel(c.level + 1);else if (a === 'level-down') changeLevel(c.level - 1);else if (a === 'menu') {
      $('#sidebar').classList.toggle('open');
      $('#menu-backdrop').hidden = !$('#sidebar').classList.contains('open');
    } else if (a === 'beginner') {
      c.beginner = !c.beginner;
      save();
      renderShell();
      notify(c.beginner ? L.t('Nybörjarläge på.') : L.t('Nybörjarläge av.'));

    } else if (a === 'characters') charactersDialog();else if (a === 'new-character') characterForm(false);else if (a === 'edit-character') characterForm(true);else if (a === 'close-dialog') $('#dialog').close();else if (a === 'filters') filterDialog();else if (a === 'all-categories') {
      c.filters.categories = [...C.CATEGORIES];
      save();
      renderShell();
      filterDialog();
    } else if (a === 'settings') settings();else if (a === 'about') about();else if (a === 'import-build') importBuild();else if (a === 'save-build' && pendingBuild) {
      c.builds.push(pendingBuild);
      c.activeBuild = pendingBuild.id;
      pendingBuild = null;
      save();
      $('#dialog').close();
      go('talents');
      notify(L.t('Build och eventuell poängordning sparad.'));
    } else if (a === 'add-wavebreaker') {
      const b = builtIn();
      c.builds.push(b);
      c.activeBuild = b.id;
      save();
      renderContent();
    } else if (a === 'edit-build') {
      const b = activeBuild();
      dialog(L.t('Redigera build'), L.h`<form id="build-edit-form"><label class="form-field"><span>Namn</span><input name="name" maxlength="80" value="${esc(b.name)}" required></label></form><button class="danger-button" style="margin-top:20px" data-action="delete-build">Ta bort denna build</button>`, L.h`<button class="secondary-button" data-action="close-dialog">Avbryt</button><button class="primary-button" type="submit" form="build-edit-form">Spara</button>`);
    } else if (a === 'delete-build') {
      const id = c.activeBuild;
      c.builds = c.builds.filter(b => b.id !== id);
      c.activeBuild = c.builds[0]?.id || null;
      save();
      $('#dialog').close();
      renderContent();
    } else if (a === 'export') exportBackup();else if (a === 'export-character') exportBackup(true);else if (a === 'import-backup') $('#backup-file').click();else if (a === 'export-raw') download('fardvag-tidigare-radata.json', brokenRaw || '');else if (a === 'reset-broken') dialog(L.t('Starta om lokal sparning?'), L.h`<p>Spara din tidigare rådata först. När du fortsätter ersätts den tidigare sparfilen av de profiler som nu visas.</p>`, L.h`<button class="secondary-button" data-action="close-dialog">Avbryt</button><button class="danger-button" data-action="confirm-reset">Starta om sparningen</button>`);else if (a === 'confirm-reset') {
      brokenRaw = null;
      foreignChange = false;
      save();
      $('#dialog').close();
      notify(L.t('Lokal sparning omstartad.'));
    } else if (a === 'delete-character' && state.characters.length > 1) dialog(L.m('Ta bort ') + esc(c.name) + '?', L.h`<p>Karaktärens lokala framsteg tas bort. Du kan exportera en backup först från inställningarna.</p>`, L.h`<button class="secondary-button" data-action="close-dialog">Avbryt</button><button class="danger-button" data-action="confirm-delete">Ta bort karaktären</button>`);else if (a === 'confirm-delete' && state.characters.length > 1) {
      state.characters = state.characters.filter(x => x.id !== c.id);
      state.activeId = state.characters[0].id;
      save();
      $('#dialog').close();
      renderShell();
    } else if (a === 'clear-search') {
      query = '';
      $('#search').value = '';
      renderContent();
      $('#search').focus();
    } else if (a === 'update-app') location.reload();
  });
  function bi(en, sv) {
    return L.t({
      en,
      sv
    });
  }
  function applyPreferences() {
    L.setLanguage(state.settings.language);
    D = L.localize(RAW);
    document.documentElement.lang = L.language;
    document.documentElement.dataset.theme = state.settings.theme;
    document.title = 'Questbound · Forever guide';
    document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = L.t(el.dataset.i18n));
    document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', L.t(el.dataset.i18nAria)));
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => el.placeholder = L.t(el.dataset.i18nPlaceholder));
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  }
  function helpControl(prefix = 'session') {
    const c = character(),
      level = T.help[c.helpLevel - 1];
    return L.h`<label class="help-control" for="${prefix}-help-level"><span><span>${bi('Leveling assistance', 'Levelinghjälp')}</span><output id="${prefix}-help-value" for="${prefix}-help-level">${c.helpLevel}/4 · ${esc(level[L.language])}</output></span><input id="${prefix}-help-level" data-help-level="${prefix}" type="range" min="1" max="4" step="1" value="${c.helpLevel}" aria-valuetext="${esc(level[L.language])}"><span class="help-ticks"><span>${bi('A little', 'Lite')}</span><span>${bi('Every documented step', 'Varje dokumenterat steg')}</span></span></label><p id="${prefix}-help-description">${esc(level.desc[L.language])}</p>`;
  }
  function sessionPanel() {
    const c = character(),
      z = D.zones.find(z => z.id === c.currentZone);
    return `<section class="session-panel"><div><h2>${icon('pin')} ${bi('Current zone', 'Nuvarande zon')}</h2><div class="session-zone-name">${z ? esc(z.title) : bi('Choose a zone', 'Välj en zon')}</div>${c.currentPlace && z && c.currentPlace !== z.title ? `<p>${esc(c.currentPlace)}</p>` : ''}</div><button class="secondary-button" data-action="choose-zone">${icon('search')} ${bi('Find zone or subzone', 'Sök zon eller subzon')}</button></section>`;
  }
  function zoneDialog() {
    dialog(bi('Where are you in Azeroth?', 'Var i Azeroth är du?'), L.h`<p>${bi('Search for a zone, town or subzone. Choosing Crossroads selects The Barrens automatically.', 'Sök efter en zon, ort eller subzon. Väljer du Crossroads väljs The Barrens automatiskt.')}</p><label class="form-field"><span>${bi('Zone or subzone', 'Zon eller subzon')}</span><input id="zone-search" type="search" placeholder="Crossroads, Ratchet, Silverpine Forest…" autocomplete="off"></label><div id="zone-results" class="zone-picker-results" aria-live="polite"></div><p class="field-hint" style="margin-top:12px">${bi('Names match the English game client. More local place names can be added over time.', 'Namnen matchar den engelska spelklienten. Fler lokala platsnamn kan läggas till efter hand.')}</p>`);
    renderZoneResults('');
    $('#zone-search').focus();
  }
  function renderZoneResults(value) {
    const c = character();
    let results = value.trim() ? T.searchZones(D.zones, value, c, 14) : recommendedZones().filter(z => !z.isCity).slice(0, 10).map(z => ({
      zoneId: z.id,
      zoneTitle: z.title,
      label: z.title,
      isSubzone: false
    }));
    if (!results.length && !value.trim()) results = D.zones.slice(0, 10).map(z => ({
      zoneId: z.id,
      zoneTitle: z.title,
      label: z.title,
      isSubzone: false
    }));
    $('#zone-results').innerHTML = results.length ? results.map(r => L.h`<button class="zone-choice" data-select-zone="${esc(r.zoneId)}" data-place="${esc(r.label)}"><span><strong>${esc(r.label)}</strong><small>${r.isSubzone ? bi('In', 'I') + ' ' + esc(r.zoneTitle) : bi('Zone', 'Zon')}</small></span>${icon('arrow')}</button>`).join('') : L.h`<p>${bi('No matching zone or subzone yet. Try a shorter English name.', 'Ingen matchande zon eller subzon ännu. Prova ett kortare engelskt namn.')}</p>`;
  }
  function zoneGuide() {
    const c = character(),
      z = D.zones.find(z => z.id === c.currentZone);
    if (!z) return sessionPanel() + L.h`<div class="empty-state">${icon('map')}<h2>${bi('Choose a zone to see local guidance', 'Välj en zon för att se lokal hjälp')}</h2><p>${bi('You can search using a town or subzone name too.', 'Du kan även söka med namnet på en ort eller subzon.')}</p><button class="primary-button" data-action="choose-zone">${bi('Find my zone', 'Hitta min zon')}</button></div>`;
    const qs = T.questsForZone(D, z, c, C.matchesCharacter).filter(q => Q.available(q,c,D.quests,C.questDone) && c.filters.categories.includes(q.category) && (c.filters.showDone || !C.questDone(q, c)) && (c.filters.view === 'all' || q.level <= c.level + 10)).sort((a,b)=>a.level-b.level||a.title.localeCompare(b.title));
    const dungeons = D.dungeons.filter(d => z.dungeonIds.includes(d.id) && (d.faction === 'Both' || d.faction === c.faction));
    const localSteps = z.localSteps || [];
    let html = L.h`<section class="info-card zone-guide-intro"><div class="zone-heading"><div><div class="eyebrow">${bi('YOUR CURRENT ZONE', 'DIN NUVARANDE ZON')}</div><h2>${esc(z.title)}</h2></div><button class="secondary-button" data-action="choose-zone">${bi('Change zone', 'Byt zon')}</button></div>${c.currentPlace && c.currentPlace !== z.title ? L.h`<p>${esc(c.currentPlace)} ${bi('is part of', 'är en del av')} <strong>${esc(z.title)}</strong>.</p>` : ''}<p>${esc(c.beginner && z.beginnerDesc ? z.beginnerDesc : z.desc)}</p><div class="card-meta"><span class="level-tag">${z.isCity ? bi('Capital city', 'Huvudstad') : 'Level ' + z.level + '–' + z.maxLevel}</span><span>${c.level < z.level ? bi('You are below this zone’s listed range.', 'Du är under zonens angivna intervall.') : c.level > z.maxLevel ? bi('You are above this zone’s listed range.', 'Du är över zonens angivna intervall.') : bi('Your level is within the listed range.', 'Din level ligger inom det angivna intervallet.')}</span></div>${z.faction !== 'Both' && z.faction !== c.faction ? L.h`<p class="error-text">${bi('This zone is mainly associated with', 'Zonen hör främst till')} ${esc(z.faction)}.</p>` : ''}${sourceLine(z)}</section>`;
    if (c.helpLevel >= 2 && c.filters.categories.includes('tips') && localSteps.length) html += L.h`<section class="info-card"><h2>${bi('A useful order for this zone', 'En användbar ordning i zonen')}</h2><p class="small">${bi('Suggested preparation, not a complete quest route.', 'Förslag på förberedelser, inte en komplett questrutt.')}</p><ol class="zone-route">${localSteps.map(s => L.h`<li>${esc(s)}</li>`).join('')}</ol></section>`;
    if (c.filters.categories.includes('quests') || c.filters.categories.includes('tips')) html += L.h`<section class="zone-section"><div class="section-top"><h2>${bi('Quests and tasks linked to this zone', 'Quests och uppgifter kopplade till zonen')}</h2><button class="text-button" data-page="quests">${bi('Class quests', 'Klassquests')}</button></div>${qs.length ? L.h`<div class="quest-list">${qs.map(questCard).join('')}</div>` : L.h`<p class="small">${bi('No additional quests are mapped to this zone for your current character in this guide. Check the dungeon quests below or open the source for the zone.', 'Inga ytterligare quests är kopplade till zonen för din karaktär i guidens nuvarande urval. Kontrollera dungeonquestsen nedan eller öppna zonens källa.')}</p>`}</section>`;
    if (c.filters.categories.includes('dungeons')) html += L.h`<section class="zone-section"><div class="section-top"><h2>${bi('Dungeons in this zone · prepare their quests', 'Dungeons i zonen · förbered deras quests')}</h2></div>${dungeons.length ? L.h`<div class="card-grid">${dungeons.map(d => dungeonCard(d)).join('')}</div>` : L.h`<p class="small">${bi('No dungeons are mapped to this zone in the current guide.', 'Inga dungeons är kopplade till zonen i guidens nuvarande urval.')}</p>`}</section>`;
    if (c.helpLevel >= 3) html += L.h`<div class="coverage-note">${icon('info')}<span>${bi('Detailed mode expands documented quest steps. The current guide does not yet contain a complete quest-by-quest route for every zone.', 'Detaljerat läge öppnar dokumenterade queststeg. Guiden innehåller ännu inte en komplett questrutt för varje zon.')}</span></div>`;
    return html + coverage();
  }
  function controlLabel(key) {
    const device = character().controller;
    const xbox = {
      MENU: 'Menu',
      VIEW: 'View',
      LS: bi('Left stick', 'Vänster spak'),
      RS: bi('Right stick', 'Höger spak'),
      R3: bi('Right stick click', 'Tryck på höger spak'),
      DPAD: 'D-pad',
      'DPAD-UP': 'D-pad ↑',
      'DPAD-DOWN': 'D-pad ↓',
      'DPAD-LEFT': 'D-pad ←',
      'DPAD-RIGHT': 'D-pad →',
      'FACE / DPAD': 'A / B / X / Y / D-pad',
      'CLASS FLYOUT': bi('Class flyout · see game legend', 'Klassflyout · se spelets knappförklaring')
    };
    const ps = {
      A: '✕',
      B: '○',
      X: '□',
      Y: '△',
      LB: 'L1',
      RB: 'R1',
      LT: 'L2',
      RT: 'R2',
      MENU: 'Options',
      VIEW: 'Create / Share',
      'FACE / DPAD': '✕ / ○ / □ / △ / D-pad'
    };
    const generic = {
      A: bi('Bottom face button', 'Nedre frontknapp'),
      B: bi('Right face button', 'Höger frontknapp'),
      X: bi('Left face button', 'Vänster frontknapp'),
      Y: bi('Top face button', 'Övre frontknapp'),
      LB: bi('Left shoulder', 'Vänster axelknapp'),
      RB: bi('Right shoulder', 'Höger axelknapp'),
      LT: bi('Left trigger', 'Vänster avtryckare'),
      RT: bi('Right trigger', 'Höger avtryckare'),
      MENU: bi('Right menu button', 'Höger menyknapp'),
      VIEW: bi('UI focus button', 'UI-fokusknapp'),
      'FACE / DPAD': bi('Face buttons / D-pad', 'Frontknappar / styrkors')
    };
    const map = {
      ...xbox,
      ...(device === 'playstation' ? ps : device === 'generic' ? generic : {})
    };
    if (map[key]) return map[key];
    return key.split(' + ').map(k => k.split(' / ').map(p => map[p] || p).join(' / ')).join(' + ');
  }
  function controllerCard(item) {
    const groups = {
      basics: bi('Movement and interaction', 'Rörelse och interaktion'),
      menus: bi('Menus', 'Menyer'),
      navigation: bi('Panel navigation', 'Panelnavigation'),
      shortcuts: bi('Direct shortcuts', 'Direkta genvägar'),
      targeting: bi('Target selection', 'Målval'),
      actions: bi('Action bars', 'Actionbars'),
      settings: bi('Game settings', 'Spelinställningar'),
      classes: bi('Class functions', 'Klassfunktioner')
    };
    return L.h`<article class="controller-card"><div class="controller-group">${groups[item.group] || item.group}</div><h3>${esc(item.title)}</h3><div class="controller-keys">${item.keys.map((k, i) => L.h`${i ? '<span aria-hidden="true">' + icon('arrow') + '</span>' : ''}<kbd>${esc(controlLabel(k))}</kbd>`).join('')}</div><p>${esc(item.desc)}</p>${state.settings.showSourceLinks?`<a class="small" href="${esc(item.source)}" target="_blank" rel="noopener noreferrer">${bi('Client source','Klientkälla')} ${utilityIcon('external')}</a>`:''}</article>`;
  }
  function controllerMatches(item, value) {
    const tokens = T.normalise(value).split(/\s+/).filter(Boolean);
    return tokens.every(t => T.normalise([item.title, item.desc, item.aliases, item.keys.map(controlLabel)].flat().join(' ')).includes(t));
  }
  function controllerPage() {
    const rows = D.controls.filter(r => (controllerGroup === 'all' || r.group === controllerGroup) && controllerMatches(r, controllerQuery));
    return L.h`<div class="info-card"><h2>${bi('Controller reference for Forever', 'Handkontrollsguide för Forever')}</h2><p>${bi('Use Forever’s native gamepad UI. Choose your button labels and search for an action, such as map, bags or target yourself.', 'Använd Forevers inbyggda handkontrollsgränssnitt. Välj knappnamn och sök en funktion, till exempel karta, väskor eller välj dig själv.')}</p><div class="controller-legend"><span>${bi('LB / RB = shoulders', 'LB / RB = axelknappar')}</span><span>${bi('LT / RT = triggers', 'LT / RT = avtryckare')}</span><span>${bi('+ = hold together', '+ = håll samtidigt')}</span><span>${bi('→ = then', '→ = därefter')}</span></div></div><div class="controller-notice">${bi('Based on the Forever client UI source, checked 26 October 2026; not tested on your controller. In-game prompts take precedence. Targeting-side swaps, toggle modifiers and available panels can change the sequence. Menu/View openers and device labels should be checked against the game’s on-screen legend.', 'Bygger på Forever-klientens UI-kod, kontrollerad 26 oktober 2026; inte testad på din handkontroll. Spelets knappförklaring gäller i första hand. Sidbyte för målval, toggle-modifierare och tillgängliga paneler kan ändra sekvensen. Kontrollera Menu/View-knappar och enhetens namn mot spelets knappförklaring.')}</div><div class="controller-toolbar"><label class="form-field"><span>${bi('Find a function', 'Sök en funktion')}</span><input id="controller-search" type="search" value="${esc(controllerQuery)}" placeholder="${bi('Map, bags, jump, heal, party…', 'Karta, väskor, hoppa, heala, grupp…')}"></label><label class="form-field"><span>${bi('Button labels', 'Knappnamn')}</span><select id="controller-device">${[['xbox', 'Xbox'], ['playstation', 'PlayStation'], ['generic', bi('Generic', 'Generiska')]].map(([v, n]) => L.h`<option value="${v}" ${character().controller === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label><label class="form-field"><span>${bi('Section', 'Avsnitt')}</span><select id="controller-group">${[['all', bi('All functions', 'Alla funktioner')], ['basics', bi('Basics', 'Grunder')], ['menus', bi('Menus', 'Menyer')], ['navigation', bi('Navigation', 'Navigation')], ['shortcuts', bi('Shortcuts', 'Genvägar')], ['targeting', bi('Targeting', 'Målval')], ['actions', 'Actionbars'], ['settings', bi('Settings', 'Inställningar')], ['classes', bi('Class functions', 'Klassfunktioner')]].map(([v, n]) => L.h`<option value="${v}" ${controllerGroup === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label></div><div id="controller-results"><p class="controller-result-count">${rows.length} / ${D.controls.length} ${bi('functions', 'funktioner')}</p><div class="controller-grid">${rows.map(controllerCard).join('') || L.h`<p>${bi('No matching function. Try a different word.', 'Ingen matchande funktion. Prova ett annat ord.')}</p>`}</div></div>`;
  }
  function preferencesMarkup() {
    const c = character();
    return L.h`<section class="settings-preferences"><h3>${bi('Language and appearance', 'Språk och utseende')}</h3><div class="form-grid"><label class="form-field"><span>${bi('Language', 'Språk')}</span><select id="language-select"><option value="en" ${state.settings.language === 'en' ? 'selected' : ''}>English</option><option value="sv" ${state.settings.language === 'sv' ? 'selected' : ''}>Svenska</option></select></label><label class="form-field"><span>${bi('Color theme', 'Färgtema')}</span><select id="theme-select">${[['forest', bi('Forest', 'Skog')], ['dark', 'Dark / OLED'], ['light', bi('Light', 'Ljust')], ['frost', 'Frost'], ['parchment', bi('Parchment', 'Pergament')]].map(([id, name]) => L.h`<option value="${id}" ${state.settings.theme === id ? 'selected' : ''}>${name}</option>`).join('')}</select></label></div><label class="form-check"><input id="source-links-setting" type="checkbox" ${state.settings.showSourceLinks?'checked':''}> ${bi('Show source links','Visa källänkar')}</label><h3>${bi('How much help would you like?', 'Hur mycket hjälp vill du ha?')}</h3>${helpControl('settings')}<label class="form-check"><input id="beginner-setting" type="checkbox" ${c.beginner ? 'checked' : ''}> ${bi('Beginner mode: explain names and show basic reminders', 'Nybörjarläge: förklara namn och visa grundläggande påminnelser')}</label><p class="field-hint">${bi('Assistance and beginner explanations are separate. Each character keeps its own assistance level; language and theme apply to this browser.', 'Hjälpnivå och nybörjarförklaringar är separata. Varje karaktär har egen hjälpnivå; språk och tema gäller i den här webbläsaren.')}</p></section>`;
  }
  function gameIcon(name, alt = '', extra = '') {
    const src = window.GAME_ASSETS?.icons[name];
    return src ? `<img class="game-icon ${extra}" src="${src}" alt="${esc(alt)}" width="36" height="36">` : utilityIcon('sparkles');
  }
  function welcome() {
    return `<section class="empty-state setup-card">${icon('plus')}<h2>${bi('No character configured', 'Ingen karaktär skapad')}</h2><button class="primary-button" data-action="edit-character">${bi('Create character', 'Skapa karaktär')}</button></section>`;
  }
  function positionLabel(s) {
    return `${esc(s.treeName)} · ${bi('Row', 'Rad')} ${s.row + 1} · ${bi('Column', 'Kolumn')} ${s.col + 1}`;
  }
  function talentPointCard(label, s, b) {
    const c = character();
    return `<button class="summary-card talent-point-card" data-page="talents"><span class="summary-title">${icon('zap')} ${label}</span><div class="point-card-main">${s ? gameIcon(window.GAME_ASSETS.talents[s.id]) : icon('zap')}<strong>${s ? esc(s.name) : b ? b.order.length ? bi('No point scheduled', 'Ingen poäng planerad') : bi('No point order imported', 'Ingen poängordning importerad') : bi('Choose a build', 'Välj en build')}</strong></div><small>${s ? 'Level ' + s.level + ' · ' + s.rank + '/' + s.max : bi('Open Talents & Builds', 'Öppna Talents & Builds')}</small><small class="talent-position">${s ? positionLabel(s) : '&nbsp;'}</small></button>`;
  }
  function zoneOverview() {
    const c = character(),
      z = D.zones.find(z => z.id === c.currentZone);
    if (!z) return '';
    const qs = T.questsForZone(D, z, c, C.matchesCharacter).filter(q => Q.available(q,c,D.quests,C.questDone) && c.filters.categories.includes(q.category) && (c.filters.showDone || !C.questDone(q, c)) && q.level <= c.level + 10).sort((a, b) => a.level - b.level),
      ds = c.filters.categories.includes('dungeons') ? D.dungeons.filter(d => z.dungeonIds.includes(d.id) && C.matchesCharacter(d, c) && (c.helpLevel === 4 || d.level <= c.level + 10)) : [],
      steps = c.filters.categories.includes('tips') && c.helpLevel >= 2 ? (z.localSteps || []).slice(0, c.helpLevel === 2 ? 2 : undefined) : [];
    return `<section class="zone-overview info-card"><div class="section-top"><h2>${icon('map')} ${bi('Tips for', 'Tips för')} ${esc(z.title)}</h2><button class="text-button" data-page="zone-guide">${bi('More zone details', 'Mer om zonen')} ${icon('arrow')}</button></div><p>${esc(c.beginner && z.beginnerDesc ? z.beginnerDesc : z.desc)}</p>${z.faction !== 'Both' && z.faction !== c.faction ? `<p class="error-text">${bi('Mainly associated with', 'Hör främst till')} ${esc(z.faction)}</p>` : ''}${steps.length ? `<ol class="zone-route">${steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}${qs.length ? `<div class="quest-list">${qs.map(questCard).join('')}</div>` : ''}${ds.map(d => `<details class="zone-dungeon" ${c.helpLevel >= 3 ? 'open' : ''}><summary>${esc(d.title)} · Level ${d.level}–${d.maxLevel} · ${bi('Quests and preparation', 'Quests och förberedelser')}</summary>${dungeonCard(d)}</details>`).join('')}${sourceLine(z)}</section>`;
  }
  function talentTrees(b) {
 const c=character(),steps=C.buildSteps(b,DB),spent=talentRanks(),now=steps.find(s=>s.level===c.level),next=steps.find(s=>s.level>c.level);
 return `<section class="talent-tree-section"><h2>${bi('Talent trees','Talentträd')}</h2><p class="small">${bi('Ranks show your plan through the current level. Hover or focus for effects; tap to open details.','Ranks visar planen till nuvarande level. Håll musen över eller fokusera för effekttext; tryck för detaljer.')}</p><div class="tree-legend"><span class="current-marker">${bi('This level','Denna level')}</span><span class="next-marker">${bi('Next point','Nästa poäng')}</span></div><div class="talent-trees">${klass().trees.map((t,tree)=>{
 const rows=Math.max(...t.talents.map(x=>x.row))+1,w=280,h=rows*64+20;
 const arrows=t.talents.flatMap(tal=>tal.requires.map(r=>{
  const from=t.talents.find(x=>x.id===r.id);if(!from)return '';
  const x1=35+from.col*70,y1=42+from.row*64,x2=35+tal.col*70,y2=tal.row*64+8;
  const route=from.col===tal.col?`M${x1} ${y1} V${y2}`:`M${x1} ${y1} V${y1+17} H${x2} V${y2}`;
  return `<path class="${spent[tree][t.talents.indexOf(from)]>=r.qty?'met':''}" d="${route}" marker-end="url(#arrow-${tree})"/>`;
 })).join('');
 return `<section class="talent-tree"><h3>${esc(t.name)} <span>${spent[tree].reduce((a,b)=>a+b,0)}</span></h3><div class="talent-board" style="--tree-background:url('./assets/talents/${t.id}.jpg');--tree-height:${h}px"><svg class="talent-arrows" viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs><marker id="arrow-${tree}" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0 0 5 3 0 6Z" fill="context-stroke"/></marker></defs>${arrows}</svg><div class="talent-grid" style="--tree-rows:${rows}">${t.talents.map((tal,index)=>`<button class="talent-node ${spent[tree][index]?'learned':''} ${now?.tree===tree&&now.index===index?'current-point':''} ${next?.tree===tree&&next.index===index?'next-point':''}" data-talent="${tree}:${index}" data-tooltip="${tree}:${index}" style="grid-row:${tal.row+1};grid-column:${tal.col+1}" aria-label="${esc(tal.name)}, ${esc(t.name)}, ${spent[tree][index]}/${tal.max}">${gameIcon(window.GAME_ASSETS.talents[tal.id])}<span class="talent-node-rank">${spent[tree][index]}/${tal.max}</span><span class="sr-only">${esc(tal.name)}</span></button>`).join('')}</div></div></section>`;
 }).join('')}</div></section>`;
}
  function updateCharacterOptions(preferredRace, preferredRole) {
    const form = $('#character-form');
    if (!form) return;
    const classId = form.elements.classId.value,
      faction = form.elements.faction.value,
      race = form.elements.race,
      role = form.elements.role,
      oldRace = preferredRace ?? race.value,
      oldRole = preferredRole ?? role.value,
      races = R.availableRaces(classId, faction),
      roles = R.roles[classId] || [];
    race.innerHTML = races.map(r => `<option ${r === oldRace ? 'selected' : ''}>${esc(r)}</option>`).join('');
    role.innerHTML = roles.map(r => `<option ${r === oldRole ? 'selected' : ''}>${r}</option>`).join('');
    $('#role-field').hidden = roles.length <= 1;
  }
  function limitProfessions() {
    const choices = [...document.querySelectorAll('#character-form input[data-profession-kind="primary"]')],
      full = choices.filter(el => el.checked).length >= 2;
    choices.forEach(el => el.disabled = full && !el.checked);
  }
  function goBack() {
    if ($('#dialog').open) {
      if (dialogTrail.length) {
        const prev = dialogTrail.pop();
        $('#dialog-content').innerHTML = prev.html;
        dialogTitle = prev.title;
      } else $('#dialog').close();
      return;
    }
    const prev = navTrail.pop();
    if (!prev) return;
    page = prev.page;
    query = prev.query;
    $('#search').value = query;
    history.replaceState(null, '', '#' + page);
    renderShell();
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }
function rewardPreview(q) {
 const c=character(),later=[...Q.laterRewards(q,c,D.quests,C.matchesCharacter,C.questDone),...(q.laterRewardHints||[])];
 return later.length?`<div class="chain-preview"><strong>${bi('Later in this chain','Senare i kedjan')}</strong>${later.map(x=>`<p><span>${esc(x.title)}</span> · ${esc(x.reward)}</p>`).join('')}</div>`:'';
}
function talentRanks() {
 const b=activeBuild(),spent=klass().trees.map(t=>t.talents.map(()=>0));
 if(b)C.buildSteps(b,DB).filter(s=>s.level<=character().level).forEach(s=>spent[s.tree][s.index]++);
 return spent;
}
function talentInfo(tree,index) {
 const t=klass().trees[tree],tal=t?.talents[index];if(!tal)return '';
 const rank=talentRanks()[tree][index],effects=window.TALENT_TEXT[tal.id]||{},shown=rank||1;
 return `<div class="talent-detail"><div class="talent-tooltip-heading">${gameIcon(window.GAME_ASSETS.talents[tal.id])}<div><h3>${esc(tal.name)}</h3><span>${bi('Rank','Rank')} ${rank}/${tal.max}</span></div></div><p class="talent-tooltip-meta">${positionLabel({...tal,treeName:t.name})}</p><p>${bi('Requires','Kräver')} ${esc(klass().name)} · ${tal.required} ${bi('points in this tree','poäng i trädet')}</p>${tal.requires.length?`<p>${bi('Prerequisites','Förkrav')}: ${tal.requires.map(r=>`${esc(t.talents.find(x=>x.id===r.id)?.name||r.id)} (${r.qty})`).join(', ')}</p>`:''}${!rank?`<small>${bi('First rank','Första ranken')}</small>`:''}<p class="talent-effect">${esc(effects[shown]||bi('Effect text is not available for this rank.','Effekttext saknas för denna rank.'))}</p>${rank&&rank<tal.max?`<small>${bi('Next rank','Nästa rank')} (${rank+1}/${tal.max})</small><p class="talent-effect">${esc(effects[rank+1]||'')}</p>`:''}${state.settings.showSourceLinks?`<a href="https://www.wowhead.com/forever/spell=${tal.spell}" target="_blank" rel="noopener noreferrer">Wowhead ${utilityIcon('external')}</a>`:''}</div>`;
}
function hideTalentTooltip(){document.querySelectorAll('[aria-describedby="talent-tooltip"]').forEach(x=>x.removeAttribute('aria-describedby'));const el=$('#talent-tooltip');if(el){el.hidden=true;el.removeAttribute('data-owner');}}
function showTalentTooltip(target){
 const key=target.dataset.tooltip;if(!key)return;const [tree,index]=key.split(':').map(Number),el=$('#talent-tooltip');if(!el)return;
 target.setAttribute('aria-describedby','talent-tooltip');el.innerHTML=talentInfo(tree,index);el.hidden=false;el.dataset.owner=key;
 const rect=target.getBoundingClientRect(),box=el.getBoundingClientRect();
 el.style.left=Math.max(8,Math.min(rect.right+12,window.innerWidth-box.width-8))+'px';
 el.style.top=Math.max(8,Math.min(rect.top,window.innerHeight-box.height-8))+'px';
}
function professionMaterials(name) {
 const P=window.ProfessionPlanner,c=character(),skill=c.professionSkills?.[name],rows=P.shopping(name,skill);
 let body='';
 if(name==='Fishing'){
  const routes=P.fishingZones.filter(s=>!skill||s.to>skill);
  body=`<p>${bi('Leveling materials required: 0. Fishing skill rises through successful catches, not by consuming crafting materials. Lures and a fishing pole are tools; fish you catch can be saved for Cooking.','Material som krävs för leveling: 0. Fishing ökar genom lyckade fångster, inte genom att förbruka craftingmaterial. Bete och fiskespö är redskap; fisken du fångar kan sparas till Cooking.')}</p>${routes.length?`<ol class="profession-route">${routes.map(s=>`<li><strong>${Math.max(skill||1,s.from)}–${s.to}</strong><span>${esc(L.t(s.place))}</span></li>`).join('')}</ol>`:`<p>${bi('Your entered Fishing skill is already 300.','Din angivna Fishing-skill är redan 300.')}</p>`}<p class="field-hint">${bi('The Cooking plan below/above lists raw fish worth saving and the estimated number needed for that route. Those quantities belong to Cooking and are not an extra Fishing requirement.','Cooking-planen nedan/ovan visar råfisk att spara och uppskattat antal för den rutten. Mängderna hör till Cooking och är inget extra Fishing-krav.')}</p>`;
  if(!c.professions.includes('Cooking'))body+=`<p class="small">${bi('Add Cooking to your selected professions to get a fish-saving budget.','Lägg till Cooking bland dina valda professions för att få en fiskbudget.')}</p>`;
 }else if(!skill){body=`<p>${bi('Set your current skill above to calculate what to save for the current and future stages.','Ange din nuvarande skill ovan för att beräkna vad du ska spara för nuvarande och framtida steg.')}</p>`;
 }else{
  body=`<p>${name==='Cooking'?bi('Selected route: fish recipes.','Vald rutt: fiskrecept.'):bi('Selected route: cloth bandages.','Vald rutt: tygbandage.')} ${bi('Amounts cover remaining leveling only. Extra food, healing supplies, camping crafts and crafted gear are excluded.','Mängderna gäller endast återstående leveling. Extra mat, healingförråd, campingföremål och craftad utrustning ingår inte.')}</p><p class="field-hint">${bi('Estimates, not guaranteed totals: yellow/green skill-ups vary. Partly completed stages are scaled from the guide’s full-stage budget and rounded up. Inventory is not subtracted.','Uppskattningar, inte garanterade totalsiffror: gula/gröna skillökningar varierar. Delvis klara steg beräknas proportionellt från guidens budget och avrundas uppåt. Ditt lager dras inte av.')}</p>`;
  for(const preliminary of [false,true]){
   const group=rows.filter(r=>r.preliminary===preliminary);if(!group.length)continue;
   body+=`<h3>${preliminary?bi('225–300 · preliminary Classic budget','225–300 · preliminär Classic-budget'):bi('Forever route through 225','Forever-rutt till 225')}</h3>${preliminary?`<p class="content-caution">${bi('The Forever leveling guide stops at 225. This is a Classic fallback for planning; confirm recipes before buying. First Aid phase quantities divide the Classic 80–100 cloth budgets into estimated stages.','Forevers levelingguide slutar vid 225. Detta är en Classic-baserad planering; kontrollera recepten före inköp. First Aid-mängderna delar upp Classics tygbudget på 80–100 i uppskattade steg.')}</p>`:''}<div class="material-table-wrap"><table class="material-table"><thead><tr><th>${bi('Save material','Spara material')}</th><th>${bi('Now','Nu')}</th><th>${bi('Future','Framöver')}</th><th>${bi('Total','Totalt')}</th></tr></thead><tbody>${group.map(r=>`<tr><th scope="row">${esc(r.name)}<small>${bi('Skill','Skill')} ${r.ranges.map(x=>x.join('–')).join(', ')}</small></th><td>${r.current||'—'}</td><td>${r.future||'—'}</td><td><strong>≈ ${r.total}</strong></td></tr>`).join('')}</tbody></table></div>${sourceLine({source:group[0].source,status:preliminary?'preliminary':'sourced',updated:'2026-10-27'})}`;
  }
  if(!rows.length)body+=`<p>${bi('No materials remain on this route at skill 300.','Inget material återstår på denna rutt vid skill 300.')}</p>`;
  const steps=(P.routes[name]||[]).filter(s=>s.to>skill);
  if(steps.length)body+=`<details class="profession-recipe-details"><summary>${bi('Recipes for the remaining stages','Recept för återstående steg')}</summary><ol class="profession-route">${steps.map(s=>`<li><strong>${Math.max(skill,s.from)}–${s.to}</strong><span>${esc(s.recipe)}${s.preliminary?' · '+bi('preliminary','preliminärt'):''}</span></li>`).join('')}</ol></details>`;
 }
 body+=professionTraining(name,skill||1);
 return `<section class="info-card profession-section"><div class="section-top"><h2>${gameIcon(window.GAME_ASSETS.professions[name])} ${esc(name)} · ${bi('materials to save','material att spara')}</h2><span class="level-tag">${skill||'—'} / 300</span></div>${body}${name==='Fishing'?sourceLine({source:P.sources.Fishing,status:'sourced',updated:'2026-10-27'}):''}</section>`;
}
function professionTraining(name,skill) {
 const c=character();let content='';
 if(name==='Cooking'){
  if(skill<150)content+=`<p>${bi('At 150: Expert Cookbook. Alliance: Shandrina, Ashenvale. Horde: Wulan, Shadowprey Village.','Vid 150: Expert Cookbook. Alliance: Shandrina, Ashenvale. Horde: Wulan, Shadowprey Village.')}</p>`;
  if(skill<=225)content+=`<p>${bi('For Artisan (character level 35, skill 225): Clamlette Surprise in Gadgetzan. Save these separately from the recipe budget:','För Artisan (karaktärslevel 35, skill 225): Clamlette Surprise i Gadgetzan. Spara detta separat från receptbudgeten:')}</p><ul><li>12 × Giant Egg</li><li>10 × Zesty Clam Meat</li><li>20 × Alterac Swiss</li></ul>`;
 }else if(name==='First Aid'){
  if(skill<225)content+=`<p>${bi('Before 150: buy Expert First Aid – Under Wraps and the Heavy Silk / Mageweave manuals.','Före 150: köp Expert First Aid – Under Wraps och manualerna för Heavy Silk / Mageweave.')} ${c.faction==='Alliance'?'Deneb Walker · Stromgarde Keep':'Balai Lok’Wein · Brackenwall Village'}.</p>`;
  if(skill<=225)content+=`<p>${bi('Artisan: character level 35 and skill 225. Complete Triage; the doctor provides the quest bandages, so do not reserve ordinary cloth for the quest.','Artisan: karaktärslevel 35 och skill 225. Gör Triage; läkaren ger questbandagen, så spara inte vanligt tyg till själva questen.')} ${c.faction==='Alliance'?'Doctor Gustaf VanHowzen · Theramore':'Doctor Gregory Victor · Hammerfall'}.</p>`;
 }else if(name==='Fishing'){
  if(skill<225)content+=`<p>${bi('At 150: Expert Fishing – The Bass and You, sold by Old Man Heming in Booty Bay.','Vid 150: Expert Fishing – The Bass and You, säljs av Old Man Heming i Booty Bay.')}</p>`;
  if(skill<=225)content+=`<p>${bi('At character level 35 and skill 225: Nat Pagle, Angler Extreme. Catch one of each quest fish after accepting the quest; they cannot be stockpiled beforehand.','Vid karaktärslevel 35 och skill 225: Nat Pagle, Angler Extreme. Fånga en av varje questfisk efter att ha hämtat questen; de kan inte sparas i förväg.')}</p><ul><li>1 × Feralas Ahi · Feralas</li><li>1 × Misty Reed Mahi Mahi · Swamp of Sorrows</li><li>1 × Sar’theris Striker · Desolace</li><li>1 × Savage Coast Blue Sailfin · Stranglethorn Vale</li></ul>`;
 }
 return content?`<details class="profession-training"><summary>${bi('Training and unlocks · separate from leveling crafts','Träning och upplåsningar · separat från levelingcrafts')}</summary>${content}</details>`:'';
}
function professionGear(){
 const c=character(),P=window.ProfessionPlanner,b=activeBuild(),focus=P.focus(c,b,DB),items=P.suggestions(c,b,DB);
 const groups=[...new Set(items.map(x=>x.profession))];
 return `<section class="profession-section"><div class="section-top"><h2>${bi('Crafted gear for your character','Craftad utrustning för din karaktär')}</h2></div><p class="small">${esc(klass().name)} · ${esc(c.role)}${focus.spec?' · '+esc(focus.spec):''}${focus.fromBuild?' · '+bi('based on','utifrån')+' '+esc(b.name):''}</p><p class="field-hint">${bi('Examples from current level-30 class guides. These are upgrade candidates, not a complete endgame ranking. Check item level, recipe access, binding and cost before crafting.','Exempel från aktuella klassguider för level 30. Detta är uppgraderingskandidater, inte en komplett slutspelsrankning. Kontrollera användningslevel, recept, bindning och kostnad före crafting.')}${!focus.spec?' '+bi('Import a talent build to narrow school-specific options.','Importera en talentbuild för att avgränsa skolspecifika alternativ.'):''}${focus.hybrid?' '+bi('For a hybrid build, suggestions follow your selected role and the strongest relevant tree.','För en hybridbuild följer förslagen vald roll och det starkaste relevanta trädet.'):''}</p>${items.length?groups.map(prof=>`<h3>${gameIcon(window.GAME_ASSETS.professions[prof])} ${esc(prof)}</h3><div class="crafted-grid">${items.filter(g=>g.profession===prof).map(g=>`<article class="info-card crafted-card"><div class="card-meta"><span class="level-tag">${esc(g.spec)}</span><span>${bi('Guide level','Guidelevel')} ${g.guideLevel}</span></div><h4>${esc(g.name)}</h4><p>${esc(L.t(g.reason))}</p><small>${g.skill?`${bi('Recipe skill','Receptskill')}: ${g.skill} · ${c.professionSkills?.[prof]>=g.skill?bi('Your skill is sufficient','Din skill räcker'):bi('Plan for later / check your skill','Planera framåt / kontrollera din skill')}`:bi('Recipe skill and equip requirements: check the recipe.','Receptskill och användningskrav: kontrollera receptet.')}</small>${sourceLine(g)}</article>`).join('')}</div>`).join(''):`<div class="info-card"><p>${bi('No documented equipment match for your current class, role and selected professions. Gathering professions, Cooking, First Aid and Fishing do not craft class armor; their material and camping guidance is shown separately.','Ingen dokumenterad utrustning matchar nuvarande klass, roll och valda professions. Samlaryrken, Cooking, First Aid och Fishing craftar inte klassrustning; material- och campinghjälpen visas separat.')}</p></div>`}</section>`;
}
  const byId = new Map([...RAW.quests, ...RAW.misc, ...DB.abilities, ...RAW.professions, ...RAW.dungeons.flatMap(d => d.quests)].map(q => [q.id, q]));
  document.addEventListener('change', e => {
    const el = e.target,
      c = character();
    if (el.closest?.('#character-form')) {
      if (['classId', 'faction'].includes(el.name)) updateCharacterOptions();
      if (el.name === 'professions') limitProfessions();
      return;
    }
    if (el.id === 'language-select' || el.id === 'theme-select') {
      if (el.id === 'language-select') state.settings.language = el.value === 'sv' ? 'sv' : 'en';else state.settings.theme = ['forest', 'dark', 'light', 'frost', 'parchment'].includes(el.value) ? el.value : 'forest';
      save();
      renderShell();
      settings();
      save();
      return;
    }
    if(el.dataset.professionSkill){const name=el.dataset.professionSkill;if(!c.professions.includes(name))return;c.professionSkills||={};if(el.value==='')delete c.professionSkills[name];else{const n=Number(el.value);if(!Number.isInteger(n)||n<1||n>300){el.setCustomValidity?.(bi('Use a whole number from 1 to 300.','Ange ett heltal mellan 1 och 300.'));el.reportValidity?.();return;}el.setCustomValidity?.('');c.professionSkills[name]=n;}save();renderContent();return;}
    if(el.id==='source-links-setting'){state.settings.showSourceLinks=el.checked;save();renderShell();return;}
    if (el.id === 'beginner-setting') {
      c.beginner = el.checked;
      save();
      renderShell();
      settings();
      return;
    }
    if (el.dataset.helpLevel !== undefined) {
      const focusId = el.id;
      c.helpLevel = C.clamp(el.value, 1, 4);
      save();
      renderContent();
      if ($('#dialog').open) settings();
      document.getElementById(focusId)?.focus();
      return;
    }
    if (el.id === 'controller-device') {
      c.controller = ['xbox', 'playstation', 'generic'].includes(el.value) ? el.value : 'xbox';
      save();
      renderContent();
      return;
    }
    if (el.id === 'controller-group') {
      controllerGroup = el.value;
      renderContent();
      return;
    }
    if (el.id === 'character-level') {
      changeLevel(el.value);
      return;
    }
    if (el.dataset.check) {
      const item = byId.get(el.dataset.check) || {
        id: el.dataset.check
      };
      C.setDone(c, item, el.checked);
      save();
      const insideDialog = el.closest('dialog');
      if (insideDialog) {
        const d = D.dungeons.find(d => d.quests.some(q => q.id === item.id));
        if (d) dialog(esc(d.title), dungeonCard(d));
      }
      renderContent();
      return;
    }
    if (el.dataset.step) {
      const item = byId.get(el.dataset.step),
        key = item.id + ':' + el.dataset.index;
      if (el.checked) c.done[key] = true;else delete c.done[key];
      const wasDone=C.questDone(item,{...c,done:{...c.done,[key]:!el.checked}});
      if (item.steps.every((_, i) => c.done[item.id + ':' + i])) c.done[item.id] = true;else delete c.done[item.id];
      save();
      const details = el.closest('details');
      if (details) {
        const label = el.closest('label');
        label.classList.toggle('completed', el.checked);
        const parent = details.closest('.quest-card');
        const checkbox = parent?.querySelector('[data-check]');
        if (checkbox) checkbox.checked = C.questDone(item, c);
      }
      if(wasDone!==C.questDone(item,c))renderContent();
      return;
    }
    if (el.dataset.category) {
      c.filters.categories = el.checked ? [...new Set([...c.filters.categories, el.dataset.category])] : c.filters.categories.filter(x => x !== el.dataset.category);
      save();
      $('#filter-count').textContent = c.filters.categories.length;
      renderContent();
      return;
    }
    if (el.id === 'active-build') {
      c.activeBuild = el.value;
      save();
      renderContent();
      return;
    }
    if (el.id === 'show-done') {
      c.filters.showDone = el.checked;
      save();
      renderContent();
      return;
    }
    if (el.id === 'search-everyone') {
      searchEveryone = el.checked;
      renderContent();
      return;
    }
  });
  document.addEventListener('input', e => {
    if (e.target.id === 'zone-search') {
      renderZoneResults(e.target.value);
      return;
    }
    if (e.target.id === 'controller-search') {
      controllerQuery = e.target.value.slice(0, 120);
      const caret = e.target.selectionStart;
      renderContent();
      $('#controller-search').focus();
      $('#controller-search').setSelectionRange(caret, caret);
      return;
    }
    if (e.target.dataset.helpLevel !== undefined) {
      const c = character(),
        n = C.clamp(e.target.value, 1, 4),
        h = T.help[n - 1],
        prefix = e.target.dataset.helpLevel;
      document.getElementById(prefix + '-help-value').textContent = n + '/4 · ' + h[L.language];
      document.getElementById(prefix + '-help-description').textContent = h.desc[L.language];
      e.target.setAttribute('aria-valuetext', h[L.language]);
      return;
    }
    if (e.target.closest('#build-import-form')) {
      pendingBuild = null;
      $('#save-build').hidden = true;
      $('#build-import-preview').innerHTML = '';
    }
    if (e.target.id === 'character-notes') {
      character().notes = e.target.value.slice(0, 20000);
      save();
    }
  });
  $('#search').addEventListener('input', e => {
    query = e.target.value.slice(0, 150);
    renderContent();
  });
  document.addEventListener('submit', e => {
    if (e.target.id === 'character-form') {
      e.preventDefault();
      const form = e.target,
        f = new FormData(form),
        edit = form.dataset.edit === 'true',
        prof = f.getAll('professions'),
        primary = prof.filter(n => !['Cooking', 'First Aid', 'Fishing'].includes(n));
      if (primary.length > 2) {
        $('#form-error').hidden = false;
        $('#form-error').textContent = L.t('Välj högst två huvudsakliga professions.');
        return;
      }
      const values = {
        name: f.get('name').trim(),
        classId: edit && !character().blank ? character().classId : f.get('classId'),
        race: f.get('race'),
        faction: f.get('faction'),
        level: +f.get('level'),
        role: f.get('role'),
        professions: prof
      };
      if (!values.name) return;
      if (!R.valid(values)) {
        $('#form-error').hidden = false;
        $('#form-error').textContent = bi('Choose a valid class, faction, race and role.', 'Välj en giltig klass, faction, ras och roll.');
        return;
      }
      if (edit) {
        Object.assign(character(), values, {
          demo: false,
          blank: false
        });
      } else {
        if (state.characters.length >= 100) {
          notify(L.t('Du har nått gränsen på 100 profiler.'));
          return;
        }
        const c = C.createCharacter(values);
        state.characters.push(c);
        state.activeId = c.id;
      }
      save();
      $('#dialog').close();
      go('overview');
      notify(edit ? L.t('Karaktären är uppdaterad.') : L.t('Ditt nya äventyr är sparat.'));
    } else if (e.target.id === 'build-import-form') {
      e.preventDefault();
      const f = new FormData(e.target),
        error = $('#build-import-error');
      try {
        pendingBuild = C.parseWowhead(f.get('url'), DB, character().classId);
        if (f.get('name').trim()) pendingBuild.name = f.get('name').trim();
        const totals = pendingBuild.allocations.map(t => t.reduce((a, b) => a + b, 0)),
          warn = C.validateOrder(pendingBuild, DB);
        $('#build-import-preview').innerHTML = L.h`<div class="import-preview"><strong>${esc(pendingBuild.name)}</strong><p>${totals.join(' / ')} poäng · ${pendingBuild.order.length ? L.m('Sparad ordning med ') + pendingBuild.order.length + L.m(' poäng') : L.t('Ingen poängordning i länken')}</p><p>Första poängen: level ${pendingBuild.startLevel}</p>${warn.length ? L.h`<p style="color:var(--danger);margin-top:8px">Ordningen behöver justeras: ${esc(L.m(warn[0].message))}</p>` : ''}</div>`;
        error.hidden = true;
        $('#save-build').hidden = false;
      } catch (err) {
        pendingBuild = null;
        error.hidden = false;
        error.textContent = L.m(err.message);
        $('#build-import-preview').innerHTML = '';
        $('#save-build').hidden = true;
      }
    } else if (e.target.id === 'build-edit-form') {
      e.preventDefault();
      activeBuild().name = new FormData(e.target).get('name').trim().slice(0, 80) || L.t('Min build');
      save();
      $('#dialog').close();
      renderContent();
    }
  });
  $('#backup-file').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024) throw Error(L.t('Backupfilen får vara högst 5 MB.'));
      const imported = C.normalise(JSON.parse(await file.text()), DB);
      if (imported.characters.length + state.characters.length > 100) throw Error(L.t('Importen skulle ge fler än 100 profiler.'));
      for (const c of imported.characters) c.id = C.uuid();
      state.characters.push(...imported.characters);
      state.activeId = imported.characters[0].id;
      save();
      $('#dialog').close();
      renderShell();
      notify(imported.characters.length + L.m(' karaktärsprofil(er) importerade.'));
    } catch (err) {
      notify(L.m('Import misslyckades: ') + L.m(err.message));
    } finally {
      e.target.value = '';
    }
  });
  $('#dialog').addEventListener('click', e => {
    if (e.target === $('#dialog')) {
      const r = $('#dialog').getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) $('#dialog').close();
    }
  });
  $('#menu-backdrop').addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !$('#dialog').open && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      $('#search').focus();
    }
    if (e.key === 'Escape') closeMenu();
  });
  window.addEventListener('hashchange', () => {
    query = '';
    $('#search').value = '';
    page = location.hash.slice(1) || 'overview';
    renderShell();
  });
  window.addEventListener('storage', e => {
    if (e.key === C.KEY && e.newValue !== e.oldValue) {
      foreignChange = true;
      $('#save-status').classList.add('error');
      $('#save-status').textContent = L.t('Ändrad i annan flik – öppna backup');
      notify(L.t('Guiden ändrades i en annan flik. Exportera eventuellt arbete och ladda om.'));
    }
  });
  function offlineStatus() {
    const status = $('#offline-status');
    if (updateAvailable) {
      status.innerHTML = icon('download') + L.h` ${bi('New version available', 'Ny version finns')} · <button data-action="update-app">${bi('Reload', 'Ladda om')}</button>`;
      return;
    }
    if (window.FARDVAG_STANDALONE) {
      status.innerHTML = icon('check') + ' ' + bi('Standalone file', 'Fristående fil');
      return;
    }
    if (!navigator.onLine) status.innerHTML = icon('wifiOff') + ' ' + bi('Offline mode', 'Offlineläge');else if (navigator.serviceWorker?.controller) status.innerHTML = icon('check') + ' ' + bi('Ready to use offline', 'Redo att användas offline');else status.innerHTML = icon('wifi') + ' ' + (location.protocol === 'file:' || !window.isSecureContext ? bi('Offline mode activates on HTTPS', 'Offlineläge aktiveras på HTTPS') : bi('Preparing offline mode', 'Förbereder offlineläge'));
  }
  window.addEventListener('online', offlineStatus);
  window.addEventListener('offline', offlineStatus);
  if (!window.FARDVAG_STANDALONE && 'serviceWorker' in navigator && location.protocol !== 'file:') {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController) updateAvailable = true;
      offlineStatus();
    });
    navigator.serviceWorker.register('./sw.js', {
      scope: './',
      updateViaCache: 'none'
    }).then(r => {
      registration = r;
      const watch = worker => {
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && hadController) {
            updateAvailable = true;
            offlineStatus();
          }
        });
      };
      watch(r.installing);
      r.addEventListener('updatefound', () => watch(r.installing));
      return navigator.serviceWorker.ready;
    }).then(offlineStatus).catch(() => {
      $('#offline-status').innerHTML = icon('info') + ' ' + bi('Could not activate offline caching', 'Offlinecache kunde inte aktiveras');
    });
  }
  document.addEventListener('pointerover',e=>{const target=e.target.closest?.('[data-tooltip]');if(target&&e.pointerType!=='touch')showTalentTooltip(target);});
  document.addEventListener('pointerout',e=>{if(e.target.closest?.('[data-tooltip]'))hideTalentTooltip();});
  document.addEventListener('focusin',e=>{const target=e.target.closest?.('[data-tooltip]');if(target)showTalentTooltip(target);});
  document.addEventListener('focusout',hideTalentTooltip);
  document.addEventListener('click',hideTalentTooltip);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')hideTalentTooltip();});
  window.addEventListener('scroll',hideTalentTooltip,true);window.addEventListener('resize',hideTalentTooltip);
  fillIcons();
  renderShell();
  offlineStatus();
  if (brokenRaw) notify(L.t('Sparningen behöver kontrolleras. Öppna Inställningar & backup.'));else save();
})();