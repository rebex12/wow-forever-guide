'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TalentEditor=api;})(typeof window!=='undefined'?window:globalThis,function(){
 const empty=(classId,catalog)=>catalog.classes[classId].trees.map(t=>t.talents.map(()=>0));
 const total=b=>b.allocations.flat().reduce((a,n)=>a+n,0);
 function check(b,catalog,tree,index){
  const ts=catalog.classes[b.classId]?.trees,t=ts?.[tree]?.talents[index];if(!t)return 'unknown';
  if(total(b)>=51)return 'budget';if(b.allocations[tree][index]>=t.max)return 'max';
  const prior=b.allocations[tree].reduce((n,p,j)=>n+(ts[tree].talents[j].row<t.row?p:0),0);
  if(prior<t.required)return 'tier';
  if(t.requires.some(r=>(b.allocations[tree][ts[tree].talents.findIndex(x=>x.id===r.id)]||0)<r.qty))return 'prerequisite';
  if((b.startLevel||10)+total(b)<t.minLevel)return 'level';return '';
 }
 function add(b,catalog,tree,index){const error=check(b,catalog,tree,index);if(error)return {ok:false,error};b.allocations[tree][index]++;b.order.push({tree,index});return {ok:true};}
 function validOrder(b,catalog,order){const trial={...b,allocations:empty(b.classId,catalog),order:[]};for(const p of order)if(!add(trial,catalog,p.tree,p.index).ok)return false;return true;}
 function remove(b,catalog,tree,index){
  let i=b.order.length-1;while(i>=0&&(b.order[i].tree!==tree||b.order[i].index!==index))i--;
  if(i<0)return {ok:false,error:'empty'};
  const order=b.order.filter((_,j)=>j!==i);if(!validOrder(b,catalog,order))return {ok:false,error:'dependent'};
  b.order=order;b.allocations[tree][index]--;return {ok:true};
 }
 function plan(b,catalog){
  if(b.order.length===total(b)&&validOrder(b,catalog,b.order))return b.order.map(p=>({...p}));
  const trial={...b,allocations:empty(b.classId,catalog),order:[]};
  while(total(trial)<total(b)){
   let found=false;
   for(let tree=0;tree<3&&!found;tree++)for(let index=0;index<trial.allocations[tree].length;index++)if(trial.allocations[tree][index]<b.allocations[tree][index]&&!check(trial,catalog,tree,index)){add(trial,catalog,tree,index);found=true;break;}
   if(!found)return null;
  }
  return trial.order;
 }
 // Place the tooltip wholly beside, above or below its owner. It never intersects the talent.
 function tooltip(rect,box,viewport){
  const pad=8,gap=12,w=Math.min(box.width,viewport.width-pad*2),height=viewport.height;
  const right=viewport.width-rect.right-gap-pad,left=rect.left-gap-pad;
  if(right>=w)return {left:rect.right+gap,top:Math.max(pad,Math.min(rect.top,height-box.height-pad)),maxHeight:height-pad*2};
  if(left>=w)return {left:rect.left-gap-w,top:Math.max(pad,Math.min(rect.top,height-box.height-pad)),maxHeight:height-pad*2};
  const above=Math.max(0,rect.top-gap-pad),below=Math.max(0,height-rect.bottom-gap-pad),up=above>=below;
  const maxHeight=up?above:below,h=Math.min(box.height,maxHeight);
  return {left:Math.max(pad,Math.min(rect.left,viewport.width-w-pad)),top:up?rect.top-gap-h:rect.bottom+gap,maxHeight};
 }
 return {empty,total,check,add,remove,validOrder,plan,tooltip};
});
