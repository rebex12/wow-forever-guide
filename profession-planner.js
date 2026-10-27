/* Leveling quantities: current Forever guides through 225; labeled Classic fallback after 225. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ProfessionPlanner=api;})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const base='https://www.wowhead.com/forever/guide/';
 const sources={Cooking:base+'professions/cooking/overview-leveling','First Aid':base+'professions/first-aid/overview',Fishing:base+'professions/fishing/overview-leveling',classicCooking:'https://www.wowhead.com/classic/guide/cooking-leveling-1-300-wow-classic',classicAid:'https://www.wowhead.com/classic/guide/first-aid-leveling-1-300-wow-classic'};
 const B=(en,sv)=>({en,sv});
 const stage=(from,to,recipe,materials,profession,preliminary=false)=>({from,to,recipe,materials,preliminary,source:sources[preliminary?(profession==='Cooking'?'classicCooking':'classicAid'):profession]});
 const routes={
  Cooking:[stage(1,50,'Brilliant Smallfish',{'Raw Brilliant Smallfish':52},'Cooking'),stage(50,100,'Longjaw Mud Snapper',{'Raw Longjaw Mud Snapper':55},'Cooking'),stage(100,150,'Bristle Whisker Catfish',{'Raw Bristle Whisker Catfish':55},'Cooking'),stage(150,175,'Bristle Whisker Catfish',{'Raw Bristle Whisker Catfish':65},'Cooking'),stage(175,225,'Mithril Headed Trout',{'Raw Mithril Head Trout':55},'Cooking'),stage(225,275,'Spotted Yellowtail',{'Raw Spotted Yellowtail':70},'Cooking',true),stage(275,300,'Mightfish Steak',{'Large Raw Mightfish':25,'Hot Spices':25,'Soothing Spices':25},'Cooking',true)],
  'First Aid':[stage(1,40,'Linen Bandage',{'Linen Cloth':45},'First Aid'),stage(40,80,'Heavy Linen Bandage',{'Linen Cloth':130},'First Aid'),stage(80,115,'Wool Bandage',{'Wool Cloth':50},'First Aid'),stage(115,150,'Heavy Wool Bandage',{'Wool Cloth':100},'First Aid'),stage(150,180,'Silk Bandage',{'Silk Cloth':45},'First Aid'),stage(180,210,'Heavy Silk Bandage',{'Silk Cloth':90},'First Aid'),stage(210,225,'Mageweave Bandage',{'Mageweave Cloth':20},'First Aid'),stage(225,240,'Mageweave Bandage',{'Mageweave Cloth':30},'First Aid',true),stage(240,260,'Heavy Mageweave Bandage',{'Mageweave Cloth':70},'First Aid',true),stage(260,290,'Runecloth Bandage',{'Runecloth':60},'First Aid',true),stage(290,300,'Heavy Runecloth Bandage',{'Runecloth':40},'First Aid',true)],
  Fishing:[]
 };
 function shopping(profession,skill){
  if(!Number.isInteger(skill)||skill<1||skill>300)return [];
  const materials=new Map();
  for(const step of routes[profession]||[]){
   if(skill>=step.to)continue;
   const fraction=(step.to-Math.max(skill,step.from))/(step.to-step.from),current=skill>=step.from;
   for(const [name,full]of Object.entries(step.materials)){
    const key=name+'|'+step.preliminary;const row=materials.get(key)||{name,current:0,future:0,total:0,preliminary:step.preliminary,ranges:[],source:step.source};
    const qty=Math.ceil(full*fraction);row[current?'current':'future']+=qty;row.total+=qty;row.ranges.push([Math.max(skill,step.from),step.to]);materials.set(key,row);
   }
  }
  return [...materials.values()];
 }
 const fishingZones=[{from:1,to:75,place:B('Starting zones; use a Shiny Bauble below skill 25.','Startzoner; använd Shiny Bauble under skill 25.')},{from:75,to:150,place:B('Any faction capital. Train Journeyman before reaching the cap.','Valfri factions huvudstad. Träna Journeyman innan skilltaket.')},{from:150,to:225,place:B('Dustwallow Marsh / Stranglethorn Vale, or stay in a capital. Use lures when needed.','Dustwallow Marsh / Stranglethorn Vale, eller stanna i en huvudstad. Använd bete vid behov.')},{from:225,to:300,place:B('Tanaris or continue in Dustwallow Marsh; use lures when needed.','Tanaris eller fortsätt i Dustwallow Marsh; använd bete vid behov.')}];
 const specializations={warrior:{DPS:['Arms','Fury'],Tank:['Protection']},paladin:{DPS:['Retribution'],Tank:['Protection'],Healer:['Holy']},hunter:{DPS:['Beast Mastery','Marksmanship','Survival']},rogue:{DPS:['Assassination','Combat','Subtlety']},priest:{DPS:['Shadow'],Healer:['Discipline','Holy']},shaman:{DPS:['Elemental','Enhancement'],Healer:['Restoration']},mage:{DPS:['Arcane','Fire','Frost']},warlock:{DPS:['Affliction','Demonology','Destruction']},druid:{DPS:['Balance','Feral'],Tank:['Feral'],Healer:['Restoration']}};
 function focus(c,build,catalog){
  const eligible=specializations[c.classId]?.[c.role]||specializations[c.classId]?.DPS||[];
  const scored=(catalog.classes[c.classId]?.trees||[]).map((t,i)=>({name:t.name==='Feral Combat'?'Feral':t.name,points:(build?.allocations?.[i]||[]).reduce((a,b)=>a+b,0)})).filter(t=>eligible.includes(t.name)).sort((a,b)=>b.points-a.points);
  return {spec:scored[0]?.points?scored[0].name:eligible.length===1?eligible[0]:null,eligible,fromBuild:!!scored[0]?.points,hybrid:scored.filter(t=>t.points>0).length>1};
 }
 const gear=[];
 function add(classId,spec,profession,items,reason,role='DPS',skills={}){
  const slug=spec.toLowerCase().replaceAll(' ','-');
  const source=base+'classes/'+classId+'/'+slug+'/level-30-'+role.toLowerCase()+'-overview';
  for(const name of items)gear.push({classId,spec,profession,name,role,guideLevel:30,skill:skills[name]||null,reason,source,status:'sourced',updated:'2026-10-27'});
 }
 const physical=B('A physical-damage craft recommended in the current class guide. Compare it with your equipped item before spending materials.','En craft för fysisk skada som rekommenderas i aktuell klassguide. Jämför med din utrustning innan du lägger material.');
 const healing=B('A healing-oriented option in the current class guide. Check the spell-power and mana stats against your current item.','Ett healingalternativ i aktuell klassguide. Jämför spell power och mana-stats med ditt nuvarande föremål.');
 const caster=B('A caster option in the current class guide. Match school-specific bonuses to your build.','Ett casteralternativ i aktuell klassguide. Matcha skolspecifika bonusar mot din build.');
 const tank=B('A tank option from the current class guide. Compare armor, survival and threat stats for your role.','Ett tankalternativ från aktuell klassguide. Jämför rustning, överlevnad och threat-stats för din roll.');
 for(const spec of ['Arms','Fury'])add('warrior',spec,'Blacksmithing',spec==='Fury'?['Veteran’s Silvered Chain Helm','Officer’s Belt']:['Officer’s Belt','Veteran’s Silvered Chain Leggings','Veteran’s Chain Helm','Veteran’s Silvered Chain Shirt'],physical);
 add('warrior','Protection','Blacksmithing',['Officer’s Belt','Veteran’s Silvered Chain Leggings','Veteran’s Chain Helm','Veteran’s Silvered Chain Shirt','Cloudy Skyforged Pauldrons'],tank,'Tank');add('warrior','Protection','Leatherworking',['Barbaric Bracers'],tank,'Tank');add('warrior','Protection','Engineering',['Minor Recombobulator'],tank,'Tank');
 add('paladin','Retribution','Blacksmithing',['Veteran’s Silvered Chain Helm','Crusader’s Gloves','Crusader’s Chain Belt','Shining Silver Breastplate'],physical);add('paladin','Retribution','Enchanting',['Tenets of the Silver Hand'],physical);
 add('paladin','Protection','Blacksmithing',['Crusader’s Chain Helm','Crusader’s Silvered Chain Shirt','Crusader’s Silvered Chain Leggings','Sterling Silver Shoulders'],tank,'Tank');add('paladin','Protection','Enchanting',['Tenets of the Silver Hand'],tank,'Tank');add('paladin','Protection','Tailoring',['Radiant Slippers'],tank,'Tank');
 add('paladin','Holy','Blacksmithing',['Acolyte’s Chain Helm','Acolyte’s Silvered Chain Leggings','Acolyte’s Silvered Chain Shirt','Prefect’s Belt'],healing,'Healer');
 for(const spec of ['Beast Mastery','Marksmanship','Survival']){add('hunter',spec,'Leatherworking',spec==='Survival'?['Skulker’s Leather Belt','Brawler’s Leather Tunic','Dusky Leather Armor','Barbaric Shoulders']:['Stalker’s Leather Belt','Dusky Leather Armor'],physical);}
 for(const spec of ['Assassination','Combat','Subtlety'])add('rogue',spec,'Leatherworking',['Brawler’s Leather Items','Barbaric Shoulders','Dusky Leather Armor','Skulker’s Leather Belt'],physical);
 add('druid','Feral','Leatherworking',['Brawler’s Leather Items','Barbaric Shoulders','Prowler’s Leather Belt','Barbaric Bracers'],physical);add('druid','Feral','Leatherworking',['Defender’s Leather Helm','Defender’s Leather Tunic','Defender’s Leather Gloves','Skulker’s Leather Belt','Defender’s Leather Kilt'],tank,'Tank');
 add('druid','Balance','Leatherworking',['Totemic Leather Hood','Totemic Leather Armor','Totemic Leather Pants','Moonglow Boots','Skycaller’s Leather Belt'],caster);add('druid','Balance','Enchanting',['Soulstaff','Orb of Mystic Insight'],caster,'DPS',{'Soulstaff':140,'Orb of Mystic Insight':140});
 add('druid','Restoration','Leatherworking',['Wisdom’s Leather Helm','Mender’s Leather Belt','Wisdom’s Leather Leggings'],healing,'Healer');add('druid','Restoration','Tailoring',['Filigreed Pristine Circlet','Pristine Leggings','Gilded Slippers'],healing,'Healer',{'Filigreed Pristine Circlet':125});add('druid','Restoration','Enchanting',['Orb of Souls'],healing,'Healer',{'Orb of Souls':140});
 add('shaman','Enhancement','Leatherworking',['Toughened Leather Gloves','Skirmisher’s Leather Belt'],physical);add('shaman','Elemental','Leatherworking',['Totemic Leather Helm','Totemic Leather Tunic','Totemic Leather Leggings','Totemic Leather Gloves','Skycaller’s Leather Belt'],caster);add('shaman','Elemental','Enchanting',['Polished Driftwood Icon'],caster);add('shaman','Elemental','Tailoring',['Invoker’s Mantle','Spidersilk Boots'],caster);
 add('shaman','Restoration','Leatherworking',['Totemic Leather Helm','Totemic Leather Tunic','Totemic Leather Leggings','Totemic Leather Gloves'],healing,'Healer');add('shaman','Restoration','Enchanting',['Polished Driftwood Icon'],healing,'Healer');add('shaman','Restoration','Tailoring',['Invoker’s Mantle','Spidersilk Boots'],healing,'Healer');
 for(const [spec,prefix]of [['Arcane','Pearly'],['Fire','Flame'],['Frost','Silky']]){
  add('mage',spec,'Tailoring',['Filigreed '+prefix+' Circlet',prefix+' Gown',prefix+' Sash',prefix+' Leggings'],B(prefix+' pieces target '+spec+' damage; several new pieces are only usable by their crafter.',prefix+'-delar är inriktade på '+spec+'-skada; flera nya delar kan bara användas av den som craftar dem.'),'DPS',{['Filigreed '+prefix+' Circlet']:125});
  add('mage',spec,'Enchanting',['Glimmering Staff','Soulstaff','Orb of Mystic Insight'],caster,'DPS',{'Glimmering Staff':140,'Soulstaff':140,'Orb of Mystic Insight':140});add('mage',spec,'Engineering',['Green Tinted Goggles','Bright-Eye Goggles','Minor Recombobulator','Mechanical Dragonling'],caster);
 }
 for(const spec of ['Discipline','Holy','Shadow']){
  const role=spec==='Shadow'?'DPS':'Healer',reason=role==='DPS'?caster:healing,prefix=role==='DPS'?'Shadow':'Pristine';
  add('priest',spec,'Tailoring',['Filigreed '+prefix+' Circlet',prefix+' Gown',prefix+' Leggings'],reason,role,{['Filigreed '+prefix+' Circlet']:125});add('priest',spec,'Enchanting',['Glimmering Staff','Soulstaff','Orb of Mystic Insight','Greater Mystic Wand'],reason,role,{'Glimmering Staff':140,'Soulstaff':140,'Orb of Mystic Insight':140});add('priest',spec,'Engineering',['Green Lens'],reason,role);
 }
 for(const spec of ['Affliction','Demonology','Destruction']){add('warlock',spec,'Tailoring',['Novice Arcanist’s Sash','Filigreed Shadow Gown','Black Slippers','Invoker’s Mantle'],caster,'DPS',{'Novice Arcanist’s Sash':35,'Black Slippers':140});add('warlock',spec,'Enchanting',['Glimmering Staff','Soulstaff'],caster,'DPS',{'Glimmering Staff':140,'Soulstaff':140});}
 function suggestions(c,build,catalog){const f=focus(c,build,catalog),seen=new Set();return gear.filter(g=>g.classId===c.classId&&g.role===c.role&&c.professions.includes(g.profession)&&(!f.spec||g.spec===f.spec)).filter(g=>{const key=g.profession+'|'+g.name;if(seen.has(key))return false;seen.add(key);return true;});}
 return {sources,routes,shopping,fishingZones,specializations,focus,gear,suggestions};
});
