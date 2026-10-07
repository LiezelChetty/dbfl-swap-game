(function(root){
  'use strict';
  function adjacent(a,b,size){return Math.abs(a%size-b%size)+Math.abs(Math.floor(a/size)-Math.floor(b/size))===1;}
  function rng(seed){let value=2166136261;for(const ch of String(seed)){value^=ch.charCodeAt(0);value=Math.imul(value,16777619);}return ()=>{value+=0x6D2B79F5;let t=value;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
  function createPuzzle(seed,size=5){
    if(![5,6,7].includes(size))throw new Error('Unsupported board size');
    const random=rng(seed);let solution=[];
    for(let row=0;row<size;row++)for(let col=0;col<size;col++)solution.push(row*size+(row%2?size-1-col:col));
    // Backbite moves reshape a complete path without losing any grid cells.
    for(let step=0;step<size*size*45;step++){
      const head=random()<.5,end=head?solution[0]:solution[solution.length-1];
      const candidates=solution.map((cell,index)=>({cell,index})).filter(({cell,index})=>adjacent(end,cell,size)&&(head?index>1:index<solution.length-2));
      if(!candidates.length)continue;
      const j=candidates[Math.floor(random()*candidates.length)].index;
      solution=head?solution.slice(0,j).reverse().concat(solution.slice(j)):solution.slice(0,j+1).concat(solution.slice(j+1).reverse());
    }
    const count=size===5?7:size===6?9:11,checkpoints=[];
    for(let number=1;number<=count;number++)checkpoints.push({number,cell:solution[Math.round((number-1)*(solution.length-1)/(count-1))]});
    return {seed:String(seed),size,solution,checkpoints,lookup:Object.fromEntries(checkpoints.map(p=>[p.cell,p.number]))};
  }
  function extendPath(puzzle,path,cell){
    const {size,checkpoints,lookup}=puzzle;
    if(!Number.isInteger(cell)||cell<0||cell>=size*size)return {path,error:'Choose a square inside the grid.'};
    if(!path.length){return cell===checkpoints[0].cell?{path:[cell],error:''}:{path,error:'Start at checkpoint 1.'};}
    const previous=path.indexOf(cell);
    if(previous>=0)return {path:path.slice(0,previous+1),error:''};
    if(!adjacent(path[path.length-1],cell,size))return {path,error:'Move one square up, down, left or right.'};
    const next=path.reduce((number,item)=>lookup[item]?lookup[item]+1:number,1);
    if(lookup[cell]&&lookup[cell]!==next)return {path,error:'Connect checkpoint '+next+' next.'};
    if(lookup[cell]===checkpoints.length&&path.length!==size*size-1)return {path,error:'Fill every square before reaching the final checkpoint.'};
    const updated=path.concat(cell);return {path:updated,error:'',won:updated.length===size*size&&cell===checkpoints[checkpoints.length-1].cell};
  }
  const api={adjacent,createPuzzle,extendPath};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ConnectEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
