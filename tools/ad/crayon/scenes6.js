// ───────────── #6 "Dinner at 5:47 PM" — every fridge check there is less, until only the light is left ─────────────
const TL={C:9.5,D:15.9,E:20.0,DUR:23.2};
const FULL=[[-30,-30],[W+30,-30],[W+30,H+30],[-30,H+30]];
const FY=880,FX=335,FS=.9;
const BODY='#E2EDF1',DOOR='#EEF5F7';
// ── fridge contents (local fridge coords, origin = bottom centre) ──
const ITEM={
 mustard:(x,y)=>{push();tr(x,y);shape([[-9,0],[-9,-34],[-4,-40],[-3,-50],[3,-50],[4,-40],[9,-34],[9,0]],C.yellow,{lw:2.6,gap:3.5,fw:5});shape(rrect(-4,-58,8,9,2),C.red,{lw:2,flat:1,gap:3,fw:4});pop()},
 egg:(x,y)=>{push();tr(x,y);shape(blob(0,-11,8,11,10,0),C.ivory,{lw:2.4,gap:3,fw:4,flat:1});pop()},
 lemon:(x,y)=>{push();tr(x,y);shape([[-15,0],[-14,-9],[-6,-15],[6,-15],[14,-9],[15,0]],C.yellow,{lw:2.4,gap:3.5,fw:5});line([[-10,-3],[10,-3]],{lw:2,single:1,col:C.orange});pop()},
 jar:(x,y)=>{push();tr(x,y);shape(rrect(-13,-32,26,32,5),'#CFE3B0',{lw:2.6,gap:3.5,fw:5,flat:1});shape(rrect(-14,-38,28,8,3),C.dgray,{lw:2.2,gap:3,fw:4,flat:1});shape(blob(-3,-14,4,10,8,0),C.green,{lw:1.8,flat:1,gap:3,fw:4});pop()},
 tortilla:(x,y)=>{push();tr(x,y);[0,1,2].forEach(i=>shape(blob(0,-6-i*7,26,6,12,0),C.ivory,{lw:2.4,gap:3,fw:4,flat:1}));shape(rrect(-8,-26,16,8,3),C.orange,{lw:1.8,flat:1,gap:3,fw:4});pop()},
 cheese:(x,y)=>{push();tr(x,y);shape([[-18,0],[18,0],[18,-14],[-18,-26]],C.yellow,{lw:2.6,gap:4,fw:5});dot(-6,-12,2.4,C.orange);dot(8,-7,2,C.orange);pop()},
 avocado:(x,y)=>{push();tr(x,y);shape(blob(0,-15,11,15,12,.04),C.dgreen,{lw:2.4,gap:3.5,fw:5});shape(blob(0,-12,6,8,10,0),'#D7E8A0',{lw:1.6,flat:1,gap:3,fw:4});dot(0,-10,2.6,C.dbrown);pop()},
 tomato:(x,y)=>{push();tr(x,y);shape(blob(0,-10,11,10,12,.04),C.red,{lw:2.4,gap:3.5,fw:5});line([[-5,-21],[0,-18],[5,-21]],{lw:2.4,single:1,col:C.dgreen});pop()},
 salsa:(x,y)=>{push();tr(x,y);shape(rrect(-12,-30,24,30,5),C.red,{lw:2.6,gap:3.5,fw:5});shape(rrect(-13,-36,26,7,3),C.dgray,{lw:2.2,gap:3,fw:4,flat:1});pop()},
 lettuce:(x,y)=>{push();tr(x,y);shape(blob(0,-14,22,14,12,.18),C.green,{lw:2.6,gap:3.5,fw:5});line([[0,-2],[0,-22]],{lw:2,single:1,col:C.dgreen});pop()},
 milk:(x,y)=>{push();tr(x,y);shape([[-13,0],[-13,-36],[-8,-46],[8,-46],[13,-36],[13,0]],CREAM,{lw:2.6,gap:4,fw:5,solid:CREAM,flat:1});shape(rrect(-13,-26,26,12,2),C.blue,{lw:2,gap:3.5,fw:5,flat:1});pop()},
};
// ── the fridge (the interviewee) ──
function fridge(x,y,s,o={}){const t=o.t||0,op=o.open||0,f=o.face||{},sh=o.shake?Math.sin(t*60)*3*o.shake:0;push();tr(x+sh,y);sc(s);rot(o.tilt||0);
 shape(rrect(-96,-8,26,14,4),C.dgray,{lw:2.6,gap:3.5,fw:5});shape(rrect(70,-8,26,14,4),C.dgray,{lw:2.6,gap:3.5,fw:5});
 shape(rrect(-110,-580,220,574,24),BODY,{lw:4.2,gap:6,fw:10,ang:.25,col2:'#FFFFFF'});
 line([[-106,-440],[106,-440]],{lw:3.4});
 shape(rrect(-98,-560,12,64,6),C.gray,{lw:2.6,gap:3.5,fw:5});
 if(op>.02){const lit=!o.broken;
  shape(rrect(-102,-432,204,424,10),null,{solid:lit?'#FFF3C4':'#4E5870',lw:3});
  if(lit){GA=.55;shape(blob(55,-392,70,46,12,.1),null,{solid:'#FFFCEB',noline:1});GA=1}
  [-320,-210,-100].forEach(yy=>line([[-100,yy],[100,yy]],{lw:3,col:lit?'#B8AE95':'#2E3446',single:1}));
  (o.items||[]).forEach(([k,ix,iy])=>ITEM[k](ix,iy));
  if(o.broken){[[62,-414,.3],[76,-410,-.5],[70,-404,1.2]].forEach(([bx,by,r])=>{push();tr(bx,by);rot(r);shape([[-4,0],[0,-7],[4,0]],C.gray,{lw:1.8,flat:1,gap:3,fw:4});pop()})}
  else shape(blob(70,-414,9,7,8,0),C.yellow,{lw:2.2,gap:3,fw:4});
  if(lit&&o.cold){for(let i=0;i<3;i++){const k=((t*1.3)+i/3)%1;GA=(1-k)*.9;line([[-118-k*60,-330+i*90],[-128-k*60,-322+i*90],[-138-k*60,-330+i*90],[-148-k*60,-322+i*90]],{lw:3,col:'#7FB7DA',single:1});GA=1}}}
 const a=op*1.95,xe=110-220*Math.cos(a),pe=Math.sin(a)*30;
 if(op>.02)shape([[110,-432],[xe,-432-pe],[xe,-6+pe*.5],[110,-6]],DOOR,{lw:3.8,gap:6,fw:10,ang:.25,col2:'#FFFFFF'});
 if(Math.cos(a)>-.15){const hx=lerp(110,xe,.9);shape(rrect(hx-6,-292,12,92,6),C.gray,{lw:2.6,gap:3.5,fw:5})}
 // face on the freezer door
 const ey=-514,blink=(t%2.6)>2.48&&!f.eye;
 if(f.shades){[-34,34].forEach(q=>shape(rrect(q-24,ey-14,48,26,10),'#2E3446',{lw:2.6,gap:3,fw:5}));line([[-10,ey-6],[10,ey-6]],{lw:3,single:1});line([[-20,ey-6],[-14,ey-10]],{lw:2,col:'#FFFFFF',single:1});line([[48,ey-6],[54,ey-10]],{lw:2,col:'#FFFFFF',single:1})}
 else if(f.eye==='spiral'){[-34,34].forEach(q=>{const pts=[];for(let i=0;i<=26;i++){const an=i*.55+t*10,r=i*.5;pts.push([q+Math.cos(an)*r,ey+Math.sin(an)*r])}line(pts,{lw:2.4,single:1,step:4})})}
 else if(f.eye==='tired'){[-34,34].forEach(q=>{dot(q*FS*0+q,ey+4,5.5);line([[q-12,ey-1],[q+12,ey-1]],{lw:3.6,single:1})})}
 else if(blink){[-34,34].forEach(q=>line([[q-8,ey+2],[q+8,ey+2]],{lw:3,single:1}))}
 else{const tw_=f.twitch?Math.sin(t*55)*2*f.twitch:0;[-34,34].forEach(q=>dot(q+tw_,ey+tw_*.5,6))}
 if(f.brows==='angry'){line([[-48,ey-22],[-22,ey-14]],{lw:3.4,single:1});line([[48,ey-22],[22,ey-14]],{lw:3.4,single:1})}
 else if(f.brows==='sad'){line([[-48,ey-14],[-22,ey-22]],{lw:3.4,single:1});line([[48,ey-14],[22,ey-22]],{lw:3.4,single:1})}
 if(f.cheeks)[-1,1].forEach(q=>dot(q*62,ey+30,7,'rgba(238,127,160,.55)'));
 const my=-472,m=f.mouth||'flat';
 if(m==='smile')line([[-18,my-4],[0,my+6],[18,my-4]],{lw:3.2,single:1});
 else if(m==='flat')line([[-14,my],[14,my]],{lw:3.2,single:1});
 else if(m==='sad')line([[-16,my+5],[0,my-4],[16,my+5]],{lw:3.2,single:1});
 else if(m==='grit'){shape(rrect(-20,my-8,40,16,5),CREAM,{lw:2.6,flat:1,solid:CREAM});for(let i=-1;i<=1;i++)line([[i*10,my-8],[i*10,my+8]],{lw:2,single:1})}
 else if(m==='wavy')line([[-20,my],[-10,my-6],[0,my+2],[10,my-6],[20,my]],{lw:3.2,single:1});
 else{const k=m==='talk'?.35+.65*Math.abs(Math.sin(t*13)):1;shape(blob(0,my,11,10*k+2,10,0),C.red,{lw:2.6,gap:3,fw:4})}
 if(f.sweat){sweat(96,-566,t);sweat(-92,-470,t+.4)}
 if(f.tears)[-34,34].forEach((q,i)=>{const k=((t*1.4)+i*.5)%1;push();tr(q+(q>0?6:-6),ey+12+k*40);shape([[0,-9],[5,0],[0,5],[-5,0]],C.lblue,{lw:2.2,gap:3,fw:4});pop()});
 pop()}
const fW=(lx,ly)=>[FX+lx*FS,FY+ly*FS];                         // fridge local -> world
const handleAt=op=>{const a=op*1.95,xe=110-220*Math.cos(a);return fW(lerp(110,xe,.9),-246)};

// ── people (own characters, no faces beyond dots) ──
function reach(x,s,target,max=62){const sx=15,sy=-76;let lx=(target[0]-x)/s,ly=(target[1]-FY)/s,dx=lx-sx,dy=ly-sy;const d=Math.hypot(dx,dy);if(d>max){dx*=max/d;dy*=max/d}return[sx+dx,sy+dy]}
const PPL={
 dad:{s:1.9,o:{cloth:C.orange,hat:'cap',hatc:C.blue,hair:C.dbrown,stache:1,ph:1.3}},
 mom:{s:1.85,o:{cloth:C.dgreen,hair:C.brown,ph:.4},pony:1},
 kid:{s:1.45,o:{kid:1,cloth:C.blue,stripes:1,hair:C.dbrown,ph:2}},
};
function who(k,x,t,o={}){const P_=PPL[k];
 if(P_.pony){push();tr(x-24*P_.s,FY-104*P_.s);shape([[0,-12],[-12,-4],[-16,16],[-10,34],[-4,20],[4,4]],C.brown,{lw:2.8,gap:4,fw:6});pop()}
 person(x,FY,P_.s,{t,look:3,...P_.o,...o})}

function lowerThird(s1,s2,t,t0=0){const k=eout(span(t,t0,t0+.35));if(k<=0)return;push();tr(lerp(-380,0,k),0);
 const w=tw(s1,34,'Brush')+tw(s2,26,'Pat')+44;shape(rrect(14,896,w,50,8),C.yellow,{lw:3.2,gap:5,fw:9,ang:-.05});
 txt(s1,30,932,34,NAVY,'Brush');txt(s2,34+tw(s1,34,'Brush'),931,26,NAVY,'Pat');pop()}
function kitchen(){shape(FULL,null,{solid:'#F9E6C8',noline:1});
 for(let r=0;r<4;r++)for(let c=0;c<7;c++){if((r+c)%2)continue;shape(rrect(-10+c*84,170+r*84,80,80,6),'#F3D6AE',{noline:1,gap:8,fw:12,flat:1,ang:.3})}
 shape([[-30,FY-4],[W+30,FY-8],[W+30,H+30],[-30,H+30]],'#CFD9C2',{lw:4,gap:7,fw:11,ang:.1});
 push();tr(470,240);shape(rrect(-40,-48,80,96,8),C.lblue,{lw:3.2,gap:5,fw:8});line([[0,-48],[0,48]],{lw:3,single:1});line([[-40,0],[40,0]],{lw:3,single:1});pop()}

function bub(t,t0,t1,lines,x,y,tail,o={}){if(t<t0||t>t1)return;const ex=span(t,t1-.14,t1);if(ex>0){GA=1-ex;push();tr(x,y);sc(1-ex*.3);tr(-x,-y);bubble(lines,x,y,t-t0,tail,o);pop();GA=1}else bubble(lines,x,y,t-t0,tail,o)}

['mustard','egg','lemon'].forEach(k=>{ITEM['big'+k]=(x,y)=>{push();tr(x,y);sc(1.55);ITEM[k](0,0);pop()}});
const FULLF=[['cheese',50,-320],['tortilla',-40,-320],['avocado',-62,-210],['tomato',-22,-210],['tomato',4,-210],['salsa',55,-210],['lettuce',-40,-100],['milk',48,-100]];
const MOMX=150,KIDX=52;
function tumble(x,y,r,a){push();tr(x,y);rot(a);for(let i=0;i<5;i++){const pts=[];for(let k=0;k<=14;k++){const an=k/14*6.283+i*1.3,rr=r*(.55+.45*Math.sin(k*1.7+i));pts.push([Math.cos(an)*rr,Math.sin(an)*rr])}line(pts,{lw:2.4,col:i%2?C.brown:C.dbrown,single:1,step:6})}pop()}
// fridge visits in scene A: [open, close (null = stays open), max]
const OPEN=[[-.12,1.75,.85],[2.25,3.45,.85],[4.15,5.35,.85],[5.65,5.92,.74],[6.1,6.37,.74],[6.55,6.82,.74],[7.0,7.27,.74],[7.6,null,.9]];
function openAmt(t){let v=0;OPEN.forEach(([to,tc,mx])=>{const d=to>5.5?.12:.25;let a=eout(span(t,to,to+d));if(tc!==null)a*=1-ein(span(t,tc-d,tc));v=Math.max(v,a*mx)});return v}
function checks(t){let n=0;OPEN.forEach(([to])=>{if(t>=to)n++});return Math.max(1,n)}
function itemsAt(t){if(t<2.0)return[['bigmustard',-45,-320],['bigegg',30,-210],['biglemon',-20,-100]];if(t<3.9)return[['bigmustard',-45,-320],['biglemon',-20,-100]];if(t<6.3)return[['biglemon',-20,-100]];return[]}
const CLK=[[0,'5:47'],[2.25,'5:49'],[4.15,'5:52'],[5.65,'5:55'],[6.1,'5:58'],[6.55,'6:04'],[7.0,'6:12']];
function clockAt(t){if(t>=7.6){const m=Math.round(lerp(12,30,span(t,7.6,8.0)));return['6:'+String(m).padStart(2,'0'),t<8.0?t:7.98]}let v='5:47',tc=-9;CLK.forEach(([c,s])=>{if(t>=c){v=s;tc=c}});return[v,tc]}
function topBox(l1,time,t,tc,col,timeCol,shake=0){const sh=shake?Math.sin(t*50)*2.5*shake:0;push();tr(270+sh,22);
 shape([[-178,0],[178,-4],[182,116],[-180,120]],col,{lw:3.6,gap:6,fw:11,ang:-.05});
 txt(l1,0,40,32,NAVY,'Brush',{align:'center'});
 const pp=1+.3*Math.max(0,1-(t-tc)*5);push();tr(0,104);sc(pp);txt(time,0,0,68,timeCol,'Brush',{align:'center'});pop();pop()}

// ── A: the 5:47 PM fridge checks ──
function sceneA(t){kitchen();
 const op=openAmt(t),fin=t>=7.6,rapid=t>=5.6&&!fin;
 const face=fin?{brows:'sad',mouth:'sad',tears:t>8.1}:rapid?{twitch:1.2,mouth:'grit',sweat:1,brows:'sad'}:t>=2.2?{brows:'sad',mouth:'wavy',sweat:t>4.1}:{mouth:'flat'};
 fridge(FX,FY,FS,{t,open:op,items:itemsAt(t),face,cold:op>.3,shake:rapid?.6:0});
 if(fin){const k=span(t,7.75,8.0);if(k>0){const[bx,by]=fW(70,-414);GA=.35+.15*Math.sin(t*9);shape(blob(bx,by,26+k*10,22+k*8,12,.1),null,{solid:'#FFF6B0',noline:1});GA=1;
   for(let i=0;i<6;i++){const an=i/6*6.28+.3;line([[bx+Math.cos(an)*18,by+Math.sin(an)*16],[bx+Math.cos(an)*30,by+Math.sin(an)*26]],{lw:2.6,col:C.yellow,single:1})}}
  const p=span(t,8.0,9.5),[sx,sy]=fW(lerp(-120,140,p),-210-10);push();if(p>0&&p<1){tumble(sx,sy-22*FS-Math.abs(Math.sin(p*14))*12,24,p*14)}pop()}
 // kid
 if(t>=3.85){const x=lerp(-70,KIDX,eout(span(t,3.85,4.2))),mv=t<4.2;
  who('kid',x,t,{walk:mv?13:0,mouth:t>4.3&&t<5.3||t>8.75&&t<9.5?'talk':fin?'sad':'flat',armL:fin?[-26,-90]:undefined,eye:undefined})}
 // mom
 const near=OPEN.some(([to,tc])=>t>=to-.15&&t<=to+.25||(tc!==null&&t>=tc-.3&&t<=tc+.05)),stay=fin||t<1.4;
 const armR=stay?reach(MOMX,1.85,handleAt(op)):near?reach(MOMX,1.85,handleAt(op)):[24,-58];
 const frizz=t<2.2?0:t<4.1?.3:t<5.6?.5:fin?1.1:.8;
 who('mom',MOMX,t,{armR,armL:t<1.6?[-30,-96]:fin?[-36,-116]:undefined,mouth:fin?'wavy':t<1.6?'open':(t>2.3&&t<3.4)?'talk':rapid?'grit':'flat',eye:fin?'spiral':undefined,frizz,twitch:rapid?1:0,brows:t>2.2&&!fin?'angry':undefined});
 bub(t,-1,1.7,["One egg.","Mustard. A lemon."],150,452,[150,600],{size:30,instant:1});
 bub(t,2.35,3.5,["Where did","the EGG go?!"],150,452,[150,600],{size:32,col:C.red});
 bub(t,4.35,5.4,["What's for","dinner?"],112,560,[60,676],{size:30});
 bub(t,7.95,8.75,["...just","the light."],150,452,[150,600],{size:34});
 bub(t,8.8,9.6,["Cereal","again?"],112,560,[60,676],{size:32});
 const[v,tc]=clockAt(t);topBox('NOBODY PLANNED DINNER.',v+' PM',t,tc,C.yellow,t>=5.6?C.red:NAVY,fin&&t<8.2?1:0);
 lowerThird('FRIDGE CHECK #'+checks(t),fin?' · just the light left':' · '+(['nothing new','still nothing','hmm','...','...','...','...'][checks(t)-1]),t,-1)}

// ── app ──
function appScene(t){
 shape(FULL,null,{solid:'#FBE6CE',noline:1});
 shape(blob(270,490,320,330,18,.05),'#F6CFA0',{noline:1,gap:7,fw:11,flat:1,ang:-.3});
 [[56,190],[484,180],[50,880],[490,890]].forEach(([x,y],i)=>sparkle(x,y+Math.sin(t*3+i)*5,.9,t*1.5+i));
 const slide=1-back(span(t,9.55,10.2)),out=ein(span(t,15.4,15.9)),oy=(slide+out)*900;
 push();tr(0,oy);shape(rrect(95-14,102-14,350+28,757+28,42),C.dgray,{lw:4,gap:5,fw:9,col2:C.gray});shape(rrect(95,102,350,757,28),null,{solid:'#FDFCFA',lw:2});pop();
 const sets=[[9.8,11.9,'So Mom planned the week.'],[11.9,13.9,'Every dinner has its list.'],[13.9,15.9,'Shop once. Sorted by 5:47.']];
 sets.forEach(([a,b,s])=>{if(t>=a&&t<b){const k=back((t-a)/.3);push();tr(270,58);sc(k);tr(-270,-58);shape([[30,18],[510,14],[516,76],[26,80]],C.yellow,{lw:3.2,gap:6,fw:11,ang:-.05});txt(s,270,62,s.length>24?37:42,NAVY,'Brush',{align:'center'});pop()}})}

// ── D: same time, sorted ──
function sceneD(t){kitchen();
 const op=eout(span(t,16.35,16.6))*(1-ein(span(t,19.3,19.55)))*.85;
 fridge(FX,FY,FS,{t,open:op,items:FULLF,face:{shades:1,mouth:'smile',cheeks:1}});
 const cheer=t>18.7;
 who('kid',KIDX,t,{mouth:cheer?'open':'smile',cheeks:1,armL:cheer?[-28,-122+Math.sin(t*14)*6]:undefined,armR:cheer?[28,-122+Math.cos(t*14)*6]:undefined});
 who('mom',MOMX,t,{phone:1,armR:[30,-104],mouth:t>16.85&&t<18.5?'talk':'smile',cheeks:1});
 bub(t,16.8,18.6,["5:47 PM.","Already sorted."],170,452,[160,600],{size:32,col:C.dgreen,fill:'#EBF2E2'});
 bub(t,18.7,19.95,["TACOS!"],112,560,[60,676],{size:38,col:C.dgreen,fill:'#EBF2E2'});
 topBox('DINNER: TACOS',"5:47 PM",t,16.0,C.green,NAVY);
 lowerThird('FRIDGE CHECK #1',' · and done',t,16.0)}
function wipe(t,tc,col=C.orange){const p=span(t,tc-.3,tc),q=span(t,tc,tc+.3);if(p<=0||q>=1)return;const a=q*(W+120)-60,b=p*(W+120)-60;shape([[a-20,-30],[b+10,-30],[b-10,H+30],[a-30,H+30]],col,{noline:1,gap:9,lw:16,ang:.6,flat:1})}

function endCard(t){const lt=t-TL.E;
 shape(FULL,null,{solid:'#F2EAD8',noline:1});shape(blob(270,430,300,300,18,.05),'#F6CFA0',{noline:1,gap:7,fw:11,flat:1,ang:-.3});
 fridge(270,936,.62,{t,face:{shades:1,mouth:'smile',cheeks:1}});sparkle(120,760,.9,t*2);sparkle(420,720,.8,-t*2);
 const e=back(span(lt,.1,.6));push();tr(270,210);sc(e);tr(-270,-210);txt('dinrr',270,236,190,C.dgreen,'Brush',{align:'center',stroke:NAVY,sw:12,jit:.6});line([[130,262],[200,270],[270,260],[350,271],[410,262]],{lw:8,col:C.orange,single:1,wob:1.6});pop();
 txt('5:47 PM.',270,345,50,NAVY,'Brush',{align:'center',n:(lt-.6)*30});txt('Already sorted.',270,402,52,C.red,'Brush',{align:'center',n:(lt-1.0)*30});
 if(lt>1.5){const q=back(span(lt,1.5,1.9));push();tr(270,466);sc(q);tr(-270,-466);shape(rrect(150,438,240,58,29),C.yellow,{lw:3.4,gap:4.5,fw:8});txt('@dinrr.app',270,478,34,NAVY,'Brush',{align:'center'});pop()}
 if(lt>2.0)txt("What's in YOUR fridge right now?",270,556,29,NAVY,'Pat',{align:'center',n:(lt-2.0)*40})}

// ── sound events ──
const SFX=[];const ev=(t,type,x={})=>SFX.push({t:Math.round(t*1000)/1000,type,...x});
ev(0,'dooropen');ev(0,'clock');ev(.05,'tink',{i:0});
OPEN.forEach(([to,tc],i)=>{if(i>0){ev(to,'dooropen');ev(to,'clock')}if(tc!==null)ev(tc,'doorclose')});
ev(2.4,'honk');ev(3.85,'step',{n:3});ev(4.35,'tink',{i:2});
ev(5.6,'drumroll',{d:2.0});ev(7.6,'rollup',{d:.4});ev(7.95,'wind',{d:1.5});ev(8.1,'wah');ev(8.8,'tink',{i:4});
ev(9.2,'whoosh',{dir:'out'});ev(9.35,'slide',{dir:'up'});ev(9.55,'whoosh',{dir:'in'});
ev(10.6,'tap');ev(12.4,'tap');ev(12.9,'tap');[13.6,14.2,14.8].forEach((tc,i)=>{ev(tc,'check');ev(tc+.05,'tink',{i})});
ev(15.4,'whoosh',{dir:'out'});ev(15.9,'whoosh',{dir:'in'});
ev(16.35,'dooropen');ev(16.35,'xylo',{i:0});ev(16.8,'xylo',{i:1});ev(17.3,'xylo',{i:2});ev(18.7,'tada');ev(19.3,'doorclose');
ev(19.7,'whoosh',{dir:'out'});ev(20.4,'logo');ev(21.0,'sparkles');
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
