const assert=require('node:assert/strict'),fs=require('node:fs');
const {LESSONS,QUANTITIES}=require('../src/catalog.js'),{model,mutualGeometry}=require('../src/models.js');
const defaults=id=>Object.fromEntries(LESSONS.find(l=>l.id===id).params.map(p=>[p.key,p.value]));
const value=(s,name)=>s.metrics.find(m=>m.name===name).value;
assert.equal(LESSONS.length,104);assert.ok(!/[\u0900-\u097f]/.test(fs.readFileSync(__dirname+'/../dist/index.html','utf8')));
for(const l of LESSONS){const e=l.experiment,p=l.params.find(p=>p.key===e.key);assert.ok(p,l.id);for(const v of[e.a,e.b])assert.ok(v>=p.min&&v<=p.max,l.id+' comparison range');let s=model(l.id,defaults(l.id),.6);assert.ok(s.objects.length,l.id);}
let p=defaults('faraday');for(const mode of[0,1,2])for(const theta of[0,30,90,180])for(const t of[.1,.6,1.2]){let q={...p,mode,theta},h=1e-6,s=model('faraday',q,t),d=(value(model('faraday',q,t+h),'Flux per turn')-value(model('faraday',q,t-h),'Flux per turn'))/(2*h*1000);assert.ok(Math.abs(value(s,'Induced emf')+p.N*d)<1e-7);let a=value(s,'Signed plane angle α');assert.ok(a>=-90&&a<=90);}
for(const mode of[0,1,2])assert.ok(value(model('faraday',{...p,mode,f:0},1),'Induced emf')===0);
p=defaults('mutual');assert.ok(mutualGeometry({...p,d:.6}).M>mutualGeometry({...p,d:2}).M);assert.ok(mutualGeometry({...p,theta:0}).M>mutualGeometry({...p,theta:85}).M);assert.ok(Math.abs(mutualGeometry({...p,N1:2*p.N1}).M/mutualGeometry(p).M-2)<1e-10);assert.equal(value(model('mutual',{...p,closed:0},.4),'Secondary current'),0);assert.ok(value(model('mutual',{...p,f:0},.4),'Secondary emf')===0);
console.log('PASS: English-only portal, 104 valid comparison pairs, Faraday numerical derivative in all three modes, principal angles, static-field limit, mutual coupling distance/tilt/turn scaling and open-circuit limit.');
