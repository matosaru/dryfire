import {distanceHelp,normalizeMeasurementSystem} from '../src/measurementUnits.js';

test.each([['metric','metric'],['imperial','imperial'],[undefined,'metric'],['unknown','metric']])('normalizes %s to %s',(value,expected)=>expect(normalizeMeasurementSystem(value)).toBe(expected));
test('distance help has one unit system and stable category meanings',()=>{
 expect(distanceHelp('metric')).toEqual({close:'under 30 cm',practice:'30 cm–1 m',far:'over 1 m'});
 expect(distanceHelp('imperial')).toEqual({close:'under 1 ft',practice:'1–3 ft',far:'over 3 ft'});
});
