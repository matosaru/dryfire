import type {ProgressModel} from '@dryfire/ui/ProgressContent';
export type ProgressGroup={mode:string;config:{startSource?:string;soundAtStart:boolean;delayMode:string;fixedDelaySeconds:number;randomMinSeconds:number;randomMaxSeconds:number;parSeconds:number}};
export type ProgressPoint={date:number;value:number;count:number;hits:number;misses:number};
export type ProgressSummary={sessions:number;hitRate:number|null;hits:number;misses:number;rate:number|null;shots:number;metrics:{median:number|null;mean:number|null;spread:number|null};trend:{direction:string;change:number|null;compared:number}|null;metric:string;unit:string;points:ProgressPoint[]};

export const progressFormat=(value:number|null,unit='ms')=>value===null?'—':unit==='ms'?`${(value/1000).toFixed(2)} s`:`${value.toFixed(1)} ${unit}`;
export function progressTiming(group:ProgressGroup){const c=group.config;return `${c.startSource==='external'?'External beep':c.soundAtStart?'App beep':'Silent start'} · ${c.delayMode==='fixed'?`${c.fixedDelaySeconds}s fixed`:`${c.randomMinSeconds}–${c.randomMaxSeconds}s random`}${group.mode==='par'?` · ${c.parSeconds}s par`:''}`;}
/** Presentation only; comparable grouping, samples and statistics remain in the existing domain module. */
export function progressPresentation(group:ProgressGroup|undefined,data:ProgressSummary|undefined,meanRate:number|null):ProgressModel{
 if(!group||!data)return{empty:'Complete practice sessions to see your timing and progress here.'};
 const cards=[{label:'Sessions',value:String(data.sessions)}];
 const card=(label:string,value:string)=>cards.push({label,value});
 if(group.mode==='par'){card('Hit rate',progressFormat(data.hitRate,'%'));card('Hits / misses',`${data.hits} / ${data.misses}`);card('Median hit time',progressFormat(data.metrics.median));}
 else if(group.mode==='free'){card('Median rate',progressFormat(data.rate,'clicks/min'));card('Mean rate',progressFormat(meanRate,'clicks/min'));card('Recognized clicks',String(data.shots));}
 else{card('Median timing',progressFormat(data.metrics.median));card('Mean timing',progressFormat(data.metrics.mean));card('Timing variation',progressFormat(data.metrics.spread));}
 const trend=data.trend;
 let description=`More sessions needed for comparison · ${data.points.length} of 4 comparable sessions available.`;
 if(trend){const direction=trend.direction==='unchanged'?'Unchanged':group.mode==='control'?trend.direction==='lower'?'Steadier intervals':'More variable intervals':group.mode==='par'?trend.direction==='higher'?'Higher hit rate':'Lower hit rate':group.mode==='free'?trend.direction==='higher'?'Higher click rate':'Lower click rate':trend.direction==='lower'?'Faster detected timing':'Slower detected timing';description=`${direction}${trend.change===null?'':` · ${Math.abs(trend.change).toFixed(1)} ${data.unit==='%'?'percentage points':'%'}`} · recent ${trend.compared} vs earlier ${trend.compared} sessions.`;}
 const model:ProgressModel={timing:progressTiming(group),cards,trend:description,metric:data.metric};
 if(!data.points.length)return{...model,empty:'No completed timing samples in this range. Choose a wider range or finish another session.'};
 const values=data.points.map(point=>point.value),low=data.unit==='%'?0:Math.max(0,Math.min(...values)*.9),high=data.unit==='%'?100:Math.max(low+1,Math.max(...values)*1.1);
 const x=(index:number)=>data.points.length===1?324:72+index/(data.points.length-1)*504,y=(value:number)=>180-(value-low)/(high-low)*156;
 return{...model,chart:{label:`${data.metric} across ${data.points.length} saved sessions; values are also listed in the table below.`,grid:[0,.5,1].map(fraction=>{const value=low+(high-low)*fraction;return{y:y(value),label:data.unit==='ms'?(value/1000).toFixed(2):value.toFixed(1)};}),line:data.points.map((point,index)=>`${x(index)},${y(point.value)}`).join(' '),dots:data.points.map((point,index)=>({x:x(index),y:y(point.value),title:`${new Date(point.date).toLocaleString()}: ${progressFormat(point.value,data.unit)}`})),dates:([ [0,'start'],[data.points.length-1,'end'] ] as [number,'start'|'end'][]).map(([index,anchor])=>({x:x(index),anchor,text:new Date(data.points[index].date).toLocaleDateString()})),note:`One point per session, ordered by date · ${data.unit==='ms'?'seconds':data.unit}. Completed outcomes only; partial attempts are excluded.`,rows:data.points.map(point=>[new Date(point.date).toLocaleString(),progressFormat(point.value,data.unit),String(point.count),`${point.hits} / ${point.misses}`])}};
}
