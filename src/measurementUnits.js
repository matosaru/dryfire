export const MEASUREMENT_SYSTEMS=Object.freeze(['metric','imperial']);

export function normalizeMeasurementSystem(value){return value==='imperial'?'imperial':'metric';}

export function distanceHelp(value){return normalizeMeasurementSystem(value)==='imperial'
 ?{close:'under 1 ft',practice:'1–3 ft',far:'over 3 ft'}
 :{close:'under 30 cm',practice:'30 cm–1 m',far:'over 1 m'};}
