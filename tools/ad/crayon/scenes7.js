// ───────────── #7 "The Group Chat" — the family group chat asks "what's for dinner?" until Mom's phone overheats ─────────────
const TL={C:9.5,D:15.9,E:20.0,DUR:23.6};
const FULL=[[-30,-30],[W+30,-30],[W+30,H+30],[-30,H+30]];
const FY=880;
const SND={Kid:{c:'#2F6DB5',f:'#DCEBF8'},Dad:{c:'#C2611A',f:'#FCE3C6'},Grandma:{c:'#7A55B8',f:'#EADFF8'},Mom:{c:C.dgreen,f:'#D9EDCF'}};
// [time, sender, text]
const MSGA=[[-6,'Kid',"what's for dinner?"],[-5,'Grandma','DINNER?'],[-4,'Kid','hungry'],[-3,'Dad',"what's for dinner?"],[-2,'Kid','pizza?'],[-1,'Mom','AGAIN??'],
 [.35,'Grandma','WHAT IS FOR DINNER'],[1.0,'Kid',"what's for dinner?"],[1.6,'Dad','idk. ask mom'],[2.2,'Mom','I AM mom.'],
 [2.85,'Kid','pizza??'],[3.45,'Dad',"what's for dinner?"],[3.95,'Grandma','HELLO??'],[4.4,'Kid','dinner?'],[4.75,'Dad','??'],
 [5.05,'Kid','pizza'],[5.3,'Grandma','DINNER'],[5.55,'Dad','food?'],[5.75,'Kid','??'],[5.95,'Dad','hello'],[6.1,'Kid','pizza pizza'],[6.25,'Grandma','???'],[6.4,'Kid','!!!']];
const MSGD=[[16.25,'Kid','TACOS tonight!! saw it'],[16.85,'Dad','got the avocados'],[17.45,'Grandma','SEE YOU AT 6'],[18.1,'Mom','nobody asked. wow.']];
function chat(msgs,t){const shown=msgs.filter(m=>m[0]<=t);let y=252;
 for(let i=shown.length-1;i>=0&&y>-118;i--){const[t0,who_,s]=shown[i],k=eout(span(t,t0,t0+.18)),me=who_==='Mom',st=SND[who_];
  const off=i===shown.length-1?(1-k)*54:0;const yy=y+off;
  const w=Math.min(240,tw(s,24)+26);
  const x0=me?118-w:-118;
  shape(rrect(x0,yy-37,w,37,13),null,{solid:st.f,lw:2.2,step:10});
  txt(s,x0+13,yy-10,24,NAVY,'Pat',{jit:.5});
  if(!me)txt(who_,x0+4,yy-42,16,st.c,'Pat',{jit:.4});
  y-=me?50:63}}
function puff(x,y,r,k){GA=(1-k)*.95;push();tr(x,y);sc(.6+k*1.1);shape(blob(0,0,r,r*.8,10,.12),null,{solid:'#FFFDF6',lw:2.4});pop();GA=1}
function phoneGuy(cx,cy,s,o={}){const t=o.t||0,f=o.face||{},sh=o.shake?Math.sin(t*58)*3*o.shake:0;push();tr(cx+sh,cy);sc(s);rot(o.tilt||0);
 // legs + arms
 limb([-50,290],[-58+(o.walk?Math.sin(t*12)*10:0),362],11,C.dgray);limb([50,290],[58-(o.walk?Math.sin(t*12)*10:0),362],11,C.dgray);
 shape(blob(-64,366,20,9,10,0),NAVY,{lw:2,flat:1,gap:3,fw:5});shape(blob(64,366,20,9,10,0),NAVY,{lw:2,flat:1,gap:3,fw:5});
 const aL=o.armL||[-205,60+Math.sin(t*4)*6],aR=o.armR||[205,60+Math.cos(t*4)*6];
 limb([-148,20],aL,9,C.dgray);limb([148,20],aR,9,C.dgray);
 shape(blob(aL[0],aL[1],12,12,8,0),C.gray,{lw:2.6,gap:3,fw:5});shape(blob(aR[0],aR[1],12,12,8,0),C.gray,{lw:2.6,gap:3,fw:5});
 shape(rrect(-150,-300,300,600,46),o.hot?'#C9605A':C.dgray,{lw:4.4,gap:5,fw:9,col2:o.hot?'#E89A8F':C.gray});
 shape(rrect(-130,-206,260,474,22),null,{solid:o.dead?'#4E5870':CREAM,lw:3});
 if(!o.dead){txt('Family',0,-176,26,NAVY,'Brush',{align:'center'});txt('4 members',0,-156,14,C.dgray,'Pat',{align:'center'});line([[-122,-146],[122,-146]],{lw:2,single:1,col:C.gray});
  chat(o.msgs||[],t)}
 else{txt('too hot.',0,30,40,'#FFFDF6','Brush',{align:'center'})}
 // face on the top bezel
 const ey=-262,blink=(t%2.7)>2.56&&!f.eye;
 if(f.shades){[-40,40].forEach(q=>shape(rrect(q-26,ey-14,52,26,10),'#1B2236',{lw:2.6,gap:3,fw:5}));line([[-14,ey-4],[14,ey-4]],{lw:3,single:1,col:'#FFFDF6'})}
 else if(f.eye==='spiral'){[-40,40].forEach(q=>{const pts=[];for(let i=0;i<=26;i++){const an=i*.55+t*10,r=i*.5;pts.push([q+Math.cos(an)*r,ey+Math.sin(an)*r])}line(pts,{lw:2.6,single:1,step:4,col:'#FFFDF6'})})}
 else if(blink){[-40,40].forEach(q=>line([[q-9,ey],[q+9,ey]],{lw:3,single:1,col:'#FFFDF6'}))}
 else{const tw_=f.twitch?Math.sin(t*55)*2*f.twitch:0;[-40,40].forEach(q=>{dot(q+tw_,ey,10,'#FFFDF6');dot(q+tw_+1,ey+1,5)})}
 if(f.brows==='angry'){line([[-58,ey-24],[-26,ey-14]],{lw:3.6,single:1,col:'#FFFDF6'});line([[58,ey-24],[26,ey-14]],{lw:3.6,single:1,col:'#FFFDF6'})}
 else if(f.brows==='sad'){line([[-58,ey-14],[-26,ey-24]],{lw:3.6,single:1,col:'#FFFDF6'});line([[58,ey-14],[26,ey-24]],{lw:3.6,single:1,col:'#FFFDF6'})}
 if(f.cheeks)[-1,1].forEach(q=>dot(q*78,ey+18,8,'rgba(238,127,160,.6)'));
 const my=-226,m=f.mouth||'flat',W_='#FFFDF6';
 if(m==='smile')line([[-20,my-5],[0,my+5],[20,my-5]],{lw:3.4,single:1,col:W_});
 else if(m==='flat')line([[-14,my],[14,my]],{lw:3.4,single:1,col:W_});
 else if(m==='wavy')line([[-22,my],[-11,my-6],[0,my+2],[11,my-6],[22,my]],{lw:3.4,single:1,col:W_});
 else if(m==='grit'){shape(rrect(-22,my-9,44,18,5),null,{solid:CREAM,lw:2.6});for(let i=-1;i<=1;i++)line([[i*11,my-9],[i*11,my+9]],{lw:2,single:1})}
 else{const k=m==='talk'?.35+.65*Math.abs(Math.sin(t*13)):1;shape(blob(0,my+2,12,9*k+2,10,0),C.red,{lw:2.6,gap:3,fw:4})}
 if(f.sweat){sweat(150,-300,t);sweat(-148,-250,t+.4);sweat(158,-150,t+.8)}
 const st=o.steam||0;if(st>0){[[-120,-300],[118,-304],[0,-310]].forEach(([sx,sy],j)=>{for(let i=0;i<3;i++){const k=((t*1.6)+i/3+j*.21)%1;GA=st;puff(sx+(j-1)*k*40,sy-k*120*st,16+st*10,k)}});GA=1}
 pop()}
function topBox(l1,big,t,tc,col,bigCol,shake=0){const sh=shake?Math.sin(t*50)*2.5*shake:0;push();tr(270+sh,18);
 shape([[-250,0],[250,-4],[254,122],[-252,126]],col,{lw:3.6,gap:6,fw:11,ang:-.05});
 txt(l1,0,40,31,NAVY,'Brush',{align:'center'});
 const pp=1+.07*Math.max(0,1-(t-tc)*5);push();tr(0,104);sc(pp);txt(big,0,0,44,bigCol,'Brush',{align:'center'});pop();pop()}
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
 }

function bub(t,t0,t1,lines,x,y,tail,o={}){if(t<t0||t>t1)return;const ex=span(t,t1-.14,t1);if(ex>0){GA=1-ex;push();tr(x,y);sc(1-ex*.3);tr(-x,-y);bubble(lines,x,y,t-t0,tail,o);pop();GA=1}else bubble(lines,x,y,t-t0,tail,o)}


// ── app ──
function appScene(t){
 shape(FULL,null,{solid:'#FBE6CE',noline:1});
 shape(blob(270,490,320,330,18,.05),'#F6CFA0',{noline:1,gap:7,fw:11,flat:1,ang:-.3});
 [[56,190],[484,180],[50,880],[490,890]].forEach(([x,y],i)=>sparkle(x,y+Math.sin(t*3+i)*5,.9,t*1.5+i));
 const slide=1-back(span(t,9.55,10.2)),out=ein(span(t,15.4,15.9)),oy=(slide+out)*900;
 push();tr(0,oy);shape(rrect(95-14,102-14,350+28,757+28,42),C.dgray,{lw:4,gap:5,fw:9,col2:C.gray});shape(rrect(95,102,350,757,28),null,{solid:'#FDFCFA',lw:2});pop();
 const sets=[[9.8,11.9,'So Mom planned the week.'],[11.9,13.9,'The whole family sees it.'],[13.9,15.9,'Nobody has to ask.']];
 sets.forEach(([a,b,s])=>{if(t>=a&&t<b){const k=back((t-a)/.3);push();tr(270,58);sc(k);tr(-270,-58);shape([[30,18],[510,14],[516,76],[26,80]],C.yellow,{lw:3.2,gap:6,fw:11,ang:-.05});txt(s,270,62,s.length>24?37:42,NAVY,'Brush',{align:'center'});pop()}})}


function wipe(t,tc,col=C.orange){const p=span(t,tc-.3,tc),q=span(t,tc,tc+.3);if(p<=0||q>=1)return;const a=q*(W+120)-60,b=p*(W+120)-60;shape([[a-20,-30],[b+10,-30],[b-10,H+30],[a-30,H+30]],col,{noline:1,gap:9,lw:16,ang:.6,flat:1})}

// counter
function countAt(t){if(t>=6.55)return t<6.95?String(Math.round(lerp(63,99,span(t,6.55,6.95)))):'99+';let n=47;MSGA.forEach(m=>{if(m[0]>0&&m[0]<=t)n++});return String(n)}
function lastMsgT(t){let v=-9;MSGA.forEach(m=>{if(m[0]<=t)v=m[0]});return t>=6.55&&t<7?t:t>=6.95&&t<7.1?6.95:v}
const MOMX=420;
// ── A: the group chat melts the phone ──
function sceneA(t){kitchen();
 const melt=t>=6.95,rapid=t>=4.3&&!melt,k=eio(span(t,7.4,7.85));
 const face=melt?{eye:'spiral',mouth:'wavy',sweat:1}:rapid?{twitch:1.2,mouth:'grit',sweat:1,brows:'sad'}:t>=2.1?{brows:'sad',mouth:'wavy',sweat:1}:{brows:'sad',mouth:t<1.7?'talk':'flat',sweat:1};
 const steam=melt?1:rapid?.55+.4*span(t,4.3,6.9):.5;
 phoneGuy(lerp(270,165,k),lerp(500,585,k),lerp(1,.68,k),{t,face,msgs:MSGA,shake:rapid?.5+.6*span(t,4.3,6.9):melt&&t<7.4?1.4:.15,steam,hot:t>=5.6,tilt:melt?-.1*eout(span(t,6.95,7.2)):0,armL:melt?[-210,-120+Math.sin(t*9)*10]:undefined,armR:melt?[210,-120+Math.cos(t*9)*10]:undefined});
 if(t>=6.95&&t<7.45){const p=span(t,6.95,7.45);for(let i=0;i<7;i++){const an=i/7*6.28;puff(270+Math.cos(an)*(60+p*140),330+Math.sin(an)*(40+p*90),26,p)}}
 bub(t,-1,1.75,["help."],455,232,[402,262],{size:30,instant:1});
 // mom walks in
 if(t>=7.4){const x=lerp(640,MOMX,eout(span(t,7.4,7.9))),mv=t<7.9;
  who('mom',x,t,{walk:mv?13:0,mouth:t>8.05&&t<9.1?'talk':'flat',brows:'angry',armL:t>8.0?[-30,-100]:undefined,armR:t>8.4?[28,-112]:undefined,frizz:.4})}
 bub(t,8.0,9.35,["Okay. I'm making","a PLAN."],360,500,[410,668],{size:32,col:C.dgreen,fill:'#EBF2E2'});
 const c=countAt(t);topBox("be honest... how many today?","WHAT'S FOR DINNER? x"+c,t,lastMsgT(t),C.yellow,t>=4.3?C.red:NAVY,melt&&t<7.4?1:0);
 lowerThird('FAMILY GROUP CHAT',melt?' · phone overheated':rapid?' · 3 people typing...':' · 4 members',t,-1)}
// ── D: same chat, nobody asks ──
function sceneD(t){kitchen();
 phoneGuy(270,500,1,{t,face:{shades:1,mouth:'smile',cheeks:1},msgs:MSGD});
 if(t>18.7)[[60,330],[480,300],[70,620],[470,640]].forEach(([x,y],i)=>sparkle(x,y+Math.sin(t*4+i)*6,.9,t*2+i));
 topBox("nobody asked today.","WHAT'S FOR DINNER? x0",t,16.0,C.green,NAVY);
 lowerThird('FAMILY GROUP CHAT',' · all quiet',t,16.0)}
function endCard(t){const lt=t-TL.E;
 shape(FULL,null,{solid:'#F2EAD8',noline:1});shape(blob(270,430,300,300,18,.05),'#F6CFA0',{noline:1,gap:7,fw:11,flat:1,ang:-.3});
 phoneGuy(270,800,.36,{t,face:{shades:1,mouth:'smile',cheeks:1},msgs:MSGD});sparkle(120,760,.9,t*2);sparkle(420,720,.8,-t*2);
 const e=back(span(lt,.1,.6));push();tr(270,210);sc(e);tr(-270,-210);txt('dinrr',270,236,190,C.dgreen,'Brush',{align:'center',stroke:NAVY,sw:12,jit:.6});line([[130,262],[200,270],[270,260],[350,271],[410,262]],{lw:8,col:C.orange,single:1,wob:1.6});pop();
 txt('Mute the dinner chat.',270,350,50,C.red,'Brush',{align:'center',n:(lt-.6)*30});
 if(lt>1.1){const q=back(span(lt,1.1,1.5));push();tr(270,418);sc(q);tr(-270,-418);shape(rrect(150,390,240,58,29),C.yellow,{lw:3.4,gap:4.5,fw:8});txt('@dinrr.app',270,430,34,NAVY,'Brush',{align:'center'});pop()}
 if(lt>1.6){const q=back(span(lt,1.6,2.0));push();tr(270,560);sc(q);tr(-270,-560);
  shape([[44,496],[496,492],[500,628],[40,632]],CREAM,{lw:3.4,gap:6,fw:10,solid:CREAM});
  txt('Be honest...',270,548,40,NAVY,'Brush',{align:'center'});txt('how many times today?',270,606,44,C.red,'Brush',{align:'center'});pop()}}

// ── sound events ──
const SFX=[];const ev=(t,type,x={})=>SFX.push({t:Math.round(t*1000)/1000,type,...x});
ev(0,'buzz');ev(0,'chime');ev(.05,'kettle',{d:1.2});
MSGA.forEach(([t0],i)=>{if(t0>0){if(t0<4.3)ev(t0,'chime');else ev(t0,'tink',{i:Math.min(9,i-9)});if(i%3===0)ev(t0+.02,'buzz')}});
ev(2.2,'honk');ev(4.3,'drumroll',{d:2.3});ev(5.6,'kettle',{d:1.3});ev(6.55,'rollup',{d:.4});ev(6.95,'poof');ev(7.0,'boing');ev(7.15,'wah');
ev(7.4,'step',{n:3});ev(8.05,'tink',{i:2});
ev(9.2,'whoosh',{dir:'out'});ev(9.35,'slide',{dir:'up'});ev(9.55,'whoosh',{dir:'in'});
ev(10.6,'tap');ev(12.4,'tap');ev(12.9,'tap');[13.6,14.2,14.8].forEach((tc,i)=>{ev(tc,'check');ev(tc+.05,'tink',{i})});
ev(15.4,'whoosh',{dir:'out'});ev(15.9,'whoosh',{dir:'in'});
MSGD.forEach(([t0],i)=>ev(t0,'xylo',{i}));ev(18.7,'tada');
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
