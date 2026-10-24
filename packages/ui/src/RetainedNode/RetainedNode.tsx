import {useLayoutEffect,useRef} from 'react';
/** A non-layout boundary for a stable, independently owned native subtree. */
export function RetainedNode({node,className}:{node:HTMLElement;className?:string}){
 const ref=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{const host=ref.current!;host.append(node);return()=>{if(node.parentNode===host)host.removeChild(node);};},[node]);
 return <div className={className} style={{display:'contents'}} ref={ref}/>;
}
