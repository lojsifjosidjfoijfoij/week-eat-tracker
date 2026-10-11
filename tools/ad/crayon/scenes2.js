// ───────────── "Save the tomato" — full-screen story ─────────────
const mixc=(a,b,k)=>{const p=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)],A=p(a),B=p(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,'0')).join('')};
const TL={B:3.6,C:7.8,D:10.8,G:12.9,E:14.4,F:21.0,END:24.0,DUR:27.0};
const Y1=335,Y2=650,Y3=800,TOMH=240,TS=1.9;
const FULL=[[-30,-30],[W+30,-30],[W+30,H+30],[-30,H+30]];
const ageAt=t=>t<TL.B?0:t<TL.C?lerp(0,.12,span(t,TL.B,TL.C)):t<TL.D?lerp(.15,.5,span(t,TL.C,TL.D)):lerp(.6,1,span(t,TL.D,12.4));
const zoomAt=t=>t<TL.C?1:t<TL.D?lerp(1,1.26,eio(span(t,TL.C,9.2))):lerp(1.26,1.38,span(t,TL.D,12.4));
const shakeAt=t=>{let s=0;[[.3,7],[6.45,9]].forEach(([t0,a])=>{if(t>t0&&t<t0+.6)s+=Math.exp(-(t-t0)*8)*a*Math.sin((t-t0)*55)});return s};
const CAMY=620;
const toScreen=(x,y,t)=>{const z=zoomAt(t);return[270+(x-270)*z,CAMY+(y-CAMY)*z]};

// ── props (origin = bottom centre) ──
function milk(x,y,s=1){push();tr(x,y);sc(s);shape(rrect(-26,-84,52,84,4),C.white,{lw:3.2,flat:1,solid:CREAM});shape([[-26,-84],[-22,-104],[22,-104],[26,-84]],C.white,{lw:3.2,flat:1,solid:CREAM});shape(rrect(-26,-62,52,26,2),C.blue,{lw:2.4,gap:4,fw:7});txt('MILK',0,-43,17,CREAM,'Brush',{align:'center'});pop()}
function cheese(x,y,s=1){push();tr(x,y);sc(s);shape([[-46,0],[46,0],[46,-36],[-46,-8]],C.yellow,{lw:3.2,gap:4.5,fw:8});dot(-16,-12,5);dot(14,-14,6);dot(32,-8,3.5);pop()}
function jar(x,y,s=1){push();tr(x,y);sc(s);shape(rrect(-26,-76,52,76,12),C.green,{lw:3.2,gap:5,fw:8});shape(rrect(-28,-92,56,18,4),C.gray,{lw:3,gap:4,fw:6});for(let i=0;i<3;i++)shape(blob(-10+i*10,-40-(i%2)*12,6,12,8,0),C.dgreen,{lw:2,flat:1});pop()}
function eggs(x,y,s=1){push();tr(x,y);sc(s);shape(rrect(-60,-20,120,20,4),C.gray,{lw:3,gap:4,fw:6});for(let i=0;i<5;i++)shape(blob(-44+i*22,-32,10,14,8,0),CREAM,{lw:2.6,flat:1});pop()}
function lemon(x,y,s=1){push();tr(x,y);sc(s);shape(blob(0,-20,30,20,12,.03),C.yellow,{lw:3,gap:4,fw:7});line([[26,-22],[34,-26]],{lw:3,single:1});pop()}
function bag(x,y,s=1,crush=0){push();tr(x,y);sc(s);shape([[-62,0],[-70,-120],[-40,-150+crush],[-20,-136],[0,-152+crush],[22,-138],[44,-150+crush],[70,-120],[62,0]],C.brown,{lw:3.6,gap:5,fw:8,ang:.3});
 for(let i=0;i<3;i++)line([[-28+i*28,-100],[-24+i*28,-50]],{lw:2.4,col:C.dbrown,single:1});txt('GROCERIES',0,-18,20,CREAM,'Brush',{align:'center'});pop()}
function pizzaBox(x,y,s=1){push();tr(x,y);sc(s);shape(rrect(-120,-34,240,34,5),'#D7A86E',{lw:3.6,gap:5,fw:8});shape(rrect(-124,-52,248,20,5),'#E7C089',{lw:3.4,gap:5,fw:8});shape([[-24,-30],[24,-30],[0,-3]],C.yellow,{lw:2.4,flat:1});dot(-8,-24,3,C.red);dot(7,-22,3,C.red);txt('PIZZA',64,-10,26,C.red,'Brush',{align:'center'});pop()}
function fly(x,y,t){push();tr(x,y);const w=Math.sin(t*90)*5;shape(blob(-5,-7,9,4+Math.abs(w)*.3,8,0),null,{solid:CREAM,lw:2});shape(blob(5,-7,9,4+Math.abs(w)*.3,8,0),null,{solid:CREAM,lw:2});shape(blob(0,0,6,5,8,0),NAVY,{lw:2,flat:1,gap:3,fw:6});pop()}
function hand(x,y,s,rotv,o={}){push();tr(x,y);rot(rotv||0);sc(s);const c=o.curl||0,sk=o.skin||C.peach;
 shape(rrect(-44,-560,88,520,6),o.sleeve||C.blue,{lw:3.6,gap:5,fw:9,ang:.5});shape(rrect(-48,-62,96,26,8),mixc(o.sleeve||C.blue,'#FFFFFF',.35),{lw:3.2,gap:4,fw:7});
 if(o.fork){limb([0,30],[0,150],6,C.gray);[-10,0,10].forEach(q=>limb([q,140],[q,176],3,C.gray))}
 [-24,-8,8,24].forEach((fx,i)=>limb([fx,24],[fx*1.05,24+(i==1||i==2?58:50)*(1-.6*c)],15,sk));
 shape(blob(0,2,38,44,14,.03),sk,{lw:3.4,gap:5,fw:8});limb([-30,6],[-52,26+c*14],15,sk);
 pop()}
function bubbleS(lines,x,y,t0,t,tail,o={}){bubble(lines,x,y,t-t0,tail,o)}

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

// ── backgrounds ──
function fridgeBg(t){
 shape(FULL,'#FFEBA8',{noline:1,gap:8,fw:12,flat:1,ang:-.5});
 [Y1,Y2,Y3].forEach(y=>{shape(rrect(-30,y,W+60,18,5),C.lblue,{lw:3.4,gap:4.5,fw:8,flat:1});line([[-30,y+26],[W+30,y+26]],{lw:2,single:1,col:'#9DB5C9'})});
 push();tr(270,24);shape(blob(0,0,24,24,12,0),CREAM,{lw:3.2,gap:4,fw:7});for(let i=0;i<8;i++){const a=i/8*6.28;line([[Math.cos(a)*32,Math.sin(a)*32+6],[Math.cos(a)*44,Math.sin(a)*44+6]],{lw:3,col:C.orange,single:1})}pop();
 // crisper drawer
 shape(rrect(24,Y3+40,W-48,150,18),C.green,{lw:3.6,gap:6,fw:9,ang:.3});
 push();tr(120,Y3+40);shape(blob(0,-10,38,26,10,.1),C.dgreen,{lw:3,gap:4,fw:7});pop();
 push();tr(400,Y3+40);shape([[-8,-6],[8,-6],[0,-46]],C.orange,{lw:3,gap:4,fw:7});pop();
 // doodles on the top shelf
 if(t<4.7||t>5.7)milk(70,Y1,1.25);else if(t<5.1)milk(70,Y1-(t-4.6)*0,1.25);
 cheese(468,Y1,1.1);eggs(270,Y1,1);
 jar(62,Y2,1.1);lemon(480,Y2-0,1)}

// ── day tag + hook ──
function tag(text,t,t0){const k=back((t-t0)/.3);if(k<=0)return;push();tr(270,102);sc(k);tr(-270,-102);
 shape([[130,58],[410,52],[418,116],[126,122]],C.yellow,{lw:3.4,gap:6,fw:11,ang:-.05});txt(text,270,106,60,NAVY,'Brush',{align:'center'});pop()}
function hook(t){const hk=clamp(1-(t-1.7)/.3);if(hk<=0)return;GA=hk;push();tr(0,-(1-hk)*50);
 shape([[30,46],[510,40],[516,100],[34,106]],C.yellow,{noline:1,gap:7,lw:13,ang:-.05,flat:1});txt('This tomato has',270,86,44,NAVY,'Brush',{align:'center'});
 shape([[50,112],[490,108],[496,170],[48,174]],C.yellow,{noline:1,gap:7,lw:13,ang:.05,flat:1});txt('5 days to live.',270,155,48,C.red,'Brush',{align:'center',stroke:NAVY,sw:0});pop();GA=1}

function wipe(t,tc,col=C.orange){const p=span(t,tc-.3,tc),q=span(t,tc,tc+.3);if(p<=0||q>=1)return;const a=q*(W+120)-60,b=p*(W+120)-60;
 shape([[a-20,-30],[b+10,-30],[b-10,H+30],[a-30,H+30]],col,{noline:1,gap:9,lw:16,ang:.6,flat:1})}

// ── scenes ──
function fridgeScenes(t){
 const z=zoomAt(t),sh=shakeAt(t);
 push();tr(270+sh*.4,CAMY+sh);sc(z);tr(-270,-CAMY);
 fridgeBg(t);
 // bag (Sunday)
 const bagY=t<.3?lerp(-300,Y2,ein(span(t,0,.3))):Y2;
 if(t<TL.B+1.6)bag(135,bagY,1,t>.3&&t<.7?-12*Math.sin((t-.55)*9):0);
 // Tom
 const roll=eout(span(t,.3,.95)),age=ageAt(t);
 let tx=lerp(150,270,roll),ty=Y2,rv=-(1-roll)*6.28*1.5,sq=1;
 if(t>.95&&t<1.5){const k=(t-.95)/.55;sq=1+.14*Math.sin(k*3.14*2)*(1-k);ty=Y2-Math.abs(Math.sin(k*3.14))*30*(1-k)}
 if(t>TL.B+2.7&&t<TL.C){const k=span(t,6.3,6.6);tx=270-26*k;rv=.1*k}
 if(t>=TL.C){tx=244;rv=.1}
 if(t>=TL.D)rv=.1+(span(t,TL.D,12.4)*.06);
 let grab=0;if(t>12.2){grab=eio(span(t,12.35,12.9));ty=Y2-grab*900}
 let mood='happy',lk=[0,0];
 if(t>1.0)lk=[0,-1];
 if(t>=TL.B&&t<5.5){mood='worried';lk=[Math.sin(t*3)*.6,-1]}
 if(t>=5.3&&t<6.4){mood='happy';lk=[1,-.2]}
 if(t>=6.4&&t<TL.C){mood='shock'}
 if(t>=7.0&&t<TL.C)mood='sad';
 if(t>=TL.C&&t<10.0){mood='worried'}
 if(t>=10.0&&t<TL.D)mood='flat';
 if(t>=TL.D){mood='sad'}
 if(t>=12.2)mood='shock';
 if(t>=.3&&t<1.0)mood='open';
 const wob=t>1.9&&t<TL.B?Math.sin(t*6)*.02:0;
 if(t>=.3)tom(tx,ty,TS,{age,t,rotv:rv+wob,sq,mood,look:lk,wave:t>2.2&&t<3.4,sweat:(t>TL.C&&t<TL.D)||(t>TL.D&&t<12.2)});
 // pizza box arrives
 if(t>=6.1){const k=ein(span(t,6.1,6.45));pizzaBox(410,lerp(-200,Y2,k),1.15)}
 // fly
 if(t>=TL.C+.3&&t<12.4){const k=(t-TL.C)*3;fly(270+Math.cos(k)*150+Math.sin(k*2.3)*30,Y2-260+Math.sin(k*1.7)*70+Math.sin(k*3)*20,t)}
 // hands
 const hand1=(()=>{ // grabs milk Monday
  if(t<4.0||t>5.5)return null;const k=t<4.55?eio(span(t,4.0,4.55)):1-eio(span(t,4.75,5.45));const hasMilk=t>4.6&&t<5.4;
  return{x:lerp(70,70+(t>4.6?0:0),0),y:lerp(-60,Y1-92,k),milk:hasMilk}})();
 if(hand1){const hy=hand1.y;if(hand1.milk)milk(70,hy+160,1.25);hand(70,hy,1.1,0,{curl:hand1.milk?.9:0,sleeve:C.blue})}
 if(t>=5.5&&t<6.5){const k=t<6.1?eio(span(t,5.55,6.1)):1;const hy=lerp(-120,Y2-300,k);hand(410,hy,1.1,0,{curl:1,sleeve:C.red});}
 if(t>=12.0&&t<13){const k=eio(span(t,12.0,12.4));const hy=lerp(-100,Y2-TOMH,k)-(grab*900);hand(tx,hy,1.35,0,{curl:k>.9?1:0,sleeve:C.blue})}
 pop();
 // speech (screen space)
 const sp=(x,y)=>toScreen(x,y,t);
 if(t>1.7&&t<3.55){const p=sp(270,Y2-TOMH);bubble(["I'm gonna be","LASAGNA!"],300,250,t-1.7,[p[0],p[1]],{col:C.red,size:32})}
 if(t>4.0&&t<5.4)bubble(["leftovers?"],110,520,t-4.05,[-30,570],{size:28,col:C.dgray});
 if(t>5.5&&t<7.7)bubble(["pizza?"],110,470,t-5.55,[-30,520],{size:28,col:C.dgray});
 if(t>5.95&&t<7.7)bubble(["pizza!"],130,600,t-6,[-30,650],{size:28,col:C.dgray});
 if(t>6.6&&t<TL.C+.3){const p=sp(tx,Y2-TOMH+30);bubble(["…wait, me?"],200,300,t-6.6,[p[0],p[1]],{size:30,col:C.red})}
 if(t>8.4&&t<9.9){const p=sp(tx,Y2-TOMH+30);bubble(["I'm fine."],250,230,t-8.4,[p[0],p[1]],{size:34,col:C.dgreen})}
 if(t>10.0&&t<TL.D+.2){const p=sp(tx,Y2-TOMH+30);bubble(["…I'm fine."],250,240,t-10,[p[0],p[1]],{size:30,col:C.dgray})}
 if(t>11.0&&t<12.3){const p=sp(tx,Y2-TOMH+30);bubble(["Tell my lasagna…"],260,260,t-11,[p[0],p[1]],{size:32})}
 if(t>11.8&&t<12.3){const p=sp(tx,Y2-TOMH+30);bubble(["…I tried."],360,360,t-11.8,[p[0],p[1]],{size:32,col:C.red})}
 // tags
 hook(t);
 if(t>=1.9&&t<TL.B+.1)tag('SUNDAY',t,1.9);
 if(t>=TL.B+.1&&t<5.3)tag('MONDAY',t,TL.B+.1);
 if(t>=5.3&&t<TL.C)tag('TUESDAY',t,5.3);
 if(t>=TL.C&&t<TL.D)tag('WEDNESDAY',t,TL.C);
 if(t>=TL.D&&t<TL.G+1.6)tag('FRIDAY',t,TL.D)}

function graveyard(t){
 const lt=t-TL.G;
 shape(FULL,'#B9C6DA',{noline:1,gap:8,fw:12,flat:1,ang:.4});
 // hill
 shape([[-30,560],[120,520],[300,540],[470,500],[W+30,530],[W+30,H+30],[-30,H+30]],'#6E9A55',{lw:4,gap:6,fw:10,ang:-.3});
 // stone
 push();tr(270,720);shape([[-110,0],[-110,-250],[-90,-310],[-40,-340],[40,-340],[90,-310],[110,-250],[110,0]],C.gray,{lw:4.5,gap:6,fw:10,ang:.3});
 txt('RIP',0,-250,40,C.dgray,'Brush',{align:'center'});txt('TOM',0,-190,76,NAVY,'Brush',{align:'center'});txt('Sun – Fri',0,-140,28,NAVY,'Pat',{align:'center'});
 txt('wanted to be',0,-92,26,C.dgray,'Pat',{align:'center'});txt('lasagna',0,-60,34,C.red,'Brush',{align:'center'});pop();
 shape(blob(270,742,140,28,12,.06),'#5B8A45',{lw:3.6,gap:5,fw:9});
 push();tr(380,740);limb([0,0],[2,-60],5,C.dgreen);shape(blob(2,-66,14,14,8,0),C.pink,{lw:3,gap:4,fw:6});pop();
 push();tr(160,744);limb([0,0],[-3,-48],5,C.dgreen);shape(blob(-3,-54,12,12,8,0),C.yellow,{lw:3,gap:4,fw:6});pop();
 push();tr(300,760);shape([[-22,0],[-8,-10],[8,-6],[22,2],[0,8]],'#8A6A3A',{lw:2.6,gap:4,fw:6});pop();
 // rain cloud
 push();tr(270,300+Math.sin(lt*3)*4);{const cp=[];for(let i=0;i<40;i++){const a=i/40*6.283,r=1+.2*Math.abs(Math.sin(a*3.5));cp.push([Math.cos(a)*150*r,Math.sin(a)*60*r])}shape(cp,'#8D9BB3',{lw:4,gap:5,fw:9,step:12})}pop();
 for(let i=0;i<14;i++){const k=((lt*1.6)+i*.37)%1,x=150+(i*29)%240;line([[x,360+k*340],[x-4,378+k*340]],{lw:3.4,col:C.blue,single:1})}}

function appScene(t){
 const lt=t-TL.E;
 shape(FULL,null,{solid:'#F6F0DF',noline:1});
 shape(blob(270,490,320,330,18,.05),'#CFE0BC',{noline:1,gap:7,fw:11,flat:1,ang:-.3});
 // little tomatoes round the edges
 [[60,190,.5],[480,230,.45],[56,820,.5],[490,800,.55],[40,500,.4]].forEach(([x,y,s],i)=>tom(x,y+Math.sin(t*3+i)*4,s,{t,age:0,mood:'happy',nocheek:1,rotv:Math.sin(t*2+i)*.15}));
 const slide=1-back(span(t,14.85,15.5)),out=ein(span(t,20.45,21.0)),oy=slide*900+out*900;
 push();tr(0,oy);
 shape(rrect(95-14,102-14,350+28,757+28,42),C.dgray,{lw:4,gap:5,fw:9,col2:C.gray});
 shape(rrect(95,102,350,757,28),null,{solid:'#FDFCFA',lw:2});pop();
 // caption texts
 const sets=[[14.5,16.5,'Next Sunday…'],[16.5,18.3,'plan the week'],[18.3,21.0,'shop once']];
 sets.forEach(([a,b,s])=>{if(t>=a&&t<b){const k=back((t-a)/.3);push();tr(270,64);sc(k);tr(-270,-64);shape([[110,22],[430,18],[436,80],[106,84]],C.yellow,{lw:3.2,gap:6,fw:11,ang:-.05});txt(s,270,68,50,NAVY,'Brush',{align:'center'});pop()}})}

function dinner(t){
 const lt=t-TL.F;
 shape(FULL,null,{solid:'#EFF3DA',noline:1});shape([[-30,-30],[W+30,-30],[W+30,470],[-30,470]],'#DDE9C2',{noline:1,gap:8,fw:12,flat:1,ang:-.3});
 // lamp
 line([[270,-20],[270,70]],{lw:3,single:1});shape([[200,70],[340,70],[310,30],[230,30]].map(p=>[p[0],p[1]+10]),C.yellow,{lw:3.4,gap:5,fw:9});
 GA=.3;shape([[210,80],[330,80],[430,470],[110,470]],C.yellow,{noline:1,gap:9,fw:12,flat:1});GA=1;
 // table
 shape([[-30,480],[W+30,480],[W+30,H+30],[-30,H+30]],'#C98A52',{lw:4,gap:7,fw:11,ang:.1});
 for(let i=0;i<5;i++)line([[-10,560+i*90],[W+10,556+i*90]],{lw:2.2,col:'#9A6230',single:1});
 // dish
 push();tr(270,740);sc(1.2);shape(rrect(-170,-70,340,120,16),C.gray,{lw:4,gap:5,fw:9});
 shape(rrect(-156,-86,312,58,10),C.red,{lw:3.6,gap:4.5,fw:8});for(let i=0;i<9;i++)line([[-146+i*36,-84],[-130+i*36,-60],[-114+i*36,-84]],{lw:6,col:C.yellow,single:1});
 shape(rrect(-156,-30,312,18,4),C.orange,{lw:3,gap:4,fw:7});pop();
 // steam
 for(let i=0;i<4;i++){const k=((lt*.7)+i*.25)%1;GA=1-k;line([[170+i*60-0,570-k*120],[160+i*60+Math.sin(k*8)*12,540-k*120],[176+i*60,510-k*120]],{lw:4,col:'#FFFDF6',single:1,wob:1.4});GA=1}
 // Tina the tomato in a cape
 const cheer=lt>.9;tom(270,670,1.1,{t,age:0,mood:'happy',cape:1,arms:cheer?'up':'',nocheek:0,rotv:Math.sin(lt*5)*.04});
 // family hands with forks
 const fork=(side)=>{const k=eio(span(lt,.5,1.2)),m=Math.sin(Math.max(0,lt-1.4)*6)*.12;const base=side<0?-130:670;
  hand(lerp(side<0?-160:700,side<0?96:444,k),700+(side<0?0:20)+m*40,1.15,side<0?-1.45:1.45,{curl:.8,fork:1,sleeve:side<0?C.blue:C.green,skin:side<0?C.peach:'#C98B5E'})};
 if(lt>.4){fork(-1);fork(1)}
 // hearts
 if(lt>1.4)for(let i=0;i<8;i++){const k=((lt-1.4)*.6+i*.14)%1;GA=1-k;push();tr(90+i*52+Math.sin(k*6+i)*14,520-k*300);sc(.6+.4*(1-k));shape([[0,8],[-14,-4],[-12,-14],[0,-8],[12,-14],[14,-4]],C.red,{lw:2.8,gap:4,fw:7});pop();GA=1}
 // bubbles
 bubble(["Mission","accomplished."],150,330,lt-.9,[262,540],{size:30,col:C.dgreen,fill:'#EBF2E2'});
 bubble(["so good!"],95,560,lt-1.5,[100,640],{size:30});
 bubble(["seconds?"],455,560,lt-1.9,[430,650],{size:30});
 if(t<TL.END+.1)tag('TUESDAY',t,TL.F+.2)}

function endCard(t){
 const lt=t-TL.END;
 shape(FULL,null,{solid:'#F2EAD8',noline:1});
 shape(blob(270,420,300,300,18,.05),'#CFE0BC',{noline:1,gap:7,fw:11,flat:1,ang:-.3});
 tom(270,850,1.35,{t,age:0,mood:'happy',cape:1,arms:'up',rotv:Math.sin(lt*5)*.05});
 const e=back(span(lt,.1,.6));push();tr(270,210);sc(e);tr(-270,-210);
 txt('dinrr',270,236,190,C.dgreen,'Brush',{align:'center',stroke:NAVY,sw:12,jit:.6});line([[130,262],[200,270],[270,260],[350,271],[410,262]],{lw:8,col:C.orange,single:1,wob:1.6});pop();
 txt('Save the tomato.',270,350,52,NAVY,'Brush',{align:'center',n:(lt-.6)*28});
 txt('Plan your week · free',270,404,30,C.dgray,'Pat',{align:'center',n:(lt-1.2)*50});
 if(lt>1.8){const q=back(span(lt,1.8,2.2));push();tr(270,470);sc(q);tr(-270,-470);shape(rrect(150,442,240,58,29),C.yellow,{lw:3.4,gap:4.5,fw:8});txt('@dinrr.app',270,482,34,NAVY,'Brush',{align:'center'});pop()}}

// ── sound events ──
const SFX=[];const ev=(t,type,x={})=>SFX.push({t:Math.round(t*1000)/1000,type,...x});
ev(.3,'thud');ev(.4,'boing');ev(1.0,'pop',{i:3});ev(1.75,'pop',{i:5});ev(2.2,'pop',{i:7});
ev(4.0,'whoosh',{dir:'in'});ev(4.55,'pop',{i:1});ev(5.35,'whoosh',{dir:'out'});ev(5.6,'pop',{i:2});ev(6.0,'pop',{i:4});ev(5.9,'doorbell');ev(6.45,'thud');ev(6.5,'gasp');ev(7.0,'sad');
ev(7.9,'fly',{d:4.4});ev(8.45,'pop',{i:0});ev(9.2,'drip');ev(10.1,'drip');ev(10.2,'sad',{soft:1});
ev(11.0,'pop',{i:0});ev(11.8,'pop',{i:0});ev(12.3,'whoosh',{dir:'in'});ev(12.5,'gasp');ev(12.85,'whoosh',{dir:'out'});ev(12.95,'sting');ev(13.2,'wah');for(let k=0;k<6;k++)ev(13.0+k*.25,'drip');
ev(14.1,'whoosh',{dir:'out'});ev(14.9,'whoosh',{dir:'in'});
for(let i=0;i<7;i++)ev(15.6+i*.34,'mpop',{i});
ev(18.2,'tap');ev(18.5,'tick',{i:0});ev(19.0,'tick',{i:3});ev(19.4,'tick',{i:6});ev(19.95,'check');ev(20.3,'check');
ev(20.45,'whoosh',{dir:'out'});ev(20.7,'whoosh',{dir:'out'});
ev(21.7,'pop',{i:5});ev(21.9,'tada');ev(22.6,'pop',{i:6});ev(23.0,'pop',{i:7});ev(23.4,'cheer');
ev(23.7,'whoosh',{dir:'out'});ev(24.2,'logo');ev(24.7,'sparkles');
window.SFX=SFX.sort((a,b)=>a.t-b.t);window.DUR=TL.DUR;window.TL=TL;

window.render=(t,tap)=>{
 SEED=Math.floor(t*8);K=0;GA=1;M=[1,0,0,1,0,0];stack=[];
 ctx.setTransform(2,0,0,2,0,0);ctx.globalAlpha=1;
 ctx.fillStyle=PAPER;ctx.fillRect(0,0,W,H);
 const app=document.getElementById('pw'),tp=document.getElementById('tap');
 let appOn=false;
 if(t<TL.G)fridgeScenes(t);
 else if(t<TL.E-.25)graveyard(t);
 else if(t<TL.F-.25){appScene(t);appOn=t>14.8&&t<21.05}
 else if(t<TL.END)dinner(t);
 else endCard(t);
 wipe(t,TL.E-.1);wipe(t,TL.F-.1,C.green);wipe(t,TL.END-.1,C.orange);
 // vignette
 const g=ctx.createRadialGradient(W/2,H*.45,260,W/2,H/2,760);g.addColorStop(0,'rgba(255,250,235,0)');g.addColorStop(1,'rgba(150,120,80,.2)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=.55;ctx.drawImage(grain,0,0);ctx.globalAlpha=1;
 app.style.visibility=appOn?'visible':'hidden';
 const slide=1-back(span(t,14.85,15.5)),out=ein(span(t,20.45,21.0));app.style.transform=`translateY(${(slide+out)*900}px)`;
 if(tap&&t>=tap.t-.05&&t<tap.t+.35){const k=(t-tap.t)/.35;tp.style.opacity=k<0?0:1-k;tp.style.left=tap.x+'px';tp.style.top=tap.y+'px';tp.style.transform=`scale(${.6+k*.8})`}else tp.style.opacity=0;
};
</script>
