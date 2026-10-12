// ───────────── #4 "Two Shoppers, One Supermarket" — split-screen family sketch ─────────────
const TL={B:10.0,C:13.0,D:19.2,E:23.2,DUR:26.0};
const FULL=[[-30,-30],[W+30,-30],[W+30,H+30],[-30,H+30]];
const FY=900,S=1.6;           // floor line + character scale
const MOMX=120,DADX=350,CARTX=468;

// ── products (local origin = bottom centre) ──
function milk(x,y,s=1){push();tr(x,y);sc(s);shape([[-13,0],[-13,-36],[-8,-46],[8,-46],[13,-36],[13,0]],CREAM,{lw:2.8,gap:4,fw:5,solid:CREAM,flat:1});
 shape(rrect(-13,-26,26,12,2),C.blue,{lw:2,gap:3.5,fw:5,flat:1});line([[-8,-46],[0,-52],[8,-46]],{lw:2.4,single:1});pop()}
function pasta(x,y,s=1){push();tr(x,y);sc(s);shape(rrect(-12,-40,24,40,5),C.yellow,{lw:2.8,gap:4,fw:5});shape(rrect(-6,-30,12,16,4),C.ivory,{lw:2,flat:1,gap:3,fw:4});pop()}
function eggs(x,y,s=1){push();tr(x,y);sc(s);[-12,0,12].forEach(q=>shape(blob(q,-16,6,8,10,0),C.ivory,{lw:2.2,gap:3,fw:4,flat:1}));shape(rrect(-20,-12,40,12,3),C.gray,{lw:2.6,gap:4,fw:5});pop()}
function banana(x,y,s=1){push();tr(x,y);sc(s);[-1,0,1].forEach(q=>{push();tr(q*7,0);rot(q*.25);shape(tube(bez([-14,-30],[-14,-6],[8,-2],[16,-14],8),5,9,10),C.yellow,{lw:2.4,gap:3.5,fw:5,step:8});pop()});pop()}
function cheese(x,y,s=1){push();tr(x,y);sc(s);shape([[-18,0],[18,0],[18,-14],[-18,-26]],C.yellow,{lw:2.8,gap:4,fw:5});dot(-6,-12,2.4,C.orange);dot(8,-7,2,C.orange);pop()}
const PROD={milk,pasta,eggs,banana,cheese};
const KINDS=['milk','pasta','eggs','banana','cheese'];
const GRAB={milk:3.3,pasta:6.0,eggs:6.9,banana:7.8,cheese:8.7};

// ── store pieces ──
function wall(x0,x1,col){shape([[x0,-30],[x1,-30],[x1,FY-80],[x0,FY-80]],col,{noline:1,gap:8,fw:12,flat:1,ang:-.4})}
function floor(){shape([[-30,FY-90],[W+30,FY-94],[W+30,H+30],[-30,H+30]],'#CFD9C2',{lw:4,gap:7,fw:11,ang:.1});for(let i=0;i<3;i++)line([[-10,FY-40+i*45],[W+10,FY-44+i*45]],{lw:2,col:'#9DB08F',single:1})}
function shelfPos(hx,k){return{milk:[hx-56,450],pasta:[hx+52,450],eggs:[hx-56,580],banana:[hx+52,580],cheese:[hx,705]}[k]}
function shelves(hx,label){
 push();tr(hx,300);rot(-.02);line([[-40,-26],[-40,0]],{lw:2.5,single:1});line([[40,-26],[40,0]],{lw:2.5,single:1});shape(rrect(-62,0,124,40,6),C.yellow,{lw:3,gap:5,fw:9});txt(label,0,30,28,NAVY,'Brush',{align:'center'});pop();
 shape(rrect(hx-112,350,224,400,8),'#E9D2B0',{lw:4,gap:6,fw:10,ang:.3});
 [460,590,720].forEach(y=>shape(rrect(hx-112,y,224,12,3),C.brown,{lw:3,gap:4,fw:7}));
 for(let i=0;i<3;i++){milk(hx-86+i*22,460,.62);pasta(hx+26+i*22,460,.62);eggs(hx-74+i*28,590,.62);banana(hx+30+i*24,590,.6);cheese(hx-60+i*40,720,.62)}}
function splitLine(){line([[270,-20],[268,320],[272,640],[270,H+20]],{lw:6,step:20})}
function phoneAt(x,y,o={}){push();tr(x+(o.buzz?Math.sin(o.t*70)*2:0),y);rot(o.rot||0);shape(rrect(-9,-30,18,32,4),C.dgray,{lw:2.4,gap:3.5,fw:5});shape(rrect(-6,-26,12,22,2),null,{solid:o.lit?'#EBF2E2':'#CDE8F7',lw:1.6});pop()}

// ── people ──
function mom(x,t,o={}){const hx=x-24*S,hy=FY-104*S;push();tr(hx,hy);shape([[0,-12],[-12,-4],[-16,16],[-10,34],[-4,20],[4,4]],C.brown,{lw:2.8,gap:4,fw:6});pop();
 person(x,FY,S,{t,cloth:C.dgreen,hair:C.brown,mouth:'smile',ph:.4,...o})}
function dad(x,t,o={}){person(x,FY,S,{t,flip:1,cloth:C.orange,hat:'cap',hatc:C.blue,hair:C.dbrown,stache:1,ph:1.3,...o})}
function basket(x,y,items){push();tr(x,y);line(bez([-24,4],[-20,-26],[20,-26],[24,4],8),{lw:3.4,single:1});
 items.forEach((k,i)=>PROD[k](-18+(i%3)*18,6-Math.floor(i/3)*12,.5));
 shape([[-30,2],[30,2],[24,34],[-24,34]],C.orange,{lw:3.2,gap:4.5,fw:7});line([[-27,14],[27,14]],{lw:2,single:1,col:C.dbrown});line([[-25,25],[25,25]],{lw:2,single:1,col:C.dbrown});pop()}
function cart(x,items){push();tr(x,FY);sc(1.15);
 items.forEach((k,i)=>PROD[k](-30+(i%4)*20,-104-Math.floor(i/4)*14,.62));
 line([[-50,-108],[-64,-120]],{lw:4,single:1});line([[-44,-50],[-40,-14],[40,-14],[46,-50]],{lw:3.4,single:1});
 shape([[-52,-110],[52,-110],[44,-50],[-44,-50]],null,{solid:'rgba(169,212,240,.35)',lw:3.6});
 for(let i=1;i<5;i++)line([[-52+i*20.8,-110],[-44+i*17.6,-50]],{lw:1.8,single:1,col:'#7FA7C4'});line([[-48,-80],[48,-80]],{lw:1.8,single:1,col:'#7FA7C4'});
 [-34,34].forEach(q=>shape(blob(q,-6,7,7,10,0),C.dgray,{lw:2.4,gap:3,fw:5}));pop()}
function stress(t){return clamp((t-6.5)/3)}
function flight(k,from,to,tg,t,s0=.8,s1=.5){const p=span(t,tg,tg+.45);if(p<=0||p>=1)return;const e=eout(p);PROD[k](lerp(from[0],to[0],e),lerp(from[1],to[1],e)-Math.sin(p*Math.PI)*90,lerp(s0,s1,e))}
const momBasket=()=>[MOMX-30*S,FY-46*S+4],dadCartTop=()=>[CARTX,FY-122];

// ── counter board ──
const LINES=[['MILK',[[3.3,1],[3.42,2]]],['PASTA',[[6.0,1],[6.12,2]]],['EGGS',[[6.9,12],[7.02,24]]],['BANANAS',[[7.8,6],[7.92,12]]],['CHEESE',[[8.7,1],[8.82,2]]]];
function board(rows,t,col=C.yellow){if(!rows.length)return;const h=34+rows.length*40;push();tr(270,30);
 shape([[-112,0],[112,-4],[116,h],[-114,h+3]],col,{lw:3.4,gap:6,fw:11,ang:-.05});
 rows.forEach(([lab,val,tc,red],i)=>{const pp=1+.35*Math.max(0,1-(t-tc)*5);push();tr(0,46+i*40);sc(pp);txt(`${lab}: ${val}`,0,0,36,red?C.red:NAVY,'Brush',{align:'center'});pop()});pop()}
function boardA(t){const rows=[];LINES.forEach(([lab,steps])=>{let v=null,tc=-9;steps.forEach(([a,n])=>{if(t>=a){v=n;tc=a}});if(v!==null)rows.push([lab,v,tc,v>1&&lab!=='EGGS'&&lab!=='BANANAS'||(lab==='EGGS'&&v>12)||(lab==='BANANAS'&&v>6)])});board(rows,t)}

function bub(t,t0,t1,lines,x,y,tail,o={}){if(t<t0||t>t1)return;const ex=span(t,t1-.14,t1);if(ex>0){GA=1-ex;push();tr(x,y);sc(1-ex*.3);tr(-x,-y);bubble(lines,x,y,t-t0,tail,o);pop();GA=1}else bubble(lines,x,y,t-t0,tail,o)}

// ── A: two shoppers, split screen ──
function sceneA(t){
 wall(-30,270,'#F9E6C8');wall(270,W+30,'#F3DCCF');floor();shelves(MOMX+18,'DAIRY');shelves(DADX+40,'DAIRY');
 const st=stress(t),ring=t<2.6;
 const mItems=KINDS.filter(k=>t>=GRAB[k]+.45),dItems=KINDS.filter(k=>t>=GRAB[k]+.57);
 const shake=st>.6?Math.sin(t*60)*2*st:0;
 const mOpt={armL:[-30,-46],armR:ring?[22,-100]:[26,-74],mouth:t>.3&&t<1.4?'talk':st>.4?'grit':t>1.4&&t<3?'flat':'smile',twitch:st*1.5,steam:st>.3?st:0,brows:st>.5?'angry':undefined,look:t>1.4&&t<3?3:0};
 const dOpt={armL:[-32,-80],armR:ring?[22,-100]:[26,-74],mouth:t>1.4&&t<2.6?'talk':st>.4?'grit':'smile',twitch:st*1.5,steam:st>.3?st:0,brows:st>.5?'angry':undefined,look:t<1.4?-3:0};
 cart(CARTX,dItems);
 mom(MOMX+shake,t,mOpt);dad(DADX-shake,t,dOpt);
 basket(MOMX-30*S+shake,FY-46*S+4,mItems);
 if(ring){phoneAt(MOMX+30*S,FY-108*S,{t,buzz:t<.35,rot:.2});phoneAt(DADX-30*S,FY-108*S,{t,buzz:t>1.1&&t<1.45,rot:-.2})}
 KINDS.forEach(k=>{flight(k,shelfPos(MOMX+18,k),momBasket(),GRAB[k],t);flight(k,shelfPos(DADX+40,k),dadCartTop(),GRAB[k]+.12,t,.8,.62)});
 if(st>.5){sweat(MOMX+28,FY-150*S,t);sweat(DADX-28,FY-150*S,t+.3)}
 splitLine();
 bub(t,.3,2.6,["Do we have","milk?"],140,330,[MOMX+10,FY-128*S],{size:30});
 bub(t,1.4,3.1,["Don't know.","Do we?"],405,330,[DADX-10,FY-128*S],{size:30});
 bub(t,6.85,7.7,["Eggs!"],100,560,[MOMX,FY-130*S],{size:30,col:C.red});
 bub(t,6.95,7.75,["Eggs!"],440,560,[DADX,FY-130*S],{size:30,col:C.red});
 boardA(t)}

// ── B: the checkout crash ──
function sceneB(t){
 wall(-30,W+30,'#F6E2C6');floor();
 push();tr(270,250);shape(rrect(-110,0,220,52,8),C.yellow,{lw:3.4,gap:5,fw:9});txt('CHECKOUT',0,38,40,NAVY,'Brush',{align:'center'});pop();
 shape(rrect(150,560,240,90,8),C.gray,{lw:4,gap:5,fw:9});shape(rrect(160,540,220,26,6),C.dgray,{lw:3,gap:4,fw:8});
 const k=eout(span(t,10.0,10.5)),hit=t>=10.5,bump=hit?Math.max(0,1-(t-10.5)*4)*Math.sin((t-10.5)*40)*6:0;
 const mx=lerp(-80,150,k)-bump,dx=lerp(680,410,k)+bump,cx=dx-92;
 const walk=t<10.5?11:0,face=hit?'flat':'grit';
 const left=hit?[]:KINDS,right=hit?['eggs','cheese','pasta']:KINDS;
 cart(cx,right);
 mom(mx,t,{walk,armR:[30,-46],mouth:t>=11.4?'sad':face,eye:hit?'tired':undefined,look:hit?2:0});
 dad(dx,t,{walk,armR:[32,-80],mouth:t>=11.4?'sad':face,eye:hit?'tired':undefined,look:hit?-2:0});
 basket(mx+30*S,FY-46*S+4,left.length?left:['eggs','pasta']);
 if(hit){[['milk',-1.1,0],['milk',1.0,.08],['banana',-.6,.04],['banana',.7,.12],['pasta',.2,.02]].forEach(([kd,vx,d],i)=>{const p=span(t,10.5+d,11.9+d);if(p<=0)return;const yy=560-Math.sin(Math.min(p,1)*Math.PI)*300+p*p*120;if(p<1){push();tr(270+vx*190*p,yy);rot(p*5*vx);PROD[kd](0,0,1.1);pop()}});
  for(let i=0;i<10;i++){const r=mk(i*31+5),p=span(t,10.5,11.1);if(p>0&&p<1){GA=1-p;dot(270+(r()-.5)*240*p,520+(r()-.5)*200*p,4+r()*4,C.yellow);GA=1}}
  if(t>=11.3){const q=back(span(t,11.3,11.6));push();tr(270,FY-10);sc(q,q*.5);shape(blob(0,0,80,30,14,.25),null,{solid:CREAM,lw:3});pop()}}
 if(t>=11.0){const q=back(span(t,11.0,11.35));push();tr(270,110);sc(q);tr(-270,-110);shape([[70,60],[470,54],[476,160],[66,164]],C.yellow,{lw:3.4,gap:6,fw:11,ang:-.05});txt('2 milk. 2 pasta.',270,104,42,NAVY,'Brush',{align:'center'});txt('0 plan.',270,148,42,C.red,'Brush',{align:'center'});pop()}
 if(t>=10.5&&t<10.75){const q=span(t,10.5,10.75);for(let i=0;i<8;i++){const a=i/8*6.28;line([[270+Math.cos(a)*(20+q*40),620+Math.sin(a)*(20+q*40)],[270+Math.cos(a)*(40+q*60),620+Math.sin(a)*(40+q*60)]],{lw:4,col:C.red,single:1})}}}

// ── app ──
const TAGS=[[14.4,'Mom'],[15.1,'Dad'],[15.8,'Mom'],[16.5,'Dad'],[17.2,'Mom']];
function appScene(t){
 shape(FULL,null,{solid:'#FBE6CE',noline:1});
 shape(blob(270,490,320,330,18,.05),'#F6CFA0',{noline:1,gap:7,fw:11,flat:1,ang:-.3});
 [[56,190],[484,180],[50,880],[490,890]].forEach(([x,y],i)=>sparkle(x,y+Math.sin(t*3+i)*5,.9,t*1.5+i));
 const slide=1-back(span(t,13.05,13.7)),out=ein(span(t,18.7,19.2)),oy=(slide+out)*900;
 push();tr(0,oy);shape(rrect(95-14,102-14,350+28,757+28,42),C.dgray,{lw:4,gap:5,fw:9,col2:C.gray});shape(rrect(95,102,350,757,28),null,{solid:'#FDFCFA',lw:2});pop();
 TAGS.forEach(([tc,who],i)=>{if(t<tc||t>18.75)return;const q=back(span(t,tc,tc+.3)),L=who==='Mom',x=L?46:494,y=300+i*100;push();tr(x,y);sc(q);rot(L?-.12:.12);
  shape(rrect(-42,-26,84,48,10),null,{solid:L?'#EBF2E2':'#FDEBD7',lw:3});line([[-32,-2],[-24,8],[-12,-12]],{lw:4,col:C.dgreen,single:1});txt(who,12,10,26,L?C.dgreen:C.orange,'Brush',{align:'center'});pop()});
 const sets=[[13.3,15.3,'So they shared one list.'],[15.3,17.3,'Every tick shows up live.'],[17.3,19.2,'Nobody buys it twice.']];
 sets.forEach(([a,b,s])=>{if(t>=a&&t<b){const k=back((t-a)/.3);push();tr(270,58);sc(k);tr(-270,-58);shape([[40,18],[500,14],[506,76],[36,80]],C.yellow,{lw:3.2,gap:6,fw:11,ang:-.05});txt(s,270,62,42,NAVY,'Brush',{align:'center'});pop()}})}

// ── D: resolved, same split screen ──
function sceneD(t){
 wall(-30,270,'#F9E6C8');wall(270,W+30,'#F3DCCF');floor();shelves(MOMX+18,'DAIRY');shelves(DADX+40,'DAIRY');
 const tapped=t>=19.9,dinged=t>=20.2,back_=t>=20.9,thumbs=t>=21.0;
 const dItems=back_?[]:['milk'];
 cart(CARTX,dItems);
 mom(MOMX,t,{armL:[-30,-46],armR:t>=19.75&&t<20.6?[24,-80]:[26,-74],mouth:'smile',cheeks:t>20.6});
 dad(DADX,t,{armL:[-32,-80],armR:thumbs?[30,-126]:dinged?[24,-82]:[26,-74],mouth:dinged&&!thumbs?'open':'smile',cheeks:thumbs,look:dinged&&!thumbs?-3:0});
 basket(MOMX-30*S,FY-46*S+4,t>=19.95?['milk']:[]);
 flight('milk',shelfPos(MOMX+18,'milk'),momBasket(),19.5,t);
 flight('milk',dadCartTop(),shelfPos(DADX+40,'milk'),20.45,t,.62,.8);
 if(t>=19.75&&t<20.6){phoneAt(MOMX+24*S,FY-80*S,{t,lit:tapped});if(tapped&&t<20.15){const q=span(t,19.9,20.15);GA=1-q;shape(blob(MOMX+24*S,FY-92*S,10+q*16,10+q*16,12,0),null,{lw:3,col:C.yellow,single:1});GA=1}}
 if(dinged&&!thumbs){phoneAt(DADX-24*S,FY-82*S,{t,lit:1,buzz:t<20.4});const q=back(span(t,20.2,20.5));push();tr(DADX-24*S,FY-82*S-62);sc(q);shape(rrect(-44,-20,88,34,10),null,{solid:'#EBF2E2',lw:2.6});line([[-34,-4],[-27,4],[-17,-10]],{lw:3.4,col:C.dgreen,single:1});txt('Milk',10,8,24,C.dgreen,'Brush',{align:'center'});pop()}
 if(thumbs){const hx=DADX-30*S,hy=FY-126*S;line([[hx,hy-4],[hx+2,hy-20]],{lw:5,single:1});sparkle(hx-24,hy-30,.6,t*2)}
 splitLine();
 bub(t,21.6,23.1,["Got the","milk!"],140,330,[MOMX+10,FY-128*S],{size:32,col:C.dgreen,fill:'#EBF2E2'});
 bub(t,22.0,23.1,["I saw!"],405,350,[DADX-10,FY-128*S],{size:34,col:C.dgreen,fill:'#EBF2E2'});
 const one=t>=20.9;board([['MILK',one?1:2,one?20.9:-9,!one]],t,one?C.green:C.yellow)}

function wipe(t,tc,col=C.orange){const p=span(t,tc-.3,tc),q=span(t,tc,tc+.3);if(p<=0||q>=1)return;const a=q*(W+120)-60,b=p*(W+120)-60;shape([[a-20,-30],[b+10,-30],[b-10,H+30],[a-30,H+30]],col,{noline:1,gap:9,lw:16,ang:.6,flat:1})}

function endCard(t){const lt=t-TL.E;
 shape(FULL,null,{solid:'#F2EAD8',noline:1});shape(blob(270,430,300,300,18,.05),'#F6CFA0',{noline:1,gap:7,fw:11,flat:1,ang:-.3});
 mom(170,t,{armR:[30,-60],cheeks:1,look:2});dad(370,t,{armR:[30,-60],cheeks:1,look:-2});milk(270,FY-62,1.4);
 const e=back(span(lt,.1,.6));push();tr(270,210);sc(e);tr(-270,-210);txt('dinrr',270,236,190,C.dgreen,'Brush',{align:'center',stroke:NAVY,sw:12,jit:.6});line([[130,262],[200,270],[270,260],[350,271],[410,262]],{lw:8,col:C.orange,single:1,wob:1.6});pop();
 txt("One list.",270,345,48,NAVY,'Brush',{align:'center',n:(lt-.6)*30});txt('Zero double milk.',270,400,50,C.red,'Brush',{align:'center',n:(lt-1.1)*30});
 if(lt>1.9){const q=back(span(lt,1.9,2.3));push();tr(270,466);sc(q);tr(-270,-466);shape(rrect(150,438,240,58,29),C.yellow,{lw:3.4,gap:4.5,fw:8});txt('@dinrr.app',270,478,34,NAVY,'Brush',{align:'center'});pop()}}

// ── sound events ──
const SFX=[];const ev=(t,type,x={})=>SFX.push({t:Math.round(t*1000)/1000,type,...x});
ev(.05,'ring');ev(1.15,'ring');ev(.3,'bonk',{i:0});ev(1.4,'bonk',{i:2});
ev(3.3,'tink',{i:0});ev(3.42,'tink',{i:2});ev(3.45,'bonk',{i:4});
[[6.0,67],[6.9,69],[7.8,71],[8.7,74]].forEach(([tt,m],i)=>{ev(tt,'xnote',{m});ev(tt+.12,'xnote',{m:m+3});ev(tt+.15,'bonk',{i:5+i*2})});
ev(6.85,'squeak');ev(8.5,'drumroll',{d:1.5});
for(let k=0;k<5;k++)ev(10.0+k*.1,'step');
ev(10.5,'honk');ev(10.5,'crash');ev(10.62,'shatter');ev(11.0,'bonk',{i:1});ev(11.3,'deflate');ev(11.45,'wah');
ev(12.6,'whoosh',{dir:'out'});ev(12.75,'slide',{dir:'up'});ev(13.05,'whoosh',{dir:'in'});
ev(13.75,'tap');TAGS.forEach(([tc],i)=>{ev(tc,'check');ev(tc+.05,'tink',{i})});
ev(18.7,'whoosh',{dir:'out'});ev(19.2,'whoosh',{dir:'in'});
ev(19.95,'tink',{i:1});ev(19.9,'tap');ev(20.2,'chime');ev(20.45,'slide',{dir:'down'});ev(20.9,'slide',{dir:'up'});ev(21.0,'tada');
ev(21.6,'xylo',{i:0});ev(22.0,'xylo',{i:1});
ev(23.0,'whoosh',{dir:'out'});ev(23.6,'logo');ev(24.2,'sparkles');
window.SFX=SFX.sort((a,b)=>a.t-b.t);window.DUR=TL.DUR;window.TL=TL;

window.render=(t,tap)=>{
 SEED=Math.floor(t*8);K=0;GA=1;M=[1,0,0,1,0,0];stack=[];
 ctx.setTransform(2,0,0,2,0,0);ctx.globalAlpha=1;ctx.fillStyle=PAPER;ctx.fillRect(0,0,W,H);
 const app=document.getElementById('pw'),tp=document.getElementById('tap');let appOn=false;
 if(t<TL.B)sceneA(t);else if(t<TL.C-.25)sceneB(t);else if(t<TL.D-.25){appScene(t);appOn=t>13.0&&t<19.25}else if(t<TL.E-.25)sceneD(t);else endCard(t);
 wipe(t,TL.C-.1);wipe(t,TL.D-.1,C.green);wipe(t,TL.E-.1,C.orange);
 const g=ctx.createRadialGradient(W/2,H*.45,260,W/2,H/2,760);g.addColorStop(0,'rgba(255,250,235,0)');g.addColorStop(1,'rgba(150,120,80,.2)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=.55;ctx.drawImage(grain,0,0);ctx.globalAlpha=1;
 app.style.visibility=appOn?'visible':'hidden';
 const slide=1-back(span(t,13.05,13.7)),out=ein(span(t,18.7,19.2));app.style.transform=`translateY(${(slide+out)*900}px)`;
 if(tap&&t>=tap.t-.05&&t<tap.t+.35){const k=(t-tap.t)/.35;tp.style.opacity=k<0?0:1-k;tp.style.left=tap.x+'px';tp.style.top=tap.y+'px';tp.style.transform=`scale(${.6+k*.8})`}else tp.style.opacity=0;
};
</script>
