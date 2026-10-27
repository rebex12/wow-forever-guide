/* Quest dependency rules shared by the quest list, zone tips, dungeons and search. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.QuestChains=api;})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 function available(q,c,quests,isDone){
  const byId=new Map(quests.map(x=>[x.id,x]));
  const done=id=>{const item=byId.get(id);return item?isDone(item,c):!!c.done[id];};
  return (!q.requiresQuests?.length||q.requiresQuests.every(done))&&(!q.requiresAny?.length||q.requiresAny.some(done));
 }
 function laterRewards(q,c,quests,matches,isDone){
  const found=new Set([q.id]),out=[];
  for(let i=0;i<quests.length;i++){
   let changed=false;
   for(const candidate of quests){
    if(found.has(candidate.id)||!matches(candidate,c))continue;
    if([...(candidate.requiresQuests||[]),...(candidate.requiresAny||[])].some(id=>found.has(id))){found.add(candidate.id);changed=true;if(candidate.highValue&&candidate.reward&&!isDone(candidate,c))out.push(candidate);}
   }
   if(!changed)break;
  }
  return out.sort((a,b)=>a.level-b.level).slice(0,3);
 }
 return {available,laterRewards};
});
