const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const core = require('../core.js');

test('World Map, Beginner Guide, and Controller Support are accessible with no character', () => {
  assert.match(app, /characterOptionalPages\s*=\s*new Set\(\['world-map', 'glossary', 'controller'\]\)/);
  assert.match(app, /c\.blank\s*&&\s*!characterOptionalPages\.has\(page\)/);
  assert.match(app, /if \(c\.blank && !characterOptionalPages\.has\(page\)\)/);
  assert.match(app, /page === 'glossary'\) html = glossaryPage\(\)/);
  assert.match(app, /page === 'controller'\) html = controllerPage\(\)/);
  assert.match(app, /page === 'world-map'\) html = worldMapPage\(\)/);
  assert.equal(core.createBlankCharacter().blank, true);
  assert.equal(core.createBlankCharacter().controller, 'xbox');
});

test('welcome has navigable links to all character-optional guides', () => {
  const welcome = app.slice(app.indexOf('  function welcome()'), app.indexOf('  function positionLabel(', app.indexOf('  function welcome()')));
  for (const id of ['world-map', 'glossary', 'controller']) assert(welcome.includes('data-page="'+id+'"'), id+' needs a working navigation link');
  assert(welcome.includes('data-action="edit-character"'));
});

test('page headings retain real titles when no character exists', () => {
  assert.match(app, /c\.blank&&!characterOptionalPages\.has\(page\)\?bi\('Create your character'/);
});
