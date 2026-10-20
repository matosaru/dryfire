import { timingProbeRejected } from './timing-probe-policy.mjs';
import { spawnSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
const argument=name=>process.argv.find(value=>value.startsWith(`--${name}=`))?.slice(name.length+3);
const baseline=argument('baseline');if(!baseline)throw Error('Provide --baseline for the controlled regression probe.');
const output=argument('output')||'performance-results/timing-probe.json';
rmSync(output,{force:true});
const result=spawnSync(process.execPath,['--experimental-vm-modules','tools/performance/measure-browser.mjs',`--baseline=${baseline}`,`--candidate=${baseline}`,'--browser=chromium',`--runs=${argument('runs')||10}`,'--timing-probe',`--output=${output}`],{encoding:'utf8',maxBuffer:1024*1024});
let report;
try{report=JSON.parse(readFileSync(output,'utf8'));}catch{throw Error(`Regression probe failed before producing evidence: ${result.error?.message||result.stderr}`);}
if(!timingProbeRejected(result,report)) {
  throw Error(`Performance gate did not demonstrate the deliberate startup slowdown: ${JSON.stringify(report.errors)}.`);
}
console.log('Performance gate rejected the deliberate 250 ms startup slowdown on otherwise identical assets. Detailed probe samples retained.');
