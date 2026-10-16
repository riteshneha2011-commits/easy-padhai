'use strict';
const QUANTITIES={electric:{color:'#40d7ff',symbol:'E',name:'Electric field'},magnetic:{color:'#bb8cff',symbol:'B',name:'Magnetic field'},gravity:{color:'#66e49c',symbol:'g',name:'Gravitational field'},velocity:{color:'#ffad56',symbol:'v',name:'Velocity'},force:{color:'#ff6b87',symbol:'F',name:'Force'},acceleration:{color:'#ffe374',symbol:'a',name:'Acceleration'},current:{color:'#ffd15a',symbol:'I',name:'Conventional current'},flux:{color:'#f3a2df',symbol:'Φ',name:'Linked flux / area'},normal:{color:'#f1f5ff',symbol:'n',name:'Surface normal'},light:{color:'#ffdb82',symbol:'ray',name:'Light / energy transfer'},displacement:{color:'#88e2d0',symbol:'x',name:'Displacement'},energy:{color:'#ffcb7e',symbol:'U',name:'Energy'},secondary:{color:'#d4b3ff',symbol:'B₂',name:'Induced magnetic field'}};
const EXPERIMENTS=`
vernier|x|12.3|12.7|Read 12.3 mm|Read 12.7 mm
screw|x|2.37|2.42|Read 2.37 mm|Read 2.42 mm
uncertainty|da|0.1|0.5|Precise length|Less precise length
linear|a|-1|1|Negative acceleration|Positive acceleration
vectors|angle|0|90|Parallel vectors|Perpendicular vectors
projectile|angle|30|60|Launch at 30°|Launch at 60°
circular|v|2|4|Speed 2 m/s|Speed 4 m/s
incline|angle|10|40|Gentle slope|Steep slope
atwood|m2|3|6|Balanced masses|Unequal masses
banking|angle|0|30|Level road|Banked road
work|k|0|4|Constant force|Increasing force
energy|h|2|8|Low release|High release
collision|e|1|0|Elastic collision|Perfectly inelastic
collision2d|angle|20|60|Shallow scattering|Wide scattering
vertical|u|6|12|Insufficient speed|Complete loop
com|m2|2|6|Equal masses|Heavier right mass
torque|angle|0|90|Force along lever|Perpendicular force
inertia|shape|0|2|Ring|Solid sphere
angular|r|2|1|Arms extended|Arms contracted
rolling|shape|0|2|Rolling ring|Rolling sphere
orbit|e|0|0.3|Circular orbit|Elliptical orbit
gravity|r|0.5|2|Inside the sphere|Outside the sphere
escape|v|8|12|Bound energy|Escape energy
elastic|area|1|2|Thin wire|Thicker wire
hydrostatic|h|2|8|Shallow probe|Deep probe
hydraulic|a2|10|40|Small output area|Large output area
buoyancy|rho|600|1400|Floating block|Sinking block
bernoulli|ratio|1|0.5|Uniform pipe|Narrow outlet
viscosity|r|0.3|0.6|Small sphere|Double radius
capillary|angle|20|120|Capillary rise|Capillary depression
bubble|film|1|2|Liquid drop|Soap bubble
expansion|dt|0|150|Reference temperature|Heated solid
calorimetry|m1|0.5|1.5|Less hot water|More hot water
phase|power|250|750|Low heater power|High heater power
conduction|L|0.3|0.6|Short rod|Double length
radiation|T|2000|4000|Warm emitter|Hot emitter
convection|delta|0|60|No heating difference|Heated from below
thermo|mode|0|1|Isothermal path|Adiabatic path
cycle|Tc|200|350|Cold sink|Warmer sink
gas|T|200|400|Lower temperature|Double temperature
equipartition|f|3|5|Three degrees|Five degrees
spring|A|0.5|1|Small amplitude|Double amplitude
pendulum|L|0.5|2|Short pendulum|Four times the length
wave|lambda|1|2|Short wavelength|Double wavelength
longitudinal|A|0.05|0.2|Small displacement|Stronger compression
superposition|phase|0|180|In phase|Out of phase
standing|n|1|3|Fundamental mode|Third harmonic
pipes|closed|0|1|Both ends open|One end closed
beats|df|0|2|Same frequencies|Two beats per second
coulomb|q2|2|-2|Repulsion|Attraction
field|q2|2|-2|Like charges|Electric dipole
dipole|angle|0|90|Aligned dipole|Maximum torque
flux|angle|0|90|Field normal to plane|Field along plane
gauss|r|0.5|2|Inside shell|Outside shell
potential|q|2|-2|Positive source|Negative source
capacitor|K|1|4|Vacuum gap|Dielectric inserted
capnetwork|mode|0|1|Series capacitors|Parallel capacitors
drift|E|0.5|1|Weak electric field|Double electric field
resistance|A|1|2|Thin conductor|Double area
circuit|mode|0|1|Series resistors|Parallel resistors
cell|mode|0|1|Cells in series|Cells in parallel
kirchhoff|r2|6|12|Initial branch|Double branch resistance
wheatstone|S|10|5|Balanced bridge|Unbalanced bridge
magnetic|angle|0|90|Parallel entry|Perpendicular entry
wire|I|5|-5|Current along +z|Current along −z
loop|x|0|1|At the centre|Along the axis
solenoid|I|2|-2|Forward current|Reversed current
parallel|i2|5|-5|Same-direction currents|Opposite currents
looptorque|angle|0|90|Aligned loop normal|Maximum torque
galvanometer|mode|0|1|Ammeter conversion|Voltmeter conversion
bar|angle|0|90|Horizontal magnet|Vertical magnet
materials|type|0|2|Diamagnetic response|Ferromagnetic response
faraday|theta|0|90|Maximum projected area|Zero projected area
motional|v|1|3|Slow rod|Faster rod
self|L|0.5|1.5|Small inductance|Large inductance
mutual|d|0.65|1.8|Coils close together|Coils farther apart
ac|type|0|1|Resistive load|Inductive load
resonance|R|10|40|Sharp resonance|Damped resonance
generator|f|1|2|One turn per second|Two turns per second
transformer|n2|100|400|Step down|Step up
em|lambda|1|3|Short wavelength|Long wavelength
spectrum|logf|9|15|Microwave region|Ultraviolet region
lens|u|6|1|Object outside focus|Object inside focus
mirror|f|-2|2|Concave mirror|Convex mirror
refraction|angle|30|60|Refraction|Total internal reflection
prism|n|1.3|1.6|Lower refractive index|Higher refractive index
lensmaker|p2|0|-10|First lens alone|Opposite lens power
microscope|fo|1|0.5|Standard objective|Shorter objective focal length
telescope|fe|5|10|Short eyepiece|Long eyepiece
huygens|n2|1|1.5|Equal wave speeds|Slower second medium
interference|d|0.25|0.5|Narrow separation|Double separation
diffraction|a|0.1|0.2|Narrow slit|Double slit width
photoelectric|f|3|8|Below threshold|Above threshold
debroglie|V|100|400|Lower voltage|Four times the voltage
rutherford|b|10|80|Close encounter|Distant encounter
bohr|ni|3|4|n = 3 to n = 2|n = 4 to n = 2
nucleus|A|28|56|Smaller nucleus|More nucleons
binding|dm|0.2|0.5|Small mass defect|Larger mass defect
reaction|mode|0|1|Nuclear fission|Nuclear fusion
bands|type|0|2|Conductor|Insulator
doping|type|1|2|n-type material|p-type material
junction|bias|-0.5|0.5|Reverse bias|Forward bias
diode|V|-0.3|0.6|Reverse bias|Forward bias
rectifier|mode|0|1|Half-wave circuit|Full-wave circuit
`.trim().split('\n');
for(const row of EXPERIMENTS){let[id,key,a,b,la,lb]=row.split('|'),l=LESSONS.find(l=>l.id===id);l.experiment={key,a:Number(a),b:Number(b),labels:[la,lb]};}
const getLesson=id=>LESSONS.find(l=>l.id===id);
Object.assign(getLesson('mutual'),{params:[P('I','Primary peak current',.5,3,.5,1,'A'),P('f','Current frequency',0,2,.1,.5,'Hz'),P('d','Coil separation',.6,2.4,.05,.8,'m'),P('theta','Secondary tilt (normal to primary axis)',0,85,5,0,'°'),P('N1','Primary turns',20,100,10,50),P('N2','Secondary turns',20,100,10,50),P('closed','Secondary circuit',0,1,1,1)],equation:'Φ₂ = MI₁/N₂; ε₂ = −M dI₁/dt; I₂ ≈ ε₂/R (closed circuit)',assumptions:'Air-core circular coils with radii 0.45 m and 0.35 m. Mutual inductance is evaluated with a discretised Neumann integral (48 segments per coil); the primary field uses Biot–Savart segments. Secondary R = 5 Ω; low-frequency resistive approximation neglects secondary self-inductance and source back-reaction. Displayed field lines show the instantaneous primary field, not moving magnetic material. f = 0 means steady current.'});
Object.assign(getLesson('faraday'),{params:[P('B','Field amplitude',.1,1,.1,.5,'T'),P('f','Variation / rotation frequency',0,2,.1,.5,'Hz'),P('N','Coil turns',1,20,1,10),P('theta','Initial angle: field to normal',0,180,5,30,'°'),P('area','Loop area',.01,.12,.01,.05,'m²'),P('mode','Change mechanism',0,2,1,0)],equation:'Φ = BA cosθ = BA sinα; ε = −N dΦ/dt; α = 90° − θ',assumptions:'Uniform field and ideal loop. The reference field axis is +x; B is signed when the field reverses. θ is measured from that reference axis to the surface normal; α is the signed complementary angle to the plane (−90° to 90°). Field mode: B=B₀cosωt. Rotation mode: θ=θ₀+ωt. Area mode: A=A₀[1+0.4sinωt]. The rate controls time variation; changing a paused slider does not create a persistent emf.'});
getLesson('flux').params.push(P('convention','Angle convention',0,1,1,0));getLesson('flux').params.find(p=>p.key==='angle').label='Field-to-normal angle θ';getLesson('flux').assumptions='Uniform field and flat surface. The slider always sets the angle θ from the field to the normal. The complementary signed plane angle is α = 90° − θ. The formula selector changes the explanation, not the physical orientation.';
const CHOICES={faraday:{mode:['Change field','Rotate coil','Change area']},mutual:{closed:['Open: emf only','Closed: induced current']},flux:{convention:['Normal formula: cos θ','Plane formula: sin α']},inertia:{shape:['Ring','Uniform disc','Solid sphere']},rolling:{shape:['Ring','Uniform disc','Solid sphere']},bubble:{film:['Liquid drop','Soap bubble']},thermo:{mode:['Isothermal','Adiabatic']},pipes:{closed:['Open–open','Closed–open']},gauss:{shape:['Spherical shell','Long wire','Infinite sheet']},capacitor:{mode:['Battery connected','Isolated charge']},capnetwork:{mode:['Series','Parallel']},circuit:{mode:['Series','Parallel']},cell:{mode:['Series','Parallel']},magnetic:{sign:['Negative charge','Positive charge']},galvanometer:{mode:['Ammeter','Voltmeter']},materials:{type:['Diamagnetic','Paramagnetic','Ferromagnetic']},ac:{type:['Resistor','Inductor','Capacitor']},telescope:{reflect:['Refracting','Reflecting']},reaction:{mode:['Fission','D–T fusion']},bands:{type:['Conductor','Semiconductor','Insulator']},doping:{type:['Intrinsic','n-type','p-type']},rectifier:{mode:['Half-wave','Full-wave bridge']}};
for(const l of LESSONS){for(const p of l.params){if(CHOICES[l.id]?.[p.key])p.choices=CHOICES[l.id][p.key];}l.designNote='Compare two settings, inspect the visible cause and effect, then explain the result using the model assumptions.';}
if(typeof module!=='undefined')module.exports={QUANTITIES,EXPERIMENTS};

getLesson('field').params.push(P('px','Probe x',-3,3,.1,0,'m'),P('py','Probe y',-2.5,2.5,.1,1.5,'m'));

// Standard configurations within the existing lessons.
QUANTITIES.potential={color:'#a9b5ff',symbol:'V',name:'Equipotential surface'};
const potentialLesson=getLesson('potential');
potentialLesson.params.unshift({...P('source','Source geometry',0,4,1,0),choices:['Point charge','Infinite line charge','Infinite sheet charge','Charged spherical shell','Uniformly charged solid sphere']});
potentialLesson.params.push(P('lambda','Line charge density',-5,5,.5,2,'nC/m'),P('sigma','Sheet charge density',-5,5,.5,2,'nC/m²'),P('radius','Sphere radius',.5,2,.1,1,'m'),P('reference','Zero-potential reference distance',.3,4,.1,1,'m'),{...P('shells','Surface display',0,1,1,1),choices:['Probe surface only','Nested surfaces']},P('azimuth','Probe angle around surface',0,360,5,25,'°'),P('elevation','Probe latitude / line height',-60,60,5,20,'°'));
potentialLesson.params.find(p=>p.key==='q').label='Total charge (point / sphere)';
potentialLesson.explain='Equipotentials are complete surfaces: spheres for a point charge, cylinders for an infinite line and parallel planes for an infinite sheet. Electric field is perpendicular to each surface. Move the probe around a surface: potential stays constant. Inside a charged shell the entire volume has the same potential and zero field.';
potentialLesson.equation='Point: V=kq/r. Line: ΔV=−λ ln(r/r₀)/(2πε₀). Sheet: ΔV=−σ(|x|−r₀)/(2ε₀). E=−∇V.';
potentialLesson.assumptions='Electrostatic ideal sources in vacuum. For point/spherical sources V(∞)=0. For infinite line and sheet V(∞) cannot be used: V=0 is set at the reference distance r₀. The sheet is nonconducting with equal field magnitude on each side. Sphere radius controls the shell/solid models only. Meshes are translucent mathematical equipotential surfaces, not material objects; their finite displayed extent does not make the line or sheet finite. With zero charge every point has the same potential and no unique nested surfaces exist.';
potentialLesson.question='Why can a charge move around an equipotential sphere, cylinder or plane without electrostatic work?';potentialLesson.answer='The potential difference is zero, so W=qΔV=0. Wherever E is nonzero, it is normal to the surface and has no tangential component.';
getLesson('projectile').params.find(p=>p.key==='angle').min=0;getLesson('projectile').params.find(p=>p.key==='angle').max=90;getLesson('projectile').params.push(P('height','Launch height',0,20,.5,0,'m'));
getLesson('projectile').assumptions='No air resistance; uniform selectable gravity; horizontal ground at y=0. Launch height allows horizontal projection. At zero height and zero launch angle, ground impact is immediate. Animation time is scaled to one flight.';
getLesson('collision').params.push(P('u2','Second body initial velocity',-6,6,.5,0,'m/s'));
getLesson('collision').equation='m₁u₁+m₂u₂=m₁v₁+m₂v₂; v₂−v₁=e(u₁−u₂)';getLesson('collision').assumptions='Isolated one-dimensional collision, body 1 initially to the left of body 2. They collide only if u₁>u₂. Travel is schematic; restitution controls kinetic energy loss.';
getLesson('self').params.push({...P('mode','RL switching',0,1,1,0),choices:['Switch on: current grows','Source removed: current decays']});getLesson('self').assumptions='Ideal inductor and resistor. Growth starts with zero current. Decay starts from I₀=V/R after the source is disconnected and a closed R–L discharge loop is formed. Animation covers five time constants.';getLesson('self').equation='Growth: I=(V/R)(1−e^(−tR/L)). Decay: I=(V/R)e^(−tR/L). εL=−L dI/dt.';
getLesson('loop').params.find(p=>p.key==='I').min=-10;getLesson('loop').params.find(p=>p.key==='x').min=-2;
// Every lesson exposes its supported standard cases without requiring students to guess sliders.
for(const l of LESSONS){let e=l.experiment;l.cases=[{name:'Default experiment',settings:{},note:l.assumptions},{name:e.labels[0],settings:{[e.key]:e.a},note:'Observe how '+l.params.find(p=>p.key===e.key).label.toLowerCase()+' changes the result.'},{name:e.labels[1],settings:{[e.key]:e.b},note:'Compare with the other setting while holding the remaining quantities fixed.'}];for(const p of l.params)if(p.choices&&p.key!=='shells'&&p.key!=='convention')p.choices.forEach((name,i)=>l.cases.push({name,settings:{[p.key]:p.min+i*p.step},note:'Use '+name.toLowerCase()+' and inspect the quantities, graph and assumptions.'}));}
function cases(id,rows){getLesson(id).cases.push(...rows.map(([name,settings,note])=>({name,settings,note})));}
cases('potential',[
 ['Point charge: concentric spheres',{source:0},'Complete spheres have equal V at all latitudes and longitudes. Rotate the camera to see depth.'],
 ['Line charge: coaxial cylinders',{source:1},'Move around or along a cylinder: radius and V stay constant. Reference V at a finite radius.'],
 ['Sheet: parallel planes',{source:2},'Planes on opposite sides at equal distance have the same V. E reverses across the sheet.'],
 ['Inside a charged shell',{source:3,r:.5,radius:1},'Every point inside the shell has the same V and zero E; the interior is an equipotential volume.'],
 ['Inside a uniformly charged sphere',{source:4,r:.5,radius:1},'V varies quadratically with r, while E grows linearly from the centre.'],
 ['Negative point charge',{source:0,q:-2},'The field points inward and V approaches zero from below.'],
 ['Zero source charge',{source:0,q:0},'All space is equipotential and E is zero; no preferred nested surfaces remain.']]);
cases('projectile',[
 ['Horizontal launch from height',{angle:0,height:10},'Horizontal velocity is initially nonzero; vertical motion starts from rest.'],
 ['Vertical launch',{angle:90,height:0},'Horizontal range is zero. The object rises and returns along the same line.'],
 ['Launch from an elevated platform',{angle:30,height:10},'Flight time includes the fall below the launch level; complementary angles no longer give equal range.'],
 ['Maximum ground-level range',{angle:45,height:0},'At fixed speed and equal launch/landing levels, the range is largest at 45°.']]);
cases('collision',[
 ['Equal masses: elastic exchange',{m1:2,m2:2,u:4,u2:0,e:1},'The velocities exchange.'],
 ['Head-on collision',{u:4,u2:-3,e:1},'Both bodies approach with opposite signs of initial velocity.'],
 ['Overtaking collision',{u:5,u2:2,e:.5},'The faster left body catches the right body.'],
 ['Perfectly inelastic: common velocity',{u:4,u2:-2,e:0},'After collision both bodies have the same velocity.'],
 ['No collision: separating velocities',{u:2,u2:4},'The right body is faster; the bodies do not approach. No collision formula is applied.']]);
cases('field',[
 ['Electric dipole',{q1:2,q2:-2},'Field lines run from the positive charge to the negative charge.'],
 ['Equal positive charges',{q1:2,q2:2,px:0,py:0},'The midpoint is a zero-field point even though the potential is not zero.'],
 ['Equal negative charges',{q1:-2,q2:-2},'Field directions reverse relative to two positive charges.'],
 ['Single isolated charge',{q1:2,q2:0},'The field is radial around the remaining nonzero charge.'],
 ['Unequal opposite charges',{q1:3,q2:-1},'The field has unequal source strengths; line samples are qualitative.']]);
cases('coulomb',[
 ['Like charges repel',{q1:2,q2:2},'Both forces point away from the other charge.'],
 ['Unlike charges attract',{q1:2,q2:-2},'Both forces point toward the other charge.'],
 ['One uncharged body',{q1:2,q2:0},'In this point-charge model the force is zero; induced polarisation is outside its scope.']]);
cases('refraction',[
 ['Normal incidence',{angle:0,n1:1,n2:1.5},'The ray is not bent.'],
 ['Rarer to denser',{angle:45,n1:1,n2:1.5},'The transmitted ray bends toward the normal.'],
 ['Denser to rarer',{angle:30,n1:1.5,n2:1},'The transmitted ray bends away from the normal.'],
 ['Total internal reflection',{angle:60,n1:1.5,n2:1},'Above the critical angle there is no transmitted ray.'],
 ['Matched refractive indices',{angle:45,n1:1.5,n2:1.5},'There is no change of ray direction.']]);
for(const id of ['lens','mirror']){let f=id==='lens'?3:-3;cases(id,[['Object beyond 2F',{f,u:9},'Observe the real image location, inversion and reduced size.'],['Object at 2F',{f,u:6},'The image has the same size.'],['Object between F and 2F',{f,u:4},'The real image is enlarged.'],['Object at F',{f,u:3},'Outgoing rays are parallel; the image is at infinity.'],['Object inside F',{f,u:2},'Dashed extensions locate the virtual image.'],[id==='lens'?'Diverging lens':'Convex mirror',{f:-f,u:6},'A real object produces a reduced virtual image.']]);}
cases('incline',[['Frictionless slope',{mu:0},'The only downslope force is the component of weight.'],['Static friction sufficient',{angle:15,mu:.6},'Static friction balances the downslope component.'],['Sliding threshold exceeded',{angle:45,mu:.2},'The model uses the specified coefficient for sliding friction.']]);
cases('vectors',[['Parallel addition',{angle:0},'Magnitudes add.'],['Perpendicular addition',{angle:90},'Use the Pythagorean resultant.'],['Opposite equal vectors',{a:3,b:3,angle:180},'The resultant is zero.']]);
cases('torque',[['Zero moment arm',{angle:0},'Force acts along the lever; torque is zero.'],['Maximum torque',{angle:90},'The force is perpendicular to the lever.']]);
cases('atwood',[['Equal masses',{m1:4,m2:4},'Acceleration is zero.'],['Left heavier',{m1:6,m2:2},'The left mass descends.'],['Right heavier',{m1:2,m2:6},'The right mass descends.']]);
cases('buoyancy',[['Floating',{rho:600,fluid:1000},'Only part of the body is submerged.'],['Neutral buoyancy',{rho:1000,fluid:1000},'Weight equals buoyancy when submerged.'],['Sinking',{rho:1400,fluid:1000},'The full-volume buoyant force is smaller than weight.']]);
cases('capillary',[['Wetting: rise',{angle:30},'The upward surface-tension component raises the liquid.'],['No rise',{angle:90},'The vertical component is zero.'],['Nonwetting: depression',{angle:120},'The level is depressed.']]);
cases('superposition',[['Constructive',{phase:0,a:1},'Equal in-phase waves add.'],['Destructive',{phase:180,a:1},'Equal opposite-phase waves cancel.'],['Unequal amplitudes',{phase:180,a:.5},'Cancellation is incomplete.']]);
cases('magnetic',[['Parallel velocity',{angle:0},'Magnetic force is zero and the path is straight.'],['Perpendicular velocity',{angle:90},'The path is circular.'],['Oblique velocity',{angle:45},'Parallel motion plus circular motion forms a helix.'],['Negative charge',{sign:-1,angle:45},'The direction of bending reverses.']]);
cases('flux',[['Maximum positive flux',{angle:0},'The field is parallel to the chosen normal.'],['Zero flux',{angle:90},'The field lies in the surface plane.'],['Negative flux',{angle:180},'The field opposes the chosen normal.']]);
cases('loop',[['At the centre',{x:0},'Axial field magnitude is maximum.'],['Current reversed',{I:-5},'The magnetic field reverses direction.'],['Current switched off',{I:0},'No magnetic field remains in this ideal air-core loop.'],['Opposite axial side',{x:-1},'Axial field magnitude is symmetric in x.']]);
cases('faraday',[['Steady field and orientation',{f:0},'Flux may be nonzero but emf is zero.'],['Field parallel to loop plane',{theta:90,mode:0},'Changing field produces no linked flux for this fixed orientation.'],['Rotating loop',{mode:1,theta:0},'Emf follows the rate of change of the orientation-dependent flux.'],['Changing loop area',{mode:2},'Area changes produce induction even when field and normal are fixed.']]);
cases('mutual',[['Steady primary current',{f:0},'Linked flux is steady and no secondary emf is induced.'],['Open secondary circuit',{closed:0},'Induced emf exists but secondary current is zero.'],['Large separation',{d:2.4},'Reduced coupling lowers mutual inductance.'],['Nearly perpendicular coils',{theta:85},'Tilting reduces the linked flux.']]);
cases('wheatstone',[['Balanced bridge',{P:5,Q:5,R:5,S:5},'The midpoint potentials are equal.'],['Unbalanced bridge',{P:5,Q:10,R:5,S:5},'The midpoint potential difference is nonzero.']]);
cases('photoelectric',[['Below threshold',{f:3,phi:3,intensity:1},'More intensity cannot overcome insufficient photon energy.'],['Above threshold',{f:10,phi:2,intensity:1},'Electrons are emitted with positive maximum kinetic energy.'],['No illumination',{intensity:0},'There are no incident photons or emitted electrons.']]);
cases('junction',[['Unbiased junction',{bias:0},'Built-in depletion field remains at equilibrium.'],['Forward bias',{bias:.5},'The depletion region narrows.'],['Reverse bias',{bias:-.5},'The depletion region widens.']]);

for(const p of getLesson('potential').params){const options={q:[0,3,4],lambda:[1],sigma:[2],radius:[3,4],reference:[1,2]};if(options[p.key])p.visibleFor=options[p.key];}
getLesson('gravity').params.push({...P('structure','Mass distribution',0,1,1,0),choices:['Uniform solid sphere','Thin spherical shell']});getLesson('gravity').params.find(p=>p.key==='r').min=0;getLesson('gravity').assumptions='Spherical symmetry with fixed Earth mass and radius. A uniform solid sphere has g proportional to r inside; a thin spherical shell has zero field inside and constant potential. At the shell surface the field readout uses the exterior limiting value. These are ideal distributions, not a model of Earth’s actual interior.';
cases('gravity',[['Uniform solid interior',{structure:0,r:.5},'Field grows linearly from the centre.'],['Hollow shell interior',{structure:1,r:.5},'The net gravitational field is zero, but the potential is negative.'],['At the centre',{structure:0,r:0},'Field is zero by symmetry.'],['Outside the sphere',{r:2},'Both distributions act as a point mass at the centre.']]);
let th=getLesson('thermo'),tm=th.params.find(p=>p.key==='mode');tm.max=3;tm.choices=['Isothermal','Adiabatic','Isobaric','Isochoric'];th.params.push(P('temperatureRatio','Isochoric temperature ratio',.5,3,.1,1.5));th.explain='Compare four ideal-gas processes: constant temperature, no heat transfer, constant pressure and constant volume. The first law uses heat into the gas and work done by the gas: Q=ΔU+W.';th.assumptions='One mole of ideal gas starts at 300 K and 0.020 m³. Constant heat capacities use the chosen γ. Volume ratio applies to the first three modes; only temperature ratio applies to the isochoric mode. The work is the signed area under the process path.';
cases('thermo',[['Isothermal expansion',{mode:0,ratio:2},'Temperature and internal energy remain constant.'],['Adiabatic expansion',{mode:1,ratio:2},'The gas cools while doing work with no heat input.'],['Isobaric expansion',{mode:2,ratio:2},'Pressure stays constant while volume and temperature increase.'],['Isochoric heating',{mode:3,temperatureRatio:2},'Volume is fixed, so W=0 and Q=ΔU.'],['Adiabatic compression',{mode:1,ratio:.5},'Work done on the gas increases temperature.']]);
getLesson('interference').params.push(P('ratio','Slit intensity ratio I₂/I₁',0,4,.1,1),P('phase','Initial phase difference',0,360,5,0,'°'),{...P('coherent','Coherence',0,1,1,1),choices:['Incoherent: time average','Coherent sources']});getLesson('interference').equation='I=I₁+I₂+2√(I₁I₂)cosδ; δ=2πdy/(λD)+φ; β=λD/d';getLesson('interference').assumptions='Far-field interference of two narrow slits without a diffraction envelope. Intensity is divided by (√I₁+√I₂)². I₁ is the unit reference; ratio zero blocks slit 2. Incoherent mode averages out the cross term. Apparatus distances and wavefronts are schematic.';
cases('interference',[['Equal coherent slits',{ratio:1,phase:0,coherent:1},'Dark fringes reach zero intensity.'],['Unequal coherent slits',{ratio:.25,coherent:1},'Dark fringes no longer reach zero.'],['Phase reversal',{ratio:1,phase:180,coherent:1},'The central bright fringe becomes dark.'],['One slit blocked',{ratio:0},'There is no two-source interference modulation in this ideal narrow-slit model.'],['Incoherent sources',{coherent:0},'Time-averaged intensities add without stable fringes.']]);
getLesson('potential').params.push({...P('axial','Axial / in-plane offset',-2,2,.1,.5,'m'),visibleFor:[1,2]},{...P('transverse','Second in-plane offset',-2,2,.1,.5,'m'),visibleFor:[2]},{...P('side','Side of the sheet',-1,1,2,1),choices:['Negative x side','Positive x side'],visibleFor:[2]});
getLesson('potential').params.find(p=>p.key==='elevation').label='Probe latitude';getLesson('potential').params.find(p=>p.key==='elevation').visibleFor=[0,3,4];getLesson('potential').params.find(p=>p.key==='azimuth').visibleFor=[0,1,3,4];
getLesson('thermo').equation='Q=ΔU+W; ΔU=nCᵥΔT; W=∫P dV. Isochoric: W=0. Adiabatic: Q=0.';
getLesson('gravity').explain='Spherical symmetry makes the exterior field depend only on total mass. Inside a uniform solid sphere the field is proportional to radius. Inside a thin shell the net field vanishes everywhere, while the gravitational potential is a constant negative value.';

getLesson('capnetwork').params.push(P('voltage','Supply voltage',0,12,.5,12,'V'));
getLesson('capnetwork').assumptions+=' Voltage sweeps compare electrostatic equilibrium states; they do not simulate a charging transient or imply a charging time constant.';
for(const id of ['interference','diffraction'])getLesson(id).params.push(P('screenRange','Screen half-range',2,30,1,10,'mm'));
getLesson('interference').params.push(P('slitWidth','Width of each slit',.015,.08,.005,.04,'mm'));
getLesson('interference').assumptions='Fraunhofer approximation. Two identical finite-width slits produce interference inside a single-slit sinc² envelope. Slit separation and slit width use the same magnified transverse scale; longitudinal distance has its own scale. The screen ruler stays fixed unless Screen half-range is changed. Wave motion is greatly slowed; wavefronts illustrate emission and propagation, while screen intensity is calculated from optical path phase. Incoherent mode removes the interference term but retains the diffraction envelope.';
getLesson('diffraction').assumptions='Fraunhofer single-slit diffraction, I/I₀ = sinc²(πay/λD). The screen ruler is fixed unless Screen half-range is changed. Apparatus and screen use separate labelled magnifications; travelling wavefronts are a slowed illustration.';
getLesson('interference').equation='I ∝ sinc²(πay/λD)[I₁+I₂+2√(I₁I₂)cos(2πdy/λD+φ)]; β=λD/d. Incoherent average: omit the cosine term.';
getLesson('interference').cases.find(c=>c.name==='One slit blocked').note='Only single-slit diffraction remains; there is no two-source interference term.';
