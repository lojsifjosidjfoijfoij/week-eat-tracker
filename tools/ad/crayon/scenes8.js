// ───────────── #8 "The Last Tomato" — Tom the tomato rescues a forgotten cucumber from the back of the fridge ─────────────
const mixc=(a,b,k)=>{const p=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)],A=p(a),B=p(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,'0')).join('')};
// ── Tom ──
function tom(x,y,s,o={}){const age=o.age||0,t=o.t||0,sq=(o.sq||1)*(1-.2*age),ry=58*sq,col=mixc('#E4483D','#8F6050',age);push();tr(x,y);sc(s);tr(0,-ry);rot(o.rotv||0);tr(0,ry);
 if(o.cape){const w=Math.sin(t*7)*6;shape([[-34,-ry*1.55],[34,-ry*1.55],[96,-ry*.2+w],[60,-ry*.05-w],[20,-ry*.15+w],[-24,-ry*.02-w],[-62,-ry*.12+w],[-96,-ry*.22-w]],C.blue,{lw:3.4,gap:5,fw:9})}
 const lc=mixc('#62AE3E','#8A6A3A',age*1.1);
 // arms
 const aU=o.arms==='up';
 limb([-60,-ry*.9],[aU?-92:-84,aU?-ry*1.9+Math.sin(t*14)*8:-ry*.4],7,col);limb([60,-ry*.9],[aU?92:84+(o.wave?Math.sin(t*10)*12:0),aU?-ry*1.9-Math.sin(t*14)*8:-ry*(o.wave?1.8:.4)],7,col);
 shape(blob(0,-ry,66,ry,18,.04+.05*age),col,{lw:4,gap:5,fw:8});
 // leaf crown
 const lp=[];for(let i=0;i<10;i++){const a=-Math.PI/2+(i-4.5)*.26,r=i%2?16:30;lp.push([Math.cos(a)*r*1.1,-2*ry+6+Math.sin(a)*r*.7+(age>.5?(i%2?4:10):0)])}
 shape([[0,-2*ry+8],[-26,-2*ry-6+(age>.5?12:0)],[-10,-2*ry-16],[0,-2*ry-34+(age>.5?18:0)],[12,-2*ry-16],[28,-2*ry-6+(age>.5?12:0)]],lc,{lw:3,gap:4,fw:7});
 if(age<.3)line([[-40,-ry*1.55],[-30,-ry*1.75],[-14,-ry*1.85]],{lw:4,col:'rgba(255,255,255,.7)',single:1});
 if(age>.25)for(let i=0;i<4;i++)line([[-44+i*10,-ry*1.55+i*8],[-30+i*10,-ry*1.4+i*6],[-18+i*8,-ry*1.55+i*8]],{lw:2.4,col:mixc('#22305A','#8F6050',.3),single:1});
 if(age>.7)for(let i=0;i<5;i++){push();tr(-40+i*22+(i%2)*6,-ry*(.5+(i%3)*.4));shape(blob(0,0,9+i%2*4,8,8,.25),'#BFD0A8',{lw:2,gap:3,fw:5});pop()}
 // eyes
 const lk=o.look||[0,0],ey=-ry*1.05,mood=o.mood||'happy',lid=clamp(age*1.3,0,.8)+(o.lid||0);
 [-24,24].forEach(ex=>{shape(blob(ex,ey,15,17,10,0),null,{solid:CREAM,lw:3});dot(ex+lk[0]*5,ey+lk[1]*5,6.5);if(lid>.1){const cut=ey-17+34*lid,pp=[];for(let q=0;q<=12;q++){const a=Math.PI+q/12*Math.PI;pp.push([ex+Math.cos(a)*16,Math.min(cut,ey+Math.sin(a)*18)])}pp.push([ex+16,cut],[ex-16,cut]);shape(pp,null,{solid:col,lw:2.6})}});
 const br=mood==='worried'?[[-38,ey-26],[-12,ey-32]]:mood==='sad'?[[-38,ey-32],[-12,ey-24]]:null;
 if(br){line(br,{lw:3.2,single:1});line([[38,br[0][1]],[12,br[1][1]]],{lw:3.2,single:1})}else if(mood==='happy')[-24,24].forEach(ex=>line([[ex-12,ey-26],[ex,ey-31],[ex+12,ey-26]],{lw:3,single:1}));
 const my=-ry*.55;
 if(mood==='happy')line([[-20,my],[0,my+16],[20,my]],{lw:3.4,single:1});
 else if(mood==='open'||mood==='shock'){shape(blob(0,my+2,mood==='shock'?11:14,mood==='shock'?14:11,10,0),C.red,{lw:3,gap:3.5,fw:6})}
 else if(mood==='worried')line([[-18,my+8],[-8,my+2],[2,my+9],[12,my+2],[20,my+8]],{lw:3.2,single:1});
 else if(mood==='sad')line([[-18,my+14],[0,my],[18,my+14]],{lw:3.4,single:1});
 else line([[-16,my+6],[16,my+6]],{lw:3.4,single:1});
 if(age<.2&&!o.nocheek)[-1,1].forEach(q=>dot(q*46,-ry*.8,7,'rgba(238,127,160,.6)'));
 if(o.sweat)for(let i=0;i<2;i++){const k=(t*1.4+i*.5)%1;push();tr(62+i*14,-ry*1.4+k*30);shape([[0,-10],[6,0],[0,6],[-6,0]],C.lblue,{lw:2.4,gap:3,fw:5});pop()}
 pop()}

const TL={C:9.5,D:15.9,E:20.0,DUR:23.6};
const FULL=[[-30,-30],[W+30,-30],[W+30,H+30],[-30,H+30]];
const FY=760,TS=.78;

// ── Cuke the cucumber (our own character) ──
function cuke(x,y,s,o={}){const t=o.t||0,age=o.age||0,sh=o.shake?Math.sin(t*48)*2.6*o.shake:0;push();tr(x+sh,y);sc(s);rot(o.tilt||0);
 const col=mixc('#3F8F33','#8C9470',age),hi=mixc('#8CC867','#B9BFA0',age);
 limb([-15,-16],[-19,2],7,C.dgreen);limb([15,-16],[19,2],7,C.dgreen);
 shape(blob(-24,4,13,6,8,0),NAVY,{lw:2,flat:1,gap:3,fw:4});shape(blob(24,4,13,6,8,0),NAVY,{lw:2,flat:1,gap:3,fw:4});
 const aL=o.armL||[-62,-96+Math.sin(t*5)*4],aR=o.armR||[62,-96+Math.cos(t*5)*4];
 limb([-36,-112],aL,6.5,C.dgreen);limb([36,-112],aR,6.5,C.dgreen);
 shape(blob(aL[0],aL[1],6,6,8,0),hi,{lw:2.4,gap:3,fw:4});shape(blob(aR[0],aR[1],6,6,8,0),hi,{lw:2.4,gap:3,fw:4});
 shape(blob(0,-112,42,102,22,.04+.05*age),col,{lw:3.8,gap:5,fw:8,col2:hi});
 for(let i=-1;i<=1;i++)line([[i*20,-196+Math.abs(i)*10],[i*22,-30-Math.abs(i)*12]],{lw:3,col:hi,single:1,wob:1.2});
 [[-26,-60],[24,-74],[-10,-40],[28,-150],[-30,-170],[12,-30]].forEach(([bx,by])=>dot(bx,by,3,mixc('#1F5A1C','#6A6A55',age)));
 shape(rrect(-8,-226,16,16,5),C.brown,{lw:2.6,gap:3,fw:5});
 if(age>.25)for(let i=0;i<4;i++){const yy=-82+i*16;line([[-30,yy],[-20,yy-4],[-10,yy],[0,yy-4]],{lw:2.2,col:mixc('#22305A','#8C9470',.3),single:1})}
 const ey=-156,lk=o.look||[0,0],mood=o.mood||'happy',lid=clamp(age*.9,0,.6)+(o.lid||0);
 if(o.shades){[-18,18].forEach(q=>shape(rrect(q-17,ey-12,34,22,8),'#1B2236',{lw:2.6,gap:3,fw:5}));line([[-2,ey-3],[2,ey-3]],{lw:3,single:1})}
 else [-17,17].forEach(ex=>{shape(blob(ex,ey,12,14,10,0),null,{solid:CREAM,lw:2.8});dot(ex+lk[0]*4,ey+lk[1]*4,5.2);
  if(lid>.1){const cut=ey-14+28*lid,pp=[];for(let q=0;q<=12;q++){const a=Math.PI+q/12*Math.PI;pp.push([ex+Math.cos(a)*13,Math.min(cut,ey+Math.sin(a)*15)])}pp.push([ex+13,cut],[ex-13,cut]);shape(pp,null,{solid:col,lw:2.4})}});
 if(mood==='angry'||mood==='shout'){line([[-32,ey-26],[-8,ey-18]],{lw:3.2,single:1});line([[32,ey-26],[8,ey-18]],{lw:3.2,single:1})}
 else if(mood==='sad'||mood==='worried'){line([[-32,ey-18],[-8,ey-26]],{lw:3.2,single:1});line([[32,ey-18],[8,ey-26]],{lw:3.2,single:1})}
 else if(mood==='happy')[-17,17].forEach(ex=>line([[ex-10,ey-22],[ex,ey-27],[ex+10,ey-22]],{lw:2.8,single:1}));
 const my=-122;
 if(mood==='shout'){const k=o.talk?.55+.45*Math.abs(Math.sin(t*13)):1;shape(blob(0,my+4,15,13*k+3,12,0),C.red,{lw:2.8,gap:3,fw:5})}
 else if(mood==='happy')line([[-15,my],[0,my+11],[15,my]],{lw:3.2,single:1});
 else if(mood==='sad')line([[-13,my+9],[0,my],[13,my+9]],{lw:3.2,single:1});
 else if(mood==='worried')line([[-14,my+5],[-7,my],[0,my+6],[7,my],[14,my+5]],{lw:3,single:1});
 else if(mood==='talk'){const k=.4+.6*Math.abs(Math.sin(t*13));shape(blob(0,my+3,10,8*k+2,10,0),C.red,{lw:2.6,gap:3,fw:4})}
 else line([[-11,my+4],[11,my+4]],{lw:3,single:1});
 if(o.cheeks)[-1,1].forEach(q=>dot(q*30,ey+18,6,'rgba(238,127,160,.6)'));
 if(o.sweat)for(let i=0;i<2;i++){const k=(t*1.5+i*.5)%1;push();tr(44+i*10,-190+k*30);shape([[0,-9],[5,0],[0,5],[-5,0]],C.lblue,{lw:2.3,gap:3,fw:4});pop()}
 if(o.cold){for(let i=0;i<3;i++){const k=((t*1.3)+i/3)%1;GA=(1-k)*.9;push();tr(22+k*40,my-4-k*30);sc(.5+k);shape(blob(0,0,9,7,8,.1),null,{solid:'#FFFFFF',lw:1.8});pop();GA=1}}
 pop()}

// ── leftovers jungle (our own doodles, no brands) ──
function boxL(x,t,pop_){push();tr(x,FY);shape(rrect(-50,-74,100,74,10),'#CFE3EE',{lw:3.4,gap:5,fw:9,flat:1});
 const lid=pop_>0?-26*Math.sin(Math.min(1,pop_)*3.14):0;push();tr(0,lid);rot(lid*.01);shape(rrect(-55,-88,110,18,6),C.blue,{lw:3.2,gap:4,fw:7});pop();
 shape(rrect(-30,-56,60,26,4),CREAM,{lw:2.4,solid:CREAM});txt('???',0,-36,24,C.red,'Brush',{align:'center'});
 GA=.8;shape(blob(-6,-12,34,9,10,.2),'#C9A35F',{noline:1,gap:4,fw:6,flat:1});GA=1;pop()}
function fuzz(x,t,sq,angry){push();tr(x,FY);shape(rrect(-52,-34,104,34,12),C.gray,{lw:3.4,gap:5,fw:8});
 push();tr(0,-34);sc(1+sq*.25,1-sq*.4);const pts=[];for(let i=0;i<=24;i++){const a=Math.PI+i/24*Math.PI,r=46+(i%2?7:0)+Math.sin(t*20+i)*1.5;pts.push([Math.cos(a)*r,Math.sin(a)*r*.82])}
 shape(pts,'#A7B78A',{lw:3,gap:4,fw:7});for(let i=0;i<7;i++){const a=Math.PI+(i+.5)/7*Math.PI;line([[Math.cos(a)*44,Math.sin(a)*36],[Math.cos(a)*56,Math.sin(a)*46]],{lw:2.4,col:'#6E7F55',single:1})}
 dot(-13,-20,4.5);dot(13,-20,4.5);if(angry){line([[-22,-32],[-6,-26]],{lw:3,single:1});line([[22,-32],[6,-26]],{lw:3,single:1});line([[-9,-8],[9,-8]],{lw:3,single:1})}else line([[-7,-8],[0,-5],[7,-8]],{lw:2.6,single:1});
 pop();pop()}
function jelly(x,t,jig){push();tr(x,FY);shape(blob(0,-6,60,10,12,0),CREAM,{lw:3,solid:CREAM});
 const w=Math.sin(t*28)*jig;push();tr(0,-12);sc(1+w*.18,1-w*.22);shape([[-44,0],[-36,-70],[-20,-92],[20,-92],[36,-70],[44,0]],C.pink,{lw:3.4,gap:5,fw:8,col2:'#F8B9CB'});
 line([[-22,-80],[-26,-30]],{lw:4,col:'rgba(255,255,255,.75)',single:1});pop();pop()}
function backFridge(t){
 shape(FULL,null,{solid:'#E6F0F2',noline:1});shape([[-30,150],[W+30,150],[W+30,FY],[-30,FY]],'#D5E5EA',{noline:1,gap:9,fw:12,flat:1,ang:.4});
 for(let i=0;i<6;i++)line([[-10,220+i*90],[W+10,216+i*90]],{lw:1.6,col:'#B7CED6',single:1});
 // upper shelf with forgotten stuff
 shape(rrect(-30,420,W+60,16,5),C.lblue,{lw:3.2,gap:4.5,fw:7,flat:1});
 push();tr(70,420);shape(rrect(-30,-66,60,66,6),'#E8D9A0',{lw:3,gap:4,fw:7,flat:1});txt('day 9',0,-28,18,C.dgray,'Pat',{align:'center'});pop();
 push();tr(470,420);shape(blob(0,-26,40,26,12,.06),C.orange,{lw:3,gap:4,fw:7});txt('?',0,-18,28,NAVY,'Brush',{align:'center'});pop();
 // main shelf + crisper
 shape(rrect(-30,FY,W+60,20,6),C.lblue,{lw:3.6,gap:4.5,fw:8,flat:1});line([[-30,FY+28],[W+30,FY+28]],{lw:2,single:1,col:'#9DB5C9'});
 shape(rrect(20,FY+44,W-40,170,18),'#BFE0B0',{lw:3.4,gap:6,fw:9,ang:.3});
 // frost sparkles + fridge light
 [[40,190],[500,230],[30,620],[505,560]].forEach(([x,y],i)=>{const k=.5+.5*Math.sin(t*3+i*2);push();tr(x,y);sc(.5+.3*k);line([[-10,0],[10,0]],{lw:2.4,col:'#7FB3D5',single:1});line([[0,-10],[0,10]],{lw:2.4,col:'#7FB3D5',single:1});pop()})}

function topBox(l1,big,t,tc,col,bigCol,shake=0){const sh=shake?Math.sin(t*50)*2.5*shake:0;push();tr(270+sh,18);
 shape([[-250,0],[250,-4],[254,122],[-252,126]],col,{lw:3.6,gap:6,fw:11,ang:-.05});
 txt(l1,0,40,30,NAVY,'Brush',{align:'center'});
 const pp=1+.09*Math.max(0,1-(t-tc)*5);push();tr(0,104);sc(pp);txt(big,0,0,48,bigCol,'Brush',{align:'center'});pop();pop()}
function lowerThird(s1,s2,t,t0=0){const k=eout(span(t,t0,t0+.35));if(k<=0)return;push();tr(lerp(-420,0,k),0);
 const w=tw(s1,34,'Brush')+tw(s2,26,'Pat')+44;shape(rrect(14,896,w,50,8),C.yellow,{lw:3.2,gap:5,fw:9,ang:-.05});
 txt(s1,30,932,34,NAVY,'Brush');txt(s2,34+tw(s1,34,'Brush'),931,26,NAVY,'Pat');pop()}
function bub(t,t0,t1,lines,x,y,tail,o={}){if(t<t0||t>t1)return;const ex=span(t,t1-.14,t1);if(ex>0){GA=1-ex;push();tr(x,y);sc(1-ex*.3);tr(-x,-y);bubble(lines,x,y,t-t0,tail,o);pop();GA=1}else bubble(lines,x,y,t-t0,tail,o)}
function wipe(t,tc,col=C.orange){const p=span(t,tc-.3,tc),q=span(t,tc,tc+.3);if(p<=0||q>=1)return;const a=q*(W+120)-60,b=p*(W+120)-60;shape([[a-20,-30],[b+10,-30],[b-10,H+30],[a-30,H+30]],col,{noline:1,gap:9,lw:16,ang:.6,flat:1})}
function miniPhone(x,y,s){push();tr(x,y);sc(s);rot(-.15);shape(rrect(-16,-56,32,54,6),C.dgray,{lw:2.8,gap:4,fw:6});shape(rrect(-12,-51,24,42,3),'#EBF2E2',{lw:2,flat:1});txt('dinrr',0,-26,11,C.dgreen,'Brush',{align:'center',jit:.3});pop()}

// Tom's parkour path: [t0,t1,x0,y0,x1,y1,arcHeight]
const CUX=458,O1=150,O2=262,O3=362;
const HOPS=[[3.2,3.7,-70,FY,40,FY,0],[3.75,4.25,40,FY,O1,FY-88,120],[4.45,4.95,O1,FY-88,O2,FY-80,110],[5.15,5.6,O2,FY-80,O3,FY-104,90],[5.8,6.45,O3,FY-104,392,FY,230]];
function tomPos(t){if(t<HOPS[0][0])return[-200,FY,0];for(let i=HOPS.length-1;i>=0;i--){const[a,b,x0,y0,x1,y1,hh]=HOPS[i];if(t>=a){if(t>=b)return[x1,y1,0];const k=(t-a)/(b-a);return[lerp(x0,x1,k),lerp(y0,y1,k)-Math.sin(k*3.1416)*hh,i===4?-k*6.2832:(i?Math.sin(k*3.14)*.3:0)]}}return[-200,FY,0]}
function daysAt(t){return t<1.05?12:t<1.85?13:t<2.65?14:15}
function dayTick(t){return t<1.05?0:t<1.85?1.05:t<2.65?1.85:2.65}

// ── A: the rescue ──
function sceneA(t){const zk=eio(span(t,3.0,3.6)),z=lerp(1.55,1,zk),Fx=lerp(400,270,zk),Fy=lerp(600,480,zk),Sx=lerp(300,270,zk),Sy=lerp(560,480,zk);
 push();tr(Sx,Sy);sc(z);tr(-Fx,-Fy);backFridge(t);
 const[tx,ty,tr_]=tomPos(t);
 // obstacles react
 const p1=t>4.2?span(t,4.2,4.7):0,sq2=t>4.9&&t<5.4?Math.sin(span(t,4.9,5.4)*3.14):0,jg=t>5.55?Math.max(0,1-(t-5.55)*1.6)*1.2:0;
 boxL(O1,t,p1);fuzz(O2,t,sq2,t>4.9&&t<7.5);jelly(O3,t,jg);
 // Cuke
 const grabbed=t>=6.6,moodC=t<2.4?'shout':t<3.2?'shout':t<6.6?'worried':t<7.2?'happy':t<8.5?'sad':'worried';
 cuke(CUX,FY,1.28,{t,age:.55,mood:moodC,talk:t<3.2,shake:t<3.2?1:t<6.6?.4:0,cold:t<6.6,sweat:t>=3.2&&t<6.6,look:t>=3.2&&t<6.6?[-1,0]:t>=8.5?[-1,-.4]:[0,0],
  armL:t<3.2?[-70,-170+Math.sin(t*16)*12]:grabbed?[-64,-80]:undefined,armR:t<3.2?[70,-170-Math.sin(t*16)*12]:undefined});
 // Tom
 if(t>=3.2){const land=t>6.45&&t<6.75?Math.sin(span(t,6.45,6.75)*3.14)*.25:0,sq=t>6.45?1-land*.6:1;
  const mood=t<3.75?'open':t<6.45?'worried':t<6.9?'open':t<8.4?'happy':'happy';
  tom(tx,ty,TS,{t,age:0,cape:1,mood,sq,rotv:tr_,look:[1,-.2],wave:t>8.3,arms:t>=3.75&&t<6.45?'up':''});
  if(t>8.3)miniPhone(tx+70,ty-80,1.2);
  if(t>6.45&&t<7)[[-40,0],[40,0]].forEach(([dx])=>dust(tx+dx*1.2,FY,span(t,6.45,7)));}
 // bubbles (screen space)
 bub(t,-1,2.35,["12 DAYS.","TWELVE!!"],350,410,[CUX-24,FY-175],{size:34,col:C.red,instant:1});
 bub(t,2.4,3.25,["Is ANYONE making","a salad??"],368,410,[CUX-24,FY-175],{size:30,col:C.red});
 pop();
 bub(t,3.35,4.4,["HANG ON, CUKE!"],210,290,[90,FY-130],{size:36,col:C.dgreen,fill:'#EBF2E2'});
 bub(t,4.95,5.9,["grrr."],130,560,[O2-20,FY-120],{size:30,col:C.dgray});
 bub(t,6.7,7.4,["Gotcha!"],280,520,[392,FY-110],{size:36,col:C.dgreen,fill:'#EBF2E2'});
 bub(t,7.45,8.5,["...but nobody","PLANNED a salad."],270,330,[CUX-30,FY-250],{size:36});
 bub(t,8.55,9.4,["Not for long."],210,450,[400,FY-120],{size:38,col:C.dgreen,fill:'#EBF2E2'});
 topBox("be honest... what's in the back of YOUR fridge?","DAYS FORGOTTEN: "+daysAt(t),t,dayTick(t),C.yellow,C.red,t<.3?1:0);
 lowerThird(t<3.3?'BACK OF THE FRIDGE':'MISSION',t<3.3?' · shelf 3':' · no veggie left behind',t,t<3.3?-1:3.3)}

// ── app ──
function appScene(t){
 shape(FULL,null,{solid:'#FBE6CE',noline:1});
 shape(blob(270,490,320,330,18,.05),'#CFE0BC',{noline:1,gap:7,fw:11,flat:1,ang:-.3});
 [[56,215,0],[488,205,1],[52,905,1],[490,912,0]].forEach(([x,y,c],i)=>c?cuke(x,y+Math.sin(t*3+i)*4,.32,{t,mood:'happy',cheeks:1}):tom(x,y+Math.sin(t*3+i)*4,.42,{t,mood:'happy',cape:1}));
 const slide=1-back(span(t,9.55,10.2)),out=ein(span(t,15.4,15.9)),oy=(slide+out)*900;
 push();tr(0,oy);shape(rrect(95-14,102-14,350+28,757+28,42),C.dgray,{lw:4,gap:5,fw:9,col2:C.gray});shape(rrect(95,102,350,757,28),null,{solid:'#FDFCFA',lw:2});pop();
 const sets=[[9.8,11.9,'So it went on the plan.'],[11.9,13.9,'Thursday: Greek salad.'],[13.9,15.9,'Cucumber: on the list.']];
 sets.forEach(([a,b,s])=>{if(t>=a&&t<b){const k=back((t-a)/.3);push();tr(270,58);sc(k);tr(-270,-58);shape([[30,18],[510,14],[516,76],[26,80]],C.yellow,{lw:3.2,gap:6,fw:11,ang:-.05});txt(s,270,62,s.length>24?37:42,NAVY,'Brush',{align:'center'});pop()}})}

// ── D: Thursday, salad bowl spa ──
function bowl(x,y,s,t){push();tr(x,y);sc(s);
 const pts=[];for(let i=0;i<=16;i++){const a=i/16*Math.PI;pts.push([Math.cos(a)*200,Math.sin(a)*130])}pts.push([-200,0]);
 shape(pts,'#F3F0E6',{lw:4.2,gap:5,fw:9,col2:'#FFFFFF',ang:.4});
 shape(blob(0,0,200,30,18,.02),'#7DBB55',{lw:3.6,gap:4,fw:7});
 [[-150,-8,C.green],[-90,-14,'#9BD06E'],[140,-6,C.green],[100,-14,'#9BD06E']].forEach(([lx,ly,c])=>shape(blob(lx,ly,34,14,10,.2),c,{lw:2.6,gap:4,fw:6}));
 [[-60,-6],[60,-4],[170,-2]].forEach(([fx,fy])=>shape(rrect(fx-12,fy-12,24,20,3),CREAM,{lw:2.4,solid:CREAM}));
 [[-120,4],[30,6],[150,8]].forEach(([ox,oy])=>dot(ox,oy,7,'#3A2E3E'));
 shape(blob(0,48,70,16,12,0),C.gray,{lw:3,gap:4,fw:6});
 pop()}
function sceneD(t){const lt=t-TL.D;
 shape(FULL,null,{solid:'#EFF3DA',noline:1});shape([[-30,-30],[W+30,-30],[W+30,470],[-30,470]],'#DDE9C2',{noline:1,gap:8,fw:12,flat:1,ang:-.3});
 line([[270,150],[270,210]],{lw:3,single:1});shape([[200,250],[340,250],[310,210],[230,210]],C.yellow,{lw:3.4,gap:5,fw:9});
 GA=.28;shape([[210,258],[330,258],[440,560],[100,560]],C.yellow,{noline:1,gap:9,fw:12,flat:1});GA=1;
 shape([[-30,600],[W+30,600],[W+30,H+30],[-30,H+30]],'#C98A52',{lw:4,gap:7,fw:11,ang:.1});
 for(let i=0;i<4;i++)line([[-10,680+i*80],[W+10,676+i*80]],{lw:2.2,col:'#9A6230',single:1});
 // characters relax in the bowl like a hot tub (only tops visible)
 const bob=Math.sin(lt*3)*3;
 cuke(330,700+bob,1.05,{t,age:0,mood:'happy',shades:1,cheeks:1,armL:[-70,-150],armR:[64,-120]});
 tom(200,690-bob,.82,{t,age:0,mood:'happy',cape:1,wave:lt>1.4});
 bowl(270,690,1.08,t);
 if(lt>2.6)[[60,330],[480,300],[70,560],[470,560]].forEach(([x,y],i)=>sparkle(x,y+Math.sin(t*4+i)*6,.9,t*2+i));
 bub(t,16.25,17.6,["Finally...","a SALAD!"],380,330,[350,530],{size:38,col:C.dgreen,fill:'#EBF2E2'});
 bub(t,17.7,19.8,["No veggie","left behind."],170,330,[200,560],{size:38,col:C.red});
 topBox("Thursday: Greek salad","DAYS FORGOTTEN: 0",t,16.0,C.green,NAVY);
 lowerThird('THURSDAY',' · 6:00 PM · dinner',t,16.0)}

function endCard(t){const lt=t-TL.E;
 shape(FULL,null,{solid:'#F2EAD8',noline:1});shape(blob(270,430,300,300,18,.05),'#CFE0BC',{noline:1,gap:7,fw:11,flat:1,ang:-.3});
 cuke(330,910,.95,{t,mood:'happy',shades:1,cheeks:1,armR:[62,-170+Math.sin(t*9)*10]});tom(200,910,.75,{t,mood:'happy',cape:1,arms:'up'});
 const e=back(span(lt,.1,.6));push();tr(270,210);sc(e);tr(-270,-210);txt('dinrr',270,236,190,C.dgreen,'Brush',{align:'center',stroke:NAVY,sw:12,jit:.6});line([[130,262],[200,270],[270,260],[350,271],[410,262]],{lw:8,col:C.orange,single:1,wob:1.6});pop();
 txt('No veggie left behind.',270,350,50,C.red,'Brush',{align:'center',n:(lt-.6)*30});
 if(lt>1.1){const q=back(span(lt,1.1,1.5));push();tr(270,418);sc(q);tr(-270,-418);shape(rrect(150,390,240,58,29),C.yellow,{lw:3.4,gap:4.5,fw:8});txt('@dinrr.app',270,430,34,NAVY,'Brush',{align:'center'});pop()}
 if(lt>1.6){const q=back(span(lt,1.6,2.0));push();tr(270,560);sc(q);tr(-270,-560);
  shape([[44,496],[496,492],[500,628],[40,632]],CREAM,{lw:3.4,gap:6,fw:10,solid:CREAM});
  txt('Be honest...',270,548,40,NAVY,'Brush',{align:'center'});txt("what's hiding in YOUR fridge?",270,606,40,C.red,'Brush',{align:'center'});pop()}}

// ── sound events ──
const SFX=[];const ev=(t,type,x={})=>SFX.push({t:Math.round(t*1000)/1000,type,...x});
ev(0,'honk');ev(0,'boing');ev(.05,'shiver',{d:3.1});
[1.05,1.85,2.65].forEach((tc,i)=>ev(tc,'bonk',{i:i+2}));ev(2.4,'honk');
ev(3.2,'whoosh',{dir:'in'});ev(3.3,'tada');ev(3.75,'boing');ev(4.2,'pop',{i:3});ev(4.25,'thud');ev(4.45,'boing');ev(4.9,'squish');ev(5.0,'growl');
ev(5.15,'boing');ev(5.55,'jelly');ev(5.8,'slide',{dir:'up'});ev(6.45,'thud');ev(6.5,'honk');ev(6.7,'pop',{i:5});
ev(7.45,'wah');ev(8.3,'tink',{i:4});ev(8.55,'pop',{i:6});
ev(9.2,'whoosh',{dir:'out'});ev(9.55,'whoosh',{dir:'in'});
ev(10.6,'tap');ev(12.4,'tap');ev(12.9,'tap');[13.6,14.2,14.8].forEach((tc,i)=>{ev(tc,'check');ev(tc+.05,'tink',{i})});
ev(15.4,'whoosh',{dir:'out'});ev(15.9,'whoosh',{dir:'in'});
ev(16.25,'xylo',{i:0});ev(16.3,'splash');ev(17.7,'xylo',{i:1});ev(18.6,'tada');
ev(19.7,'whoosh',{dir:'out'});ev(20.4,'logo');ev(21.0,'sparkles');ev(21.6,'chime');
window.SFX=SFX.sort((a,b)=>a.t-b.t);window.DUR=TL.DUR;window.TL=TL;

window.render=(t,tap)=>{
 SEED=Math.floor(t*8);K=0;GA=1;M=[1,0,0,1,0,0];stack=[];
 ctx.setTransform(2,0,0,2,0,0);ctx.globalAlpha=1;ctx.fillStyle=PAPER;ctx.fillRect(0,0,W,H);
 const app=document.getElementById('pw'),tp=document.getElementById('tap');let appOn=false;
 if(t<TL.C-.25)sceneA(t);else if(t<TL.D-.25){appScene(t);appOn=t>9.5&&t<15.95}else if(t<TL.E-.25)sceneD(t);else endCard(t);
 wipe(t,TL.C-.1);wipe(t,TL.D-.1,C.green);wipe(t,TL.E-.1,C.orange);
 const g=ctx.createRadialGradient(W/2,H*.45,260,W/2,H/2,760);g.addColorStop(0,'rgba(255,250,235,0)');g.addColorStop(1,'rgba(150,120,80,.2)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=.55;ctx.drawImage(grain,0,0);ctx.globalAlpha=1;
 app.style.visibility=appOn?'visible':'hidden';
 const slide=1-back(span(t,9.55,10.2)),out=ein(span(t,15.4,15.9));app.style.transform=`translateY(${(slide+out)*900}px)`;
 if(tap&&t>=tap.t-.05&&t<tap.t+.35){const k=(t-tap.t)/.35;tp.style.opacity=k<0?0:1-k;tp.style.left=tap.x+'px';tp.style.top=tap.y+'px';tp.style.transform=`scale(${.6+k*.8})`}else tp.style.opacity=0;
};
</script>
