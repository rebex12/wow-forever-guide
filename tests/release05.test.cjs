const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');const E=require('../talent-editor.js'),C=require('../core.js'),A=require('../world-map.js'),P=require('../profession-planner.js');const window={};for(const f of ['catalog.js','map-data.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),{window});const db=window.FOREVER_CATALOG,maps=window.WORLD_MAP_DATA.maps;
const blank=classId=>({id:'test',classId,name:'Plan',calculator:true,startLevel:10,order:[],allocations:E.empty(classId,db)});
test('native calculator builds valid 51-point plans for all nine classes and blocks the 52nd point',()=>{
 for(const classId of Object.keys(db.classes)){const b=blank(classId);for(let n=0;n<51;n++){let chosen=false;for(let t=0;t<3&&!chosen;t++)for(let i=0;i<b.allocations[t].length;i++)if(E.add(b,db,t,i).ok){chosen=true;break;}assert(chosen,classId+' point '+n);}assert.equal(E.total(b),51);assert.equal(C.validateOrder(b,db).length,0);assert.equal(E.add(b,db,0,0).error,'budget');assert.equal(b.order.length,51);}
});
test('calculator enforces ranks, rows and prerequisite talents and preserves dependent points',()=>{
 const b=blank('shaman'),tree=db.classes.shaman.trees[1],deep=tree.talents.findIndex(x=>x.required>=5),first=0;
 assert.equal(E.add(b,db,1,deep).error,'tier');for(let i=0;i<tree.talents[first].max;i++)assert(E.add(b,db,1,first).ok);assert.equal(E.add(b,db,1,first).error,'max');
 while(b.allocations[1].reduce((a,n)=>a+n,0)<5){let ok=false;for(let i=0;i<tree.talents.length;i++)if(E.add(b,db,1,i).ok){ok=true;break;}assert(ok);}
 assert(E.add(b,db,1,deep).ok);const snapshot=JSON.stringify(b);assert.equal(E.remove(b,db,1,first).error,'dependent');assert.equal(JSON.stringify(b),snapshot);
 const last=b.order.at(-1);assert(E.remove(b,db,last.tree,last.index).ok);assert.equal(C.validateOrder(b,db).length,0);
 const withReq=Object.entries(db.classes).flatMap(([classId,c])=>c.trees.flatMap((t,tree)=>t.talents.map((x,index)=>({...x,classId,tree,index})))).find(t=>t.required===0&&t.requires.length);
 if(withReq)assert.equal(E.add(blank(withReq.classId),db,withReq.tree,withReq.index).error,'prerequisite');
});
test('allocation-only imports get a valid generated order in a copy, without mutating their original',()=>{
 const b=blank('mage');for(let i=0;i<2;i++)E.add(b,db,0,0);b.order=[];const before=JSON.stringify(b),order=E.plan(b,db);assert.equal(order.length,2);assert.equal(JSON.stringify(b),before);assert(E.validOrder(b,db,order));
 const invalid=blank('mage');invalid.allocations[0][db.classes.mage.trees[0].talents.length-1]=1;assert.equal(E.plan(invalid,db),null);
});
test('native build flags, leveling order and map choice survive backup round trips per profile',()=>{
 const c=C.createCharacter({classId:'mage',atlasMap:'zone-elwynn'}),b=blank('mage');E.add(b,db,0,0);c.builds=[b];c.activeBuild=b.id;const restored=C.normalise(JSON.parse(JSON.stringify({schema:1,characters:[c],activeId:c.id})),db).characters[0];assert.equal(restored.atlasMap,'zone-elwynn');assert.equal(restored.builds[0].calculator,true);assert.deepEqual(restored.builds[0].order,b.order);assert.equal(C.buildSteps(restored.builds[0],db)[0].level,10);
});
test('tooltips never intersect their talent on phone or desktop, including viewport corners',()=>{
 for(const width of [320,360,390,688,1366])for(const height of [500,780,1000])for(const x of [8,width/2-18,width-44])for(const y of [8,180,height-50]){const rect={left:x,right:x+36,top:y,bottom:y+36},box={width:Math.min(330,width-16),height:420},p=E.tooltip(rect,box,{width,height}),h=Math.min(box.height,p.maxHeight),w=box.width;assert(p.left>=0&&p.left+w<=width);assert(p.top>=0&&p.top+h<=height);assert(p.left+w<=rect.left||p.left>=rect.right||p.top+h<=rect.top||p.top>=rect.bottom,JSON.stringify({width,height,rect,p}));}
});
test('atlas contains the world, two continents and all 50 zone/city maps with valid hierarchy',()=>{
 assert.equal(Object.keys(maps).length,53);for(const m of Object.values(maps)){assert.equal(m.id,Object.keys(maps).find(k=>maps[k]===m));assert(m.width>=1000&&m.height>=660);assert(m.image.startsWith('./assets/maps/')||m.image.startsWith('https://wow.zamimg.com/images/wow/classicplus/maps/enus/original/'));if(m.parent){assert(maps[m.parent]);assert(m.x>=0&&m.x<=1&&m.y>=0&&m.y<=1);}else assert.equal(m.id,'world');if(m.image.startsWith('./'))assert(fs.existsSync(path.join(__dirname,'..',m.image)));}
 for(const id of ['zone-barrens','zone-riverglades','zone-zephras','zone-shendralas','zone-mount-hyjal','zone-orgrimmar','zone-ironforge'])assert(maps[id],id);
});
test('atlas search matches subzones, cities, punctuation and both continents without faction restrictions',()=>{
 assert.equal(A.search(maps,'Crossroads')[0].id,'zone-barrens');assert.equal(A.search(maps,'Powderfuse Port')[0].id,'zone-riverglades');assert.equal(A.search(maps,'Shen dralas')[0].id,'zone-shendralas');assert.equal(A.search(maps,'Ironforge')[0].id,'zone-ironforge');assert.equal(A.nearest(maps,'world',.76,.54).map.id,'eastern');assert.equal(A.bounds(500,400,600,2),400);assert.equal(A.bounds(-500,400,200,1),0);
 for(const language of ['en','sv']){const html=A.render({data:window.WORLD_MAP_DATA,language,initial:'zone-barrens',currentZone:'zone-barrens'});assert(html.includes('atlas-select'));assert(html.includes('atlas-viewport'));assert(!html.includes('[object Object]'));assert(!html.includes('undefined'));}
});
test('craft suggestions carry distinct persistent IDs and sourced item equip levels when documented',()=>{
 const c=C.createCharacter({classId:'shaman',role:'DPS',professions:['Leatherworking']}),items=P.suggestions(c,null,db);assert(items.length>=2);assert(items.every(g=>g.id.startsWith('craft-leatherworking-')));const glove=items.find(g=>g.name==='Toughened Leather Gloves');assert.equal(glove.equipLevel,22);assert.equal(glove.itemId,4253);assert.equal(items.find(g=>g.name==='Skirmisher’s Leather Belt').equipLevel,30);assert.equal(new Set(items.map(g=>g.id)).size,items.length);
});

test('zooming out at minimum zoom navigates to the parent map, never past the world',()=>{
 const W=require('../world-map.js');
 const maps={world:{id:'world'},continent:{id:'continent',parent:'world'},zone:{id:'zone',parent:'continent'}};
 assert.equal(W.zoomOutParent(maps,maps.zone,1,1/1.18),'continent');
 assert.equal(W.zoomOutParent(maps,maps.continent,1,1/1.5),'world');
 assert.equal(W.zoomOutParent(maps,maps.world,1,1/1.18),null);
 assert.equal(W.zoomOutParent(maps,maps.zone,1.4,1/1.18),null);
 assert.equal(W.zoomOutParent(maps,maps.zone,1,1.18),null);
});

test('zoom navigation restores the previous zoom and pan for each parent map',()=>{
 const W=require('../world-map.js');
 const maps={world:{id:'world'},continent:{id:'continent',parent:'world'},zone:{id:'zone',parent:'continent'},other:{id:'other',parent:'continent'}};
 const worldView={z:2.3,px:-125,py:65},continentView={z:2.4,px:110,py:-90};
 const toContinent=W.mapNavigation(maps,maps.world,'continent',worldView,[]);
 assert.equal(toContinent.history.length,1);
 const toZone=W.mapNavigation(maps,maps.continent,'zone',continentView,toContinent.history);
 assert.equal(toZone.history.length,2);
 const back=W.mapNavigation(maps,maps.zone,'continent',{z:1,px:0,py:0},toZone.history);
 assert.deepEqual(back.restore,{id:'continent',...continentView});
 assert.equal(back.history.length,1);
 const next=W.mapNavigation(maps,maps.continent,'other',continentView,back.history);
 const backToWorld=W.mapNavigation(maps,maps.other,'world',{z:1,px:0,py:0},next.history);
 assert.deepEqual(backToWorld.restore,{id:'world',...worldView});
 assert.equal(backToWorld.history.length,0);
 assert.equal(W.mapNavigation(maps,maps.zone,'continent',{z:1,px:0,py:0},[]).restore,null);
 assert.equal(W.mapNavigation(maps,maps.zone,'other',{z:1,px:0,py:0},toZone.history).history.length,0);
});

test('zone hit testing distinguishes The Barrens from Mulgore',()=>{
 assert.equal(A.zoneAt(maps,'kalimdor',.497,.572)?.id,'zone-barrens');
 assert.equal(A.zoneAt(maps,'kalimdor',.470,.580)?.id,'zone-mulgore');
 assert.equal(A.zoneAt(maps,'kalimdor',.527,.510)?.id,'zone-barrens');
 assert.equal(A.zoneAt(maps,'kalimdor',-.2,.5),null);
 assert.equal(A.zoneAt(maps,'kalimdor',.02,.95,.04),null);
});
test('adjacent-zone navigation uses directly linked neighboring land maps',()=>{
 const nearby=A.adjacentZones(maps,'zone-barrens',require('../travel-data.js')).map(m=>m.id);
 for(const id of ['zone-durotar','zone-mulgore','zone-ashenvale','zone-stonetalon','zone-dustwallow-marsh','zone-thousand-needles'])assert(nearby.includes(id),id);
 assert(!nearby.includes('zone-elwynn'));
 assert.equal(nearby.length,new Set(nearby).size);
 assert.deepEqual(A.adjacentZones(maps,'world',require('../travel-data.js')),[]);
 assert(A.render({data:window.WORLD_MAP_DATA,initial:'zone-barrens'}).includes('atlas-neighbors'));
});
test('mobile pinch zoom never auto-opens a zone and gestures cannot trigger a tap',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../world-map.js'),'utf8');
 assert(source.includes('function zoom(factor,x=vw/2,y=vh/2,autoOpen=false)'));
 assert(source.includes('const candidate=autoOpen?zoneAt'));
 assert(source.includes('suppressClick=true;zoom(distance/gesture.distance'));
 assert(source.includes('if(!points.size)suppressClick=false'));
});

test('adjacent sibling navigation preserves the saved parent zoom',()=>{
 const maps={world:{id:'world'},continent:{id:'continent',parent:'world'},west:{id:'west',parent:'continent'},east:{id:'east',parent:'continent'}};
 const original={z:3.1,px:105,py:-60};
 const enter=A.mapNavigation(maps,maps.continent,'west',original,[]);
 const sibling=A.mapNavigation(maps,maps.west,'east',{z:1,px:0,py:0},enter.history);
 assert.deepEqual(sibling.history,enter.history);
 const out=A.mapNavigation(maps,maps.east,'continent',{z:1,px:0,py:0},sibling.history);
 assert.deepEqual(out.restore,{id:'continent',...original});
});

test('adjacent zone buttons are not disabled by a prior pinch gesture',()=>{
 const code=fs.readFileSync(path.join(__dirname,'../world-map.js'),'utf8');
 assert(code.includes('!vp.contains(button)||!suppressClick'));
});
