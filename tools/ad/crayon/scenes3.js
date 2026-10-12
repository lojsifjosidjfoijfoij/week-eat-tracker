// ───────────── "The Dinner Hotline" — full-screen family story ─────────────
const mixc=(a,b,k)=>{const p=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)],A=p(a),B=p(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,'0')).join('')};
const TL={B:4.2,C:9.0,D:12.6,E:19.2,F:23.4,DUR:27.6};
const FULL=[[-30,-30],[W+30,-30],[W+30,H+30],[-30,H+30]];
const FY=860; // floor line for characters
// asked-today counter
const COUNTS=[[.35,1],[1.9,2],[3.3,3],[4.5,4],[5.1,5],[5.7,6],[6.3,7],[6.8,8],[7.3,9],[7.8,10],[8.3,11]];
function countAt(t){if(t>=19.9)return[0,19.9];let n=0,tc=-9;COUNTS.forEach(([a,v])=>{if(t>=a){n=v;tc=a}});if(t>=8.4&&t<9.0){n=Math.round(lerp(11,47,eio(span(t,8.4,8.95))));tc=8.4}else if(t>=9.0&&t<19.9){n=47;tc=8.95}return[n,tc]}
function badge(t){const[n,tc]=countAt(t);const pp=1+.3*Math.max(0,1-(t-tc)*5);
 push();tr(270,96);sc(pp);tr(-270,-96);shape([[140,34],[400,30],[404,128],[138,132]],t>=19.9?C.green:C.yellow,{lw:3.4,gap:6,fw:11,ang:-.05});
 txt('TIMES ASKED TODAY',270,62,21,NAVY,'Pat',{align:'center'});txt(String(n),270,114,66,n>20?C.red:NAVY,'Brush',{align:'center'});pop()}

function kitchen(t){
 shape(FULL,'#FCEBC8',{noline:1,gap:8,fw:12,flat:1,ang:-.4});
 // window
 shape(rrect(50,140,180,170,8),null,{solid:'#CDE8F7',lw:4});line([[140,140],[140,310]],{lw:4,single:1});line([[50,225],[230,225]],{lw:4,single:1});
 // clock 5:00
 push();tr(400,205);shape(blob(0,0,40,40,16,.02),null,{solid:CREAM,lw:4});line([[0,0],[0,-26]],{lw:3.6,single:1});line([[0,0],[-14,10]],{lw:3.6,single:1});txt('5:00',0,64,24,C.dgray,'Pat',{align:'center'});pop();
 // cabinets + counter
 shape(rrect(-30,560,W+60,180,0),C.lblue,{lw:4,gap:6,fw:10,ang:.3});
 [20,190,360].forEach(x=>{line([[x,590],[x,740]],{lw:2.4,single:1,col:'#7FA7C4'});shape(rrect(x+60,640,60,10,5),null,{solid:CREAM,lw:2.4})});
 shape(rrect(-30,540,W+60,34,6),C.gray,{lw:4,gap:5,fw:9});
 // stove + pot
 push();tr(400,540);shape(rrect(-62,-12,124,14,5),C.dgray,{lw:3,flat:1,gap:4,fw:8});shape(rrect(-46,-70,92,60,8),C.dgray,{lw:3.6,gap:5,fw:9});
 for(let i=0;i<3;i++){const k=((t*.8)+i*.33)%1;GA=1-k;push();tr(-20+i*20,-80-k*60);sc(.8+k*.8);shape(blob(0,0,10,8,8,.1),null,{solid:CREAM,lw:2.2});pop();GA=1}pop();
 // floor
 shape([[-30,730],[W+30,730],[W+30,H+30],[-30,H+30]],'#CC9158',{lw:4,gap:7,fw:11,ang:.1});
 for(let i=0;i<4;i++)line([[-10,790+i*60],[W+10,786+i*60]],{lw:2.2,col:'#9A6230',single:1});
}
function dog(x,y,s,o={}){push();tr(x,y);sc((o.flip?-1:1)*s,s);const t=o.t||0,tail=Math.sin(t*(o.wag||6))*.5;
 shape(blob(0,-34,34,30,12,.04),'#D9A066',{lw:3.4,gap:5,fw:8});
 line([[28,-30],[48+Math.sin(t*(o.wag||6))*6,-52-Math.cos(t*6)*4]],{lw:7,col:'#D9A066',single:1});
 shape(blob(-26,-70,24,22,12,.03),'#D9A066',{lw:3.4,gap:5,fw:8});
 shape([[-44,-86],[-52,-60],[-40,-52],[-34,-76]],C.dbrown,{lw:2.8,gap:4,fw:6});shape([[-16,-86],[-6,-60],[-18,-52],[-24,-78]],C.dbrown,{lw:2.8,gap:4,fw:6});
 dot(-34,-72,2.8);dot(-18,-72,2.8);shape(blob(-42,-62,6,5,8,0),NAVY,{lw:2,flat:1,gap:3,fw:5});
 if(o.bark){shape(blob(-40,-52,7,6+Math.abs(Math.sin(t*20))*3,8,0),C.red,{lw:2.2,flat:1,gap:3,fw:5})}else line([[-46,-54],[-36,-52],[-28,-56]],{lw:2.2,single:1});
 limb([-14,-12],[-14,0],8,'#D9A066');limb([12,-12],[12,0],8,'#D9A066');
 pop()}
function signBoard(x,y,s,t0,t){const k=back((t-t0)/.35);if(k<=0)return;push();tr(x,y);sc(s*k);rot(Math.sin(t*5)*.03);
 shape(rrect(-150,-60,300,120,12),null,{solid:CREAM,lw:5});shape(rrect(-140,-50,280,100,8),null,{lw:3,col:C.red});
 txt('MOM IS',0,-8,38,C.red,'Brush',{align:'center'});txt('OUT OF OFFICE',0,38,44,C.red,'Brush',{align:'center'});pop()}
function speaker(x,y,t,on){push();tr(x,y);shape(rrect(-28,-76,56,76,22),C.dgray,{lw:3.6,gap:5,fw:9});shape(blob(0,-62,20,6,10,0),on?C.blue:C.lblue,{lw:2.6,gap:3,fw:6});if(on){GA=.5;shape(blob(0,-62,34+Math.sin(t*20)*3,12,12,0),null,{lw:3,col:C.blue,single:1});GA=1}pop()}
function phoneSmall(x,y,t,buzz){push();tr(x+(buzz?Math.sin(t*70)*3:0),y);rot(buzz?Math.sin(t*60)*.06:0);shape(rrect(-30,-60,60,60,8),C.dgray,{lw:3.2,gap:4,fw:8});shape(rrect(-24,-54,48,46,4),null,{solid:'#EBF2E2',lw:2});txt('Grandma',0,-26,13,C.dgreen,'Pat',{align:'center',jit:.3});pop()}
function mailman(t,show){if(!show)return;const k=back(span(t,6.1,6.45));push();tr(140,310+(1-k)*160);shape(blob(0,-34,34,34,14,.03),C.peach,{lw:3.4,gap:5,fw:8});shape([[-38,-48],[-34,-74],[0,-82],[34,-74],[38,-48],[58,-44],[36,-56]],C.blue,{lw:3,gap:4,fw:7});dot(-12,-34,3);dot(12,-34,3);line([[-8,-18],[0,-14],[8,-18]],{lw:2.4,single:1});shape(rrect(30,-16,36,26,3),null,{solid:CREAM,lw:2.6});pop()}

function bub(t,t0,t1,lines,x,y,tail,o={}){if(t<t0||t>t1)return;const ex=span(t,t1-.14,t1);if(ex>0){GA=1-ex;push();tr(x,y);sc(1-ex*.3);tr(-x,-y);bubble(lines,x,y,t-t0,tail,o);pop();GA=1}else bubble(lines,x,y,t-t0,tail,o)}
const MSG=[ // [t0,t1,lines,x,y,tail,opts]
 [.3,1.9,["What's for","dinner?"],425,440,[430,670],{size:28}],
 [1.0,2.3,["Pasta!"],200,500,[250,650],{size:32,col:C.dgreen}],
 [1.9,3.5,["What's for","dinner?"],110,470,[110,790],{size:28}],
 [2.7,3.7,["…pasta."],290,500,[262,650],{size:30,col:C.dgray}],
 [3.3,4.7,["What's for","dinner?"],190,610,[190,810],{size:28}],
 [4.5,8.95,["Grandma:","What's for","dinner?"],95,430,[85,560],{size:24}],
 [5.1,8.95,["Woof?","(what's for dinner)"],390,700,[375,830],{size:22,col:C.dgray}],
 [5.7,8.95,["Hey! What's","for dinner?"],440,340,[450,430],{size:24,col:C.blue}],
 [6.3,8.95,["Wrong house,","but what's for","dinner?"],320,300,[210,280],{size:22}],
 [6.8,8.95,["WHAT'S FOR","DINNER?!"],440,560,[430,670],{size:30,col:C.red}],
 [7.3,8.95,["DINNER?","DINNER??"],120,590,[110,790],{size:30,col:C.red}],
 [11.0,12.3,["*grrrrr*"],190,640,[190,830],{size:26,col:C.dgray}],
 [11.5,12.5,["…so, what's","for dinner?"],430,470,[430,700],{size:24,col:C.dgray}]];
const MSG_E=[
 [19.95,21.3,["Tacos!"],110,560,[115,730],{size:34,col:C.dgreen,fill:'#EBF2E2'}],
 [20.2,21.4,["Tacos!"],240,500,[200,640],{size:34,col:C.dgreen,fill:'#EBF2E2'}],
 [20.45,21.5,["Tacos!"],430,520,[430,700],{size:34,col:C.dgreen,fill:'#EBF2E2'}],
 [21.7,22.6,["What's for","dinner?"],430,440,[430,670],{size:28}],
 [22.2,23.4,["CHECK","DINRR!"],270,360,[270,640],{size:44,col:C.red}]];

function kitchenScenes(t){
 kitchen(t);
 const inA=t<TL.B;
 // --- state of mom ---
 let mood='smile',eye=undefined,twitch=0,steam=0,frizz=0,brows,armR,armL;
 if(t>1.9)mood='flat';if(t>2.7){mood='wavy';twitch=1}if(t>3.6){mood='grit';twitch=1.6;steam=.25}
 if(t>=TL.B){mood='grit';twitch=2;steam=clamp(.25+(t-TL.B)/4.8*.75,0,1);frizz=clamp((t-5)/3.5,0,1);brows='angry'}
 if(t>=8.3){eye='spiral';mood='wavy'}
 if(t>=TL.C){eye='tired';mood='flat';twitch=0;steam=Math.max(0,1-(t-TL.C)*3);frizz=Math.max(0,.6-(t-TL.C)*.4);brows=undefined}
 const shake=(t>=8.3&&t<TL.C)?Math.sin(t*70)*3:0;
 let mx=270+shake,walk=0,mflip=0;
 if(t>=10.7&&t<12.4){walk=11;mflip=1;mx=lerp(270,-140,ein(span(t,10.7,12.4)))}
 // arms
 if(t<TL.B)armR=[34+Math.cos(t*7)*9,-62+Math.sin(t*7)*9];
 if(t>=9.6&&t<10.7)armR=[30,-98],armL=[-30,-98];
 // --- E: relaxed ---
 const inE=t>=TL.D+6.6;
 if(!inE&&t<TL.D+.1||t<TL.D){
  if(t<TL.E-0.001){
   if(t<12.5&&mx>-120)person(mx,FY,1.7,{t,cloth:C.pink,hair:C.dbrown,bun:1,eye,twitch,steam,frizz,brows,mouth:mood,walk,flip:mflip,armR,armL,mug:t>=10.7&&t<12.4,head:1.0});
  }
 }
 // family
 const dadMouth=(t>.3&&t<1.6)||(t>6.8&&t<8.9)?'talk':'smile';
 const stare=t>=TL.C;
 person(430,FY,1.45,{t,flip:1,cloth:C.blue,stripes:1,stache:1,hair:C.dbrown,mouth:t>=11.5&&t<12.5?'sad':dadMouth,look:stare?-3:-2,ph:1});
 if(t>=1.9)person(lerp(-40,110,eout(span(t,1.55,2.1))),FY+20,1.2,{t,kid:1,hat:'cap',hatc:C.green,cloth:C.orange,head:1.15,cheeks:1,mouth:t>=7.3&&t<8.9?'talk':'smile',ph:2,look:2});
 if(t>=3.3)person(lerp(600,190,eout(span(t,2.9,3.4))),FY+40,.9,{t,kid:1,cloth:C.yellow,hair:C.brown,head:1.2,cheeks:1,mouth:t>=11?'sad':'smile',ph:3,look:2});
 dog(370,FY+30,1.0,{t,bark:t>=5.1&&t<8.9&&Math.sin(t*10)>0,wag:t<TL.B?6:12});
 // props reacting
 phoneSmall(80,560,t,t>=4.5&&t<8.95);
 speaker(455,540,t,t>=5.7&&t<8.95);
 mailman(t,t>=6.1&&t<9.0);
 // sign + shards
 if(t>=9.6&&t<11.6)signBoard(270,470,1,9.6,t);
 if(t>=TL.C&&t<TL.C+1.1){for(let i=0;i<26;i++){const r=mk(i*77+3),px=40+r()*460,py=300+r()*260,k=(t-TL.C),fall=k*k*600;GA=clamp(1.2-k);push();tr(px+(r()-.5)*k*80,py+fall);rot(r()*6+k*5);shape([[0,-10],[9,8],[-8,6]],null,{solid:CREAM,lw:2});pop();GA=1}}
 // bubbles
 MSG.forEach(m=>bub(t,m[0],m[1],m[2],m[3],m[4],m[5],m[6]));
 if(t>=TL.C&&t<9.6)txt('…',270,520,90,C.dgray,'Brush',{align:'center',n:(t-TL.C)*10});
 badge(t)}

function momCalm(t){ // E: kitchen resolution, everybody checks their phone
 kitchen(t);
 const lt=t-TL.E;
 person(270,FY,1.7,{t,cloth:C.pink,hair:C.dbrown,bun:1,mouth:'smile',eye:'tired',armR:[34,-70],mug:1,cheeks:1,look:0});
 // halo + sparkles
 push();tr(270,FY-1.7*160);line([[-26,0],[-8,-8],[8,-8],[26,0]],{lw:4,col:C.yellow,single:1});pop();
 if(lt>.7)for(let i=0;i<5;i++)sparkle(180+i*45+Math.sin(t*3+i)*6,FY-1.7*176-(i%2)*18+Math.sin(t*4+i)*4,.5+.2*(i%2),t*2+i);
 person(430,FY,1.45,{t,flip:1,cloth:C.blue,stripes:1,stache:1,hair:C.dbrown,mouth:lt>2.3?'open':'smile',armR:[-10,-96],phone:1,look:-2});
 person(110,FY+20,1.2,{t,kid:1,hat:'cap',hatc:C.green,cloth:C.orange,head:1.15,cheeks:1,mouth:'open',armR:[26,-92],phone:1,look:2});
 person(190,FY+40,.9,{t,kid:1,cloth:C.yellow,hair:C.brown,head:1.2,cheeks:1,mouth:'smile',armR:[22,-76],phone:1,look:2});
 dog(370,FY+30,1.0,{t,wag:14});
 MSG_E.forEach(m=>bub(t,m[0],m[1],m[2],m[3],m[4],m[5],m[6]));
 badge(t)}

function appScene(t){
 shape(FULL,null,{solid:'#FBE6CE',noline:1});
 shape(blob(270,490,320,330,18,.05),'#F6CFA0',{noline:1,gap:7,fw:11,flat:1,ang:-.3});
 [[56,190],[484,230],[50,810],[490,790],[40,520]].forEach(([x,y],i)=>sparkle(x,y+Math.sin(t*3+i)*5,.9,t*1.5+i));
 const slide=1-back(span(t,13.05,13.7)),out=ein(span(t,18.7,19.2)),oy=(slide+out)*900;
 push();tr(0,oy);shape(rrect(95-14,102-14,350+28,757+28,42),C.dgray,{lw:4,gap:5,fw:9,col2:C.gray});shape(rrect(95,102,350,757,28),null,{solid:'#FDFCFA',lw:2});pop();
 const sets=[[12.7,14.9,'So Mom made a plan.'],[14.9,17.1,'Everyone sees it live.'],[17.1,19.2,'Nobody has to ask.']];
 sets.forEach(([a,b,s])=>{if(t>=a&&t<b){const k=back((t-a)/.3);push();tr(270,64);sc(k);tr(-270,-64);shape([[60,22],[480,18],[486,80],[56,84]],C.yellow,{lw:3.2,gap:6,fw:11,ang:-.05});txt(s,270,68,44,NAVY,'Brush',{align:'center'});pop()}})}

function wipe(t,tc,col=C.orange){const p=span(t,tc-.3,tc),q=span(t,tc,tc+.3);if(p<=0||q>=1)return;const a=q*(W+120)-60,b=p*(W+120)-60;shape([[a-20,-30],[b+10,-30],[b-10,H+30],[a-30,H+30]],col,{noline:1,gap:9,lw:16,ang:.6,flat:1})}

function endCard(t){const lt=t-TL.F;
 shape(FULL,null,{solid:'#F2EAD8',noline:1});shape(blob(270,430,300,300,18,.05),'#F6CFA0',{noline:1,gap:7,fw:11,flat:1,ang:-.3});
 person(270,FY+20,1.9,{t,cloth:C.pink,hair:C.dbrown,bun:1,mouth:'smile',eye:'tired',armR:[34,-70],mug:1,cheeks:1});
 const e=back(span(lt,.1,.6));push();tr(270,210);sc(e);tr(-270,-210);txt('dinrr',270,236,190,C.dgreen,'Brush',{align:'center',stroke:NAVY,sw:12,jit:.6});line([[130,262],[200,270],[270,260],[350,271],[410,262]],{lw:8,col:C.orange,single:1,wob:1.6});pop();
 txt("Stop being the",270,345,46,NAVY,'Brush',{align:'center',n:(lt-.6)*30});txt('dinner hotline.',270,398,50,C.red,'Brush',{align:'center',n:(lt-1.2)*30});
 if(lt>2.0){const q=back(span(lt,2.0,2.4));push();tr(270,462);sc(q);tr(-270,-462);shape(rrect(150,434,240,58,29),C.yellow,{lw:3.4,gap:4.5,fw:8});txt('@dinrr.app',270,474,34,NAVY,'Brush',{align:'center'});pop()}}

// ── sound events ──
const SFX=[];const ev=(t,type,x={})=>SFX.push({t:Math.round(t*1000)/1000,type,...x});
COUNTS.forEach(([a,v],i)=>ev(a,'bonk',{i}));
ev(.3,'slide',{dir:'up'});ev(1.0,'boing');ev(1.55,'step',{n:3});ev(1.9,'slide',{dir:'up'});ev(2.7,'squeak');ev(2.9,'step',{n:3});ev(3.3,'slide',{dir:'up'});ev(3.6,'squeak');
ev(4.5,'buzz');ev(5.1,'woof');ev(5.5,'woof');ev(5.7,'chime');ev(6.1,'doorbell');ev(6.8,'honk');ev(7.3,'honk');ev(5.9,'woof');ev(7.0,'woof');
ev(4.3,'drumroll',{d:4.5});ev(8.0,'kettle',{d:1.0});ev(8.4,'boing');ev(8.4,'bonk',{i:11});ev(8.45,'rollup',{d:.5});
ev(9.0,'crash');ev(9.0,'shatter');ev(9.15,'deflate');ev(9.6,'slide',{dir:'up'});ev(9.7,'bonk',{i:2});
for(let k=0;k<8;k++)ev(10.7+k*.2,'step');ev(11.0,'growl');ev(11.5,'squeak');ev(12.05,'wah');
ev(12.3,'whoosh',{dir:'out'});ev(13.0,'whoosh',{dir:'in'});
for(let i=0;i<7;i++)ev(13.8+i*.34,'tink',{i});
ev(16.4,'tap');ev(16.7,'tick',{i:0});ev(17.2,'tick',{i:3});ev(17.6,'tick',{i:6});ev(18.05,'check');ev(18.4,'check');
ev(18.7,'whoosh',{dir:'out'});
ev(19.2,'whoosh',{dir:'in'});ev(19.9,'poof');ev(19.95,'xylo',{i:0});ev(20.2,'xylo',{i:1});ev(20.45,'xylo',{i:2});ev(20.5,'tada');ev(21.7,'honk');ev(22.2,'bonk',{i:1});ev(22.25,'slide',{dir:'up'});ev(22.8,'sip');
ev(23.1,'whoosh',{dir:'out'});ev(23.8,'logo');ev(24.4,'sparkles');
window.SFX=SFX.sort((a,b)=>a.t-b.t);window.DUR=TL.DUR;window.TL=TL;

window.render=(t,tap)=>{
 SEED=Math.floor(t*8);K=0;GA=1;M=[1,0,0,1,0,0];stack=[];
 ctx.setTransform(2,0,0,2,0,0);ctx.globalAlpha=1;ctx.fillStyle=PAPER;ctx.fillRect(0,0,W,H);
 const app=document.getElementById('pw'),tp=document.getElementById('tap');let appOn=false;
 if(t<TL.D-.25)kitchenScenes(t);else if(t<TL.E-.25){appScene(t);appOn=t>13.0&&t<19.25}else if(t<TL.F-.25)momCalm(t);else endCard(t);
 wipe(t,TL.D-.1);wipe(t,TL.E-.1,C.green);wipe(t,TL.F-.1,C.orange);
 const g=ctx.createRadialGradient(W/2,H*.45,260,W/2,H/2,760);g.addColorStop(0,'rgba(255,250,235,0)');g.addColorStop(1,'rgba(150,120,80,.2)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=.55;ctx.drawImage(grain,0,0);ctx.globalAlpha=1;
 app.style.visibility=appOn?'visible':'hidden';
 const slide=1-back(span(t,13.05,13.7)),out=ein(span(t,18.7,19.2));app.style.transform=`translateY(${(slide+out)*900}px)`;
 if(tap&&t>=tap.t-.05&&t<tap.t+.35){const k=(t-tap.t)/.35;tp.style.opacity=k<0?0:1-k;tp.style.left=tap.x+'px';tp.style.top=tap.y+'px';tp.style.transform=`scale(${.6+k*.8})`}else tp.style.opacity=0;
};
</script>
