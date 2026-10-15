/* District203 live catalog fallback for the source package, before the full build runs.
 * No code from upstream is executed here. Only validated catalog metadata is read.
 */
window.NV_DISTRICT_READY=(async()=>{
 if(window.NV_DISTRICT_STATUS?.status==='imported')return;
 const status={status:'pending',message:'Full native import runs during GitHub deployment.'};
 window.NV_DISTRICT_STATUS=status;
 const aliases={adofai:'adanceoffireandice',adventurecapatalist:'adventurecapitalist',ducklife:'ducklife1',snowrider:'snowrider3d',fireboywatergirl:'fireboyandwatergirl',fivenightsatfreddys:'fnaf',fivenightsatfreddys2:'fnaf2',fivenightsatfreddys3:'fnaf3',fivenightsatfreddys4:'fnaf4'};
 const norm=s=>{const n=String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]/g,'');return aliases[n]||n};
 try{
  const response=await fetch('https:'+'//raw.githubusercontent.com/district203/district203.github.io/main/games.json',{signal:AbortSignal.timeout(6500),cache:'no-cache'});
  if(!response.ok)throw Error('District catalog returned '+response.status);
  const raw=await response.json(),list=Array.isArray(raw)?raw:raw.games;
  if(!Array.isArray(list))throw Error('Invalid District203 catalog');
  const paths=new Set(),games=list.filter(g=>{if(!g||typeof g.name!=='string'||typeof g.href!=='string'||!g.name.trim()||!g.href||g.href.includes('..')||/[\\?#:\u0000-\u0020]/.test(g.href)||g.href.startsWith('/')||paths.has(g.href))return false;paths.add(g.href);return true});
  const used=new Set(),index=new Map();
  for(const g of games)for(const n of new Set([norm(g.name),norm(g.href)])){if(!index.has(n))index.set(n,[]);index.get(n).push(g)}
  let replaced=0,added=0;
  const update=(old,g)=>{const url='https://district203.github.io/games/'+g.href.split('/').map(encodeURIComponent).join('/')+(/\.[a-z0-9]+$/i.test(g.href)?'':'/');Object.assign(old,{url,original:url,source:'District203',districtPath:g.href,districtRanking:g.ranking??999999,hosted:false,nativeAvailable:false});used.add(g.href)};
  for(const old of NV_CATALOG.games){if(old.integrated)continue;const matches=new Map();for(const n of new Set([norm(old.title),norm(old.id)]))for(const g of index.get(n)||[])matches.set(g.href,g);const exact=[...matches.values()].filter(g=>norm(g.name)===norm(old.title));const selected=exact.length===1?exact[0]:matches.size===1?[...matches.values()][0]:null;if(selected){update(old,selected);replaced++}}
  for(const g of games){if(used.has(g.href))continue;const item={id:'district-'+g.href.toLowerCase().replace(/[^a-z0-9-]/g,'-'),title:g.name,kind:'game',image:'assets/city.png',categories:Array.isArray(g.categories)?g.categories.filter(v=>typeof v==='string'):['Miscellaneous']};update(item,g);NV_CATALOG.games.push(item);added++}
  Object.assign(status,{status:'live-links',message:'District203 live catalog loaded. Native files are imported during the GitHub build.',replacedCount:replaced,addedCount:added,nativeGamesCopied:0,totalGames:NV_CATALOG.games.length});
 }catch(error){status.message='District203 catalog could not load here. Original catalog is unchanged; deploy with the included GitHub workflow to run the full import.';console.warn(status.message,error.message)}
})();
