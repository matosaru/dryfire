export type MeasurementSystem='metric'|'imperial';
export declare const MEASUREMENT_SYSTEMS:readonly MeasurementSystem[];
export declare function normalizeMeasurementSystem(value:unknown):MeasurementSystem;
export declare function distanceHelp(value:unknown):{close:string;practice:string;far:string};
