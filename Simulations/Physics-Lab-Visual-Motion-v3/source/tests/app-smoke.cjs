const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
class Element{constructor(tag='div'){this.tagName=tag;this.children=[];this.attrs={};this.dataset={};this.style={};this.value='';this.checked=true;this.hidden=false;this.clientWidth=700;this.clientHeight=350;const classes=new Set();this.classList={toggle(k,on){if(on===undefined)on=!classes.has(k);on?classes.add(k):classes.delete(k);return on;},remove(k){classes.delete(k)},contains(k){return classes.has(k);}};}append(...v){this.children.push(...v)}replaceChildren(...v){this.children=v;}setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k];}addEventListener(){}remove(){}focus(){}click(){}setPointerCapture(){}}
const nodes={},storage={},grades=['all','11','12'].map(x=>{let e=new Element('button');e.dataset.grade=x;return e;});
const get=id=>nodes[id]??=(new Element());get('scope-filter').value='all';get('speed').value='1';
const context={console,document:{documentElement:new Element('html'),getElementById:get,createElement:tag=>new Element(tag),createElementNS:(_,tag)=>new Element(tag),querySelectorAll:sel=>sel==='[data-grade]'?grades:[],body:new Element(),addEventListener(){}},window:{scrollTo(){},addEventListener(){}},navigator:{},location:{protocol:'file:',hash:'',hostname:''},history:{replaceState(){}},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},requestAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},URL,Blob};
vm.createContext(context);const root=path.resolve(__dirname,'..');const code=fs.readFileSync(root+'/dist/index.html','utf8').split('<script>')[1].split('</script>')[0];vm.runInContext(code,context);assert.equal(get('cards').children.length,104);vm.runInContext('for(const l of LESSONS){openLesson(l.id);render(true);}',context);assert.equal(get('notice').textContent,undefined);assert.equal(JSON.parse(storage['physics-library-v3']).saved.length,104);vm.runInContext("openLesson('projectile');setParam('angle',30);saveCurrent();",context);assert.equal(JSON.parse(storage['physics-library-v3']).saved.length,105);get('search').value='capacitor';vm.runInContext('renderLibrary()',context);assert.equal(get('cards').children.length,3);vm.runInContext("toggleFavorite('projectile');renderSaved();",context);assert.equal(JSON.parse(storage['physics-library-v3']).favorites[0],'projectile');console.log('PASS: app logic in a simulated DOM — 104 lesson openings, graph generation, local settings persistence, deduplication, search and favourites. Not a real browser or visual test.');

vm.runInContext(`for(const l of LESSONS){openLesson(l.id);comparisonOpen=true;renderComparison();for(const step of [1,2,3]){teachingStep=step;render();}chartMode='sweep';render(true);}`,context);assert.equal(get('notice').textContent,undefined);
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
function serial(e){return '<'+e.tagName+' '+Object.entries(e.attrs).map(([k,v])=>k+'="'+esc(v)+'"').join(' ')+'>'+esc(e.textContent||'')+e.children.map(serial).join('')+'</'+e.tagName+'>';}
fs.mkdirSync(root+'/docs/scenes',{recursive:true});
for(const id of vm.runInContext('LESSONS.map(l=>l.id)',context)){vm.runInContext('openLesson('+JSON.stringify(id)+');time=0.6;render(true)',context);let svg=get('scene');svg.tagName='svg';svg.setAttribute('xmlns','http://www.w3.org/2000/svg');fs.writeFileSync(root+'/docs/scenes/'+id+'.svg',serial(svg));}
console.log('PASS: all 104 comparison views, three teaching stages and parameter sweeps; exported 104 rendered SVG scenes.');

vm.runInContext("openLesson('potential');$('classroom').onclick();",context);assert.equal(vm.runInContext('teachingFullscreen',context),true);assert.ok(context.document.body.classList.contains('teaching-fullscreen'));vm.runInContext("$('toggle-controls').onclick()",context);assert.ok(context.document.body.classList.contains('controls-collapsed'));assert.equal(get('toggle-controls').attrs['aria-expanded'],'false');vm.runInContext("$('toggle-controls').onclick();$('exit-fullscreen').onclick()",context);assert.equal(vm.runInContext('teachingFullscreen',context),false);
vm.runInContext("for(const l of LESSONS){openLesson(l.id);for(let i=0;i<l.cases.length;i++){$('case-select').value=String(i);$('case-select').onchange();}}",context);assert.equal(get('notice').textContent,undefined);
for(const source of [0,1,2,3,4]){vm.runInContext("openLesson('potential');params.source="+source+";render(true)",context);let svg=get('scene');svg.tagName='svg';svg.setAttribute('xmlns','http://www.w3.org/2000/svg');fs.writeFileSync(root+'/docs/scenes/potential-source-'+source+'.svg',serial(svg));}
console.log('PASS: all common-case menu actions, expanded fullscreen fallback, minimise/restore controls and exit state (simulated DOM; native fullscreen and responsive layout not tested).');

context.window.matchMedia=()=>({matches:true});
vm.runInContext("openLesson('coulomb');$('classroom').onclick();",context);
assert.equal(get('experiment-panel').hidden,true,'Mobile fullscreen starts unobstructed');
vm.runInContext("$('toggle-controls').onclick();",context);
assert.equal(get('experiment-panel').hidden,false,'Show controls opens panel');
vm.runInContext("$('minimise-controls').onclick();",context);
assert.equal(get('experiment-panel').hidden,true,'Panel-local minimise hides panel');
assert.equal(get('toggle-controls').textContent,'Show controls');
vm.runInContext("$('exit-fullscreen').onclick();",context);
assert.equal(get('experiment-panel').hidden,false,'Normal lesson restores controls');
console.log('PASS: mobile default collapse, explicit hidden state, panel-local minimise and normal-view restoration.');

vm.runInContext(`for(const l of LESSONS){openLesson(l.id);if($('play').disabled)throw Error('Playback disabled: '+l.id);let before=JSON.stringify({objects:model(l.id,params,time).objects,metrics:model(l.id,params,time).metrics});$('play').onclick();let start=JSON.stringify({objects:model(l.id,params,time).objects,metrics:model(l.id,params,time).metrics});for(let i=1;i<=80;i++)frame(lastFrame+50);let after=JSON.stringify({objects:model(l.id,params,time).objects,metrics:model(l.id,params,time).metrics});if(before===after&&start===after&&playbackKind==='sweep')throw Error('Sweep did not advance: '+l.id);playing=false;}`,context);
vm.runInContext("openLesson('work');$('play').onclick();for(let i=0;i<130;i++)frame(lastFrame+50);",context);
assert.equal(vm.runInContext('params.x',context),10);assert.equal(vm.runInContext('playing',context),false);assert.match(get('play').textContent,/Demonstrate/);
vm.runInContext("$('reset-time').onclick();",context);assert.equal(vm.runInContext('params.x',context),vm.runInContext("current.params.find(p=>p.key==='x').value",context));
vm.runInContext("openLesson('capnetwork');$('timeline').value='3';$('timeline').oninput();",context);assert.equal(vm.runInContext('params.voltage',context),6);
console.log('PASS: playback enabled and advanced across 104 lessons; Work sweep completion/pause/reset and capacitor voltage scrubbing.');

vm.runInContext("openLesson('interference');toggleLiveChart(true);render(true);$('live-axis').value='d';$('live-axis').onchange();$('playback-mode').value='sweep';$('playback-mode').onchange();time=1;applySweep();render(true);time=4;applySweep();render(true);",context);
assert.equal(vm.runInContext('playbackKind',context),'sweep');assert.ok(get('live-plot').children.length>0);assert.ok(get('quantity-bars').children.length>0);
for(const [name,settings]of [['narrow',{d:.8,D:1.5}],['wide',{d:.2,D:1.5}],['near',{d:.5,D:.5}],['far',{d:.5,D:3}]]){vm.runInContext("openLesson('interference');Object.assign(params,"+JSON.stringify(settings)+");time=1;render(true)",context);let svg=get('scene');svg.tagName='svg';svg.setAttribute('xmlns','http://www.w3.org/2000/svg');fs.writeFileSync(root+'/docs/scenes/ydse-'+name+'.svg',serial(svg));}
console.log('PASS: selectable live chart, visual quantity bars and combined parameter-sweep/wave playback.');
