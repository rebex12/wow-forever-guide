'use strict';
// Browser-level smoke test. Runs against the real static site at the same
// project subpath used by GitHub Pages; no game/backend account is needed.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const prefix='/wow-forever-guide/';
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
  let rel;
  try {const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(!name.startsWith(prefix)){res.writeHead(404);res.end();return;}
    rel=name.slice(prefix.length)||'index.html';
    if(rel.endsWith('/'))rel+='index.html';
    const target=path.resolve(root,rel);
    if(!(target===root||target.startsWith(root+path.sep))){res.writeHead(403);res.end();return;}
    const file=fs.statSync(target);
    if(!file.isFile())throw Error('not a file');
    res.writeHead(200,{'content-type':mime[path.extname(target)]||'application/octet-stream'});
    fs.createReadStream(target).pipe(res);
  }catch(err){res.writeHead(404);res.end('Not found: '+(rel||''));}
});
let browser,origin;
test.before(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  origin='http://127.0.0.1:'+server.address().port+prefix;
  browser=await chromium.launch({headless:true,channel:'chrome'});
});
test.after(async()=>{await browser?.close();await new Promise(resolve=>server.close(resolve));});
async function open(viewport={width:1400,height:900}){
  const context=await browser.newContext({viewport});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin,{waitUntil:'domcontentloaded'});
  await page.locator('#navigation [data-page="overview"]').waitFor();
  await page.locator('#content').waitFor();
  return {context,page,errors};
}
async function go(page,id){
  await page.locator('#navigation [data-page="'+id+'"]').click();
  assert.equal(await page.evaluate(()=>location.hash),'#'+id);
  assert((await page.locator('#content').innerHTML()).length>30, 'empty '+id);
}
test('real desktop: initial public guides, character creation, pages, quest progress and persistence',async()=>{
  const {context,page,errors}=await open();
  try{
    assert.match(await page.locator('body').innerText(),/Questbound/i);
    assert(await page.locator('#content').innerText().then(s=>/Create character/i.test(s)));
    await go(page,'world-map');
    await page.locator('.atlas').waitFor();
    await page.locator('.journey-planner').waitFor();
    await go(page,'controller');
    assert((await page.locator('#content').innerText()).length>80);
    await go(page,'glossary');
    assert((await page.locator('#content').innerText()).length>80);
    await page.locator('.new-character[data-action="new-character"]').click();
    await page.locator('#character-form input[name="name"]').fill('Audit Shaman');
    await page.locator('#character-form select[name="classId"]').selectOption('shaman');
    await page.locator('#character-form select[name="faction"]').selectOption('Horde');
    await page.locator('#character-form select[name="race"]').selectOption('Orc');
    await page.locator('#character-form input[name="level"]').fill('31');
    await page.locator('#character-form input[name="professions"][value="Cooking"]').check();
    await page.locator('button[form="character-form"]').click();
    await page.waitForFunction(()=>!document.querySelector('#dialog').open);
    assert.match(await page.locator('#sidebar-character').innerText(),/Audit Shaman/);
    const pages=['overview','talents','quests','dungeons','zones','abilities','gear','professions','notes','glossary','controller','world-map'];
    for(const id of pages)await go(page,id);
    await go(page,'notes');
    await page.locator('#character-notes').fill('QA-persisted note');
    await page.locator('#character-notes').dispatchEvent('change');
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('#navigation [data-page="notes"]').click();
    assert.equal(await page.locator('#character-notes').inputValue(),'QA-persisted note');
    await go(page,'quests');
    await page.locator('#search').fill('Changing Tastes');
    await page.waitForTimeout(100);
    assert.match(await page.locator('#content').innerText(),/Changing Tastes/);
    await page.locator('[data-skip="excavation-changing-tastes"]').first().click();
    await page.locator('#search').fill('');
    await go(page,'overview');
    await page.locator('[data-view="skipped"]').first().click();
    assert(await page.locator('[data-skip="excavation-changing-tastes"]').count()>0);
    await go(page,'professions');
    assert.match(await page.locator('#content').innerText(),/Cooking/);
    await go(page,'dungeons');
    assert.match(await page.locator('#content').innerText(),/Excavation Site|Dalaran/);
    assert.deepEqual(errors,[],'uncaught browser runtime errors');
  }finally{await context.close();}
});
test('real mobile: public guides work before character creation using hamburger menu',async()=>{
  const {context,page,errors}=await open({width:390,height:844});
  try {
    for(const id of ['world-map','controller','glossary']){
      await page.locator('#page-heading [data-action="menu"]').click();
      await page.locator('#navigation [data-page="'+id+'"]').click();
      assert.equal(await page.evaluate(()=>location.hash),'#'+id);
      assert((await page.locator('#content').innerText()).length>20);
    }
    assert.deepEqual(errors,[],'uncaught mobile runtime errors');
  }finally{await context.close();}
});
test('configured character can change level throughout the app with bounds and reload persistence',async()=>{
 const {context,page,errors}=await open();
 try{
   assert.equal(await page.locator('#quick-character-level').count(),0);
   await go(page,'controller');
   assert.equal(await page.locator('#quick-character-level').count(),0);
   await page.locator('.new-character').click();
   await page.locator('#character-form input[name="name"]').fill('Level Test');
   await page.locator('#character-form select[name="classId"]').selectOption('shaman');
   await page.locator('#character-form select[name="faction"]').selectOption('Horde');
   await page.locator('#character-form select[name="race"]').selectOption('Orc');
   await page.locator('button[form="character-form"]').click();
   await page.waitForFunction(()=>!document.querySelector('#dialog').open);
   for(const id of ['quests','dungeons','zones','zone-guide','talents','abilities','gear','professions','notes','world-map','glossary','controller']){
     await go(page,id);
     assert.equal(await page.locator('#quick-character-level').count(),1,id);
   }
   await go(page,'quests');
   const input=page.locator('#quick-character-level');
   await input.fill('30');
   await input.press('Tab');
   assert.equal(await input.inputValue(),'30');
   await page.locator('.heading-level [data-action="level-up"]').click();
   assert.equal(await input.inputValue(),'31');
   await page.locator('.heading-level [data-action="level-down"]').click();
   assert.equal(await input.inputValue(),'30');
   await input.fill('60');await input.press('Tab');
   assert(await page.locator('.heading-level [data-action="level-up"]').isDisabled());
   await input.fill('0');await input.press('Tab');
   assert.equal(await input.inputValue(),'1');
   assert(await page.locator('.heading-level [data-action="level-down"]').isDisabled());
   await input.fill('');await input.press('Tab');
   assert.equal(await input.inputValue(),'1','empty input must not change level');
   await input.fill('43');await input.press('Tab');
   await go(page,'dungeons');
   assert.equal(await input.inputValue(),'43');
   await go(page,'overview');
   assert.equal(await page.locator('#quick-character-level').count(),0);
   assert.equal(await page.locator('#character-level').inputValue(),'43');
   await page.reload({waitUntil:'domcontentloaded'});
   await go(page,'talents');
   assert.equal(await input.inputValue(),'43');
   assert.match(await page.locator('#sidebar-character').innerText(),/Level 43/);
   assert.deepEqual(errors,[]);
 } finally {await context.close();}
});
test('mobile header keeps level control visible and fully within viewport',async()=>{
 const {context,page,errors}=await open({width:390,height:844});
 try{
   await page.locator('#page-heading [data-action="menu"]').click();
   await page.locator('.new-character').click();
   await page.locator('#character-form input[name="name"]').fill('Mobile Tester');
   await page.locator('#character-form select[name="classId"]').selectOption('shaman');
   await page.locator('#character-form select[name="faction"]').selectOption('Horde');
   await page.locator('#character-form select[name="race"]').selectOption('Orc');
   await page.locator('button[form="character-form"]').click();
   await page.waitForFunction(()=>!document.querySelector('#dialog').open);
   await page.locator('#page-heading [data-action="menu"]').click();
   await page.locator('#navigation [data-page="dungeons"]').click();
   const box=await page.locator('.heading-level').boundingBox();
   assert(box&&box.x>=0&&box.x+box.width<=390,'level control must fit mobile screen');
   await page.locator('#quick-character-level').fill('24');
   await page.locator('#quick-character-level').press('Tab');
   assert.equal(await page.locator('#quick-character-level').inputValue(),'24');
   await page.locator('.heading-level [data-action="level-up"]').click();
   assert.equal(await page.locator('#quick-character-level').inputValue(),'25');
   assert.deepEqual(errors,[]);
 }finally{await context.close();}
});
