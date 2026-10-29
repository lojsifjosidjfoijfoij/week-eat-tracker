// ───────────── #9 "Same Dinner, 7 Days" — pasta every night until the family (and the dog) turns grey ─────────────
const mixc=(a,b,k)=>{const p=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)],A=p(a),B=p(b);k=clamp(k);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,'0')).join('')};
const TL={C:9.5,D:15.9,E:20.0,DUR:23.6};
const FULL=[[-30,-30],[W+30,-30],[W+30,H+30],[-30,H+30]];
const GREY='#A9A6A0';let G=0;const gc=(h,k=G)=>mixc(h,GREY,k);
const PY=852,PS=2.2,TY=730,XD=92,XM=232,XK=382;
// [start, day, count, grey]
const DAYS=[[-9,'SUN',7,.9],[1.7,'MON',1,0],[2.55,'TUE',2,.15],[3.4,'WED',3,.3],[4.25,'THU',4,.45],[5.1,'FRI',5,.6],[5.95,'SAT',6,.72],[6.8,'SUN',7,.86]];
function dayAt(t){let k=0;DAYS.forEach((d,i)=>{if(t>=d[0])k=i});return k}
function greyAt(t){const k=dayAt(t),d=DAYS[k];if(k<=1)return d[3];return lerp(DAYS[k-1][3],d[3],eout(span(t,d[0],d[0]+.35)))}
function dogGrey(t){return t<1.7?1:t<7.2?0:eio(span(t,7.2,7.9))}

// ── food doodles (our own) ──
function plate(x,y,s,kind,o={}){push();tr(x,y);sc(s);
 shape(blob(0,0,52,13,14,0),null,{solid:o.g!==undefined?gc(CREAM,o.g):CREAM,lw:3});line([[-36,2],[36,2]],{lw:1.8,col:gc('#C9C2B5',o.g??G),single:1});
 if(kind==='pasta'){shape(blob(0,-12,34,16,14,.08),C.yellow,{lw:3,gap:4,fw:6,col2:'#FBE7A0'});
  for(let i=0;i<4;i++)line([[-26+i*6,-6-i*3],[-10+i*8,-20+i*2],[8+i*5,-8-i*4],[22-i*2,-18+i]],{lw:2.2,col:'#C99A1E',single:1});
  shape(blob(2,-22,15,7,10,.1),C.red,{lw:2.4,gap:3,fw:5});dot(-4,-24,4,C.dbrown);dot(8,-21,3.4,C.dbrown)}
 else if(kind==='taco'){[-18,18].forEach((dx,i)=>{push();tr(dx,-6);rot(i?.25:-.25);
  shape(blob(0,-12,13,10,8,.1),C.green,{lw:2.2,gap:3,fw:5});dot(-4,-20,3.4,C.red);dot(5,-18,3,C.red);
  const p=[];for(let q=0;q<=10;q++){const a=Math.PI*q/10;p.push([-Math.cos(a)*22,-Math.sin(a)*22+6])}shape(p,C.yellow,{lw:2.8,gap:4,fw:6,col2:'#FBE7A0'});pop()})}
 else if(kind==='pizza'){shape([[-30,-4],[30,-4],[0,-40]],C.yellow,{lw:2.8,gap:4,fw:6});shape(rrect(-32,-8,64,8,4),C.brown,{lw:2.4,gap:3,fw:5});[[-8,-14],[8,-16],[0,-26]].forEach(([a,b])=>dot(a,b,4.2,C.red))}
 else if(kind==='fish'){shape([[-30,-12],[-6,-26],[18,-14],[30,-24],[30,-2],[18,-10],[-6,0]],C.orange,{lw:2.8,gap:4,fw:6});dot(-18,-14,2.6)}
 else if(kind==='salad'){[[-14,-12,C.green],[10,-14,'#9BD06E'],[0,-22,C.green]].forEach(([a,b,c])=>shape(blob(a,b,16,10,8,.2),c,{lw:2.2,gap:3,fw:5}));dot(-6,-16,4,C.red);dot(12,-22,3.6,C.red)}
 pop()}

function dog9(x,y,s,o={}){const dg=o.g??0,fur=gc('#D9A066',dg),ear=gc(C.dbrown,dg);push();tr(x,y);sc((o.flip?-1:1)*s,s);const t=o.t||0,wg=o.wag??6;
 shape(blob(0,-34,34,30,12,.04),fur,{lw:3.4,gap:5,fw:8});
 line([[28,-30],[48+Math.sin(t*wg)*(wg?6:0),-52-(wg?Math.cos(t*6)*4:-26)]],{lw:7,col:fur,single:1});
 const hy=o.howl?-78:-70;push();tr(-26,hy);rot(o.howl?.45:o.away?-.25:0);tr(26,-hy);
 shape(blob(-26,hy,24,22,12,.03),fur,{lw:3.4,gap:5,fw:8});
 shape([[-44,hy-16],[-52,hy+10],[-40,hy+18],[-34,hy-6]],ear,{lw:2.8,gap:4,fw:6});shape([[-16,hy-16],[-6,hy+10],[-18,hy+18],[-24,hy-8]],ear,{lw:2.8,gap:4,fw:6});
 if(o.sad){line([[-38,hy-2],[-30,hy-1]],{lw:2.6,single:1});line([[-22,hy-1],[-14,hy-2]],{lw:2.6,single:1})}else{dot(-34,hy-2,2.8);dot(-18,hy-2,2.8)}
 shape(blob(-42,hy+8,6,5,8,0),NAVY,{lw:2,flat:1,gap:3,fw:5});
 if(o.howl)shape(blob(-38,hy+20,6,8+Math.abs(Math.sin(t*9))*2,8,0),C.red,{lw:2.2,flat:1,gap:3,fw:5});
 else if(o.bark)shape(blob(-40,hy+18,7,6+Math.abs(Math.sin(t*20))*3,8,0),C.red,{lw:2.2,flat:1,gap:3,fw:5});
 else line([[-46,hy+16],[-36,hy+18],[-28,hy+14]],{lw:2.2,single:1});
 pop();
 limb([-14,-12],[-14,0],8,fur);limb([12,-12],[12,0],8,fur);pop()}

function room(t,cal,food){
 shape(FULL,null,{solid:gc('#FCEBC8'),noline:1});shape([[-30,150],[W+30,150],[W+30,760],[-30,760]],gc('#F6DDB0'),{noline:1,gap:9,fw:12,flat:1,ang:-.4});
 // window (evening)
 shape(rrect(40,180,170,150,8),null,{solid:gc('#F9C784'),lw:4});shape(blob(150,290,26,26,12,0),gc(C.orange),{lw:2.6,gap:4,fw:6});
 line([[125,180],[125,330]],{lw:4,single:1});line([[40,255],[210,255]],{lw:4,single:1});
 // wall calendar
 push();tr(430,175);rot(.04);shape(rrect(-62,0,124,150,8),null,{solid:CREAM,lw:3.6});shape(rrect(-62,0,124,34,8),gc(C.red),{lw:3,gap:4,fw:7});
 dot(-30,6,4);dot(30,6,4);txt(cal,0,94,56,NAVY,'Brush',{align:'center'});txt(food,0,132,24,food==='pasta'?C.dgray:C.dgreen,'Pat',{align:'center'});pop();
 // floor
 shape([[-30,860],[W+30,860],[W+30,H+30],[-30,H+30]],gc('#CC9158'),{lw:4,gap:7,fw:11,ang:.1});}
function tableFront(){
 shape(rrect(-30,TY-6,480,24,6),gc(C.brown),{lw:3.8,gap:5,fw:9});
 const cl=[[-30,TY+16],[450,TY+16],[442,900],[-30,900]];shape(cl,gc('#FFF6E4'),{lw:3.6,gap:7,fw:11,flat:1,solid:gc('#FFF6E4')});
 for(let i=0;i<6;i++)line([[i*80-10,TY+20],[i*80-14,896]],{lw:6,col:gc('#F0A49A'),single:1});
 for(let j=0;j<2;j++)line([[-26,TY+60+j*60],[444,TY+58+j*60]],{lw:6,col:gc('#F0A49A'),single:1})}

function family(t,o){const g=o.g;
 const mg=o.momG??g;
 person(XD,PY,PS,{t,ph:0,cloth:gc(C.blue,g),skin:gc(C.peach,g),hair:gc(C.dbrown,g),pants:gc(C.dbrown,g),stache:1,eye:o.dadEye,mouth:o.dadMouth,brows:o.dadBrows,armL:o.dadArmL,armR:o.dadArmR});
 person(XM,PY,PS,{t,ph:1,cloth:gc(C.orange,mg),skin:gc(C.peach,mg),hair:gc(C.brown,mg),pants:gc(C.dbrown,mg),bun:1,eye:o.momEye,mouth:o.momMouth,armR:o.momArmR,armL:o.momArmL});
 const ky=o.kidUp?PY-56:PY-24,sh=o.kidShake?Math.sin(t*46)*3:0;
 person(XK+sh,ky,1.85,{t,ph:2,kid:1,head:1.12,cloth:gc(C.green,g),skin:gc(C.peach,g),hair:gc(C.dbrown,g),pants:gc(C.blue,g),eye:o.kidEye,mouth:o.kidMouth,brows:o.kidBrows,armL:o.kidArmL,armR:o.kidArmR,cheeks:o.kidCheeks})}

function topBox(l1,big,t,tc,col,bigCol,shake=0){const sh=shake?Math.sin(t*50)*2.5*shake:0;push();tr(270+sh,18);
 shape([[-250,0],[250,-4],[254,122],[-252,126]],col,{lw:3.6,gap:6,fw:11,ang:-.05});
 txt(l1,0,40,30,NAVY,'Brush',{align:'center'});
 const pp=1+.12*Math.max(0,1-(t-tc)*5);push();tr(0,104);sc(pp);txt(big,0,0,50,bigCol,'Brush',{align:'center'});pop();pop()}
function lowerThird(s1,s2,t,t0=0){const k=eout(span(t,t0,t0+.3));if(k<=0)return;push();tr(lerp(-420,0,k),0);
 const w=tw(s1,34,'Brush')+tw(s2,26,'Pat')+44;shape(rrect(14,896,w,50,8),C.yellow,{lw:3.2,gap:5,fw:9,ang:-.05});
 txt(s1,30,932,34,NAVY,'Brush');txt(s2,34+tw(s1,34,'Brush'),931,26,NAVY,'Pat');pop()}
function bub(t,t0,t1,lines,x,y,tail,o={}){if(t<t0||t>t1)return;const ex=span(t,t1-.12,t1);if(ex>0){GA=1-ex;push();tr(x,y);sc(1-ex*.3);tr(-x,-y);bubble(lines,x,y,t-t0,tail,o);pop();GA=1}else bubble(lines,x,y,t-t0,tail,o)}
function wipe(t,tc,col=C.orange){const p=span(t,tc-.3,tc),q=span(t,tc,tc+.3);if(p<=0||q>=1)return;const a=q*(W+120)-60,b=p*(W+120)-60;shape([[a-20,-30],[b+10,-30],[b-10,H+30],[a-30,H+30]],col,{noline:1,gap:9,lw:16,ang:.6,flat:1})}
function miniPhone(x,y,s){push();tr(x,y);sc(s);rot(-.15);shape(rrect(-16,-56,32,54,6),C.dgray,{lw:2.8,gap:4,fw:6});shape(rrect(-12,-51,24,42,3),'#EBF2E2',{lw:2,flat:1});txt('dinrr',0,-26,11,C.dgreen,'Brush',{align:'center',jit:.3});pop()}
function flash(t,tc){const k=span(t,tc,tc+.18);if(k<=0||k>=1)return;GA=(1-k)*.5;shape(FULL,null,{solid:CREAM,noline:1});GA=1}

// ── A: the pasta week ──
function sceneA(t){const k=dayAt(t),d=DAYS[k],hook=t<1.7;G=greyAt(t);
 const dt=t-d[0],dg=dogGrey(t);
 room(t,d[1],'pasta');
 const mood=G<.1?'smile':G<.35?'flat':'sad',eye=G>.4?'tired':undefined;
 const sun=k===7&&t>=6.8,momUp=t>=8.25;
 family(t,{g:G,momG:momUp?lerp(G,0,eout(span(t,8.3,8.9))):G,
  dadMouth:k===2?'talk':k===5?'wavy':mood,dadEye:k===5?'spiral':eye,
  momMouth:momUp?'talk':k===3?'talk':mood,momEye:momUp?undefined:eye,momArmR:momUp?[30,-120]:undefined,
  kidUp:hook||k===1,kidShake:hook,kidMouth:hook?'talk':k===1?'talk':k===4?'flat':k>=6?'sad':mood,kidBrows:hook?'angry':undefined,
  kidEye:hook?undefined:k===5?'spiral':eye,kidArmL:hook?[-30,-128+Math.sin(t*16)*8]:k===1?[-30,-124]:undefined,kidArmR:hook?[30,-128-Math.sin(t*16)*8]:k===1?[30,-124]:undefined,kidCheeks:k===1});
 if(momUp)miniPhone(XM+30*PS,PY-120*PS-8,1.5);
 tableFront();
 // plates drop in each new day
 const drop=hook?1:eout(span(dt,0,.22));[[XD],[XM],[XK]].forEach(([x],i)=>{const dl=span(dt,i*.05,.22+i*.05),yy=hook?0:-90*(1-eout(dl));GA=hook?1:clamp(dl*3);plate(x,TY-4+yy,1.25,'pasta');GA=1});
 dog9(492,930,1.25,{t,g:dg,wag:dg>.5||k===6?0:6,sad:dg>.5,howl:t>=7.45&&t<8.3,away:k===6,flip:k===6});
 // bubbles
 bub(t,-1,1.6,["SEVEN DAYS.","OF PASTA!!"],290,400,[372,545],{size:40,col:C.red,instant:1});
 bub(t,1.78,2.5,["PASTA! YAY!"],320,420,[380,545],{size:36,col:C.dgreen,fill:'#EBF2E2'});
 bub(t,2.62,3.35,["Pasta again?","Nice."],150,430,[100,560],{size:32});
 bub(t,3.47,4.2,["It's quick..."],260,440,[232,560],{size:32,col:C.dgray});
 bub(t,4.32,5.05,["...pasta?"],360,450,[382,575],{size:34,col:C.dgray});
 bub(t,5.17,5.9,["*sigh*"],120,450,[95,560],{size:34,col:C.dgray});
 bub(t,6.02,6.75,["nope."],455,740,[470,820],{size:30,col:C.dgray});
 bub(t,6.9,7.4,["...pasta."],250,440,[232,560],{size:34,col:C.dgray});
 bub(t,7.45,8.2,["AWOOOOO..."],380,700,[440,800],{size:32,col:C.dgray});
 bub(t,8.3,9.3,["OK. I'm planning","the week."],250,400,[245,520],{size:34,col:C.dgreen,fill:'#EBF2E2'});
 topBox("be honest... how many pasta nights in a row?","PASTA IN A ROW: "+d[2],t,hook?-9:d[0],C.yellow,d[2]>=5?C.red:NAVY,hook&&t<.35?1:0);
 const lt=hook?['SUNDAY',' · pasta (again)']:k===7?['SUNDAY',t>=7.2?' · even the dog':' · pasta']:[{MON:'MONDAY',TUE:'TUESDAY',WED:'WEDNESDAY',THU:'THURSDAY',FRI:'FRIDAY',SAT:'SATURDAY'}[d[1]],' · pasta'];
 lowerThird(lt[0],lt[1],t,hook?-1:d[0]);
 if(!hook)flash(t,d[0]);
 G=0}

// ── app ──
function appScene(t){
 shape(FULL,null,{solid:'#FBE6CE',noline:1});
 shape(blob(270,490,320,330,18,.05),'#CFE0BC',{noline:1,gap:7,fw:11,flat:1,ang:-.3});
 [[52,215,'taco'],[488,205,'pizza'],[52,912,'fish'],[488,912,'salad']].forEach(([x,y,k],i)=>plate(x,y+Math.sin(t*3+i)*4,.8,k));
 const slide=1-back(span(t,9.55,10.2)),out=ein(span(t,15.4,15.9)),oy=(slide+out)*900;
 push();tr(0,oy);shape(rrect(95-14,102-14,350+28,757+28,42),C.dgray,{lw:4,gap:5,fw:9,col2:C.gray});shape(rrect(95,102,350,757,28),null,{solid:'#FDFCFA',lw:2});pop();
 const sets=[[9.8,11.9,'So Mom planned the week.'],[11.9,13.9,'7 days. 7 different dinners.'],[13.9,15.9,'The list is shared.']];
 sets.forEach(([a,b,s])=>{if(t>=a&&t<b){const k=back((t-a)/.3);push();tr(270,58);sc(k);tr(-270,-58);shape([[30,18],[510,14],[516,76],[26,80]],C.yellow,{lw:3.2,gap:6,fw:11,ang:-.05});txt(s,270,62,s.length>24?36:42,NAVY,'Brush',{align:'center'});pop()}})}

// ── D: Monday again — tacos, colour is back ──
function sceneD(t){const lt=t-TL.D;G=0;
 room(t,'MON','tacos');
 family(t,{g:0,dadMouth:'smile',momMouth:'smile',kidUp:1,kidMouth:lt>.2&&lt<1.6?'talk':'smile',kidArmL:[-30,-124+Math.sin(t*10)*6],kidArmR:[30,-124-Math.sin(t*10)*6],kidCheeks:1,dadArmR:lt>1.4?[34,-112+Math.sin(t*9)*8]:undefined});
 tableFront();
 [[XD],[XM],[XK]].forEach(([x],i)=>{const dl=span(lt,.05+i*.06,.3+i*.06);plate(x,TY-4-90*(1-eout(dl)),1.25,'taco')});
 dog9(492,930,1.25,{t,g:0,wag:14,bark:lt>1.7&&lt<2.6});
 if(lt>.3)[[40,400],[500,380],[40,600],[505,610]].forEach(([x,y],i)=>sparkle(x,y+Math.sin(t*4+i)*6,.9,t*2+i));
 bub(t,16.1,17.5,["TACOS?!"],340,420,[382,545],{size:44,col:C.dgreen,fill:'#EBF2E2'});
 bub(t,17.55,18.9,["And tomorrow:","fish & potatoes!"],210,430,[232,560],{size:28});
 bub(t,17.6,18.9,["WOOF!"],455,740,[470,820],{size:32,col:C.red});
 topBox("Monday: tacos!","PASTA IN A ROW: 0",t,16.0,C.green,NAVY);
 lowerThird('MONDAY',' · 6:00 PM · tacos',t,16.0)}

function endCard(t){const lt=t-TL.E;
 shape(FULL,null,{solid:'#F2EAD8',noline:1});shape(blob(270,430,300,300,18,.05),'#CFE0BC',{noline:1,gap:7,fw:11,flat:1,ang:-.3});
 plate(130,880,1.1,'taco');plate(410,880,1.1,'pizza');dog9(280,930,1.0,{t,wag:14});
 const e=back(span(lt,.1,.6));push();tr(270,210);sc(e);tr(-270,-210);txt('dinrr',270,236,190,C.dgreen,'Brush',{align:'center',stroke:NAVY,sw:12,jit:.6});line([[130,262],[200,270],[270,260],[350,271],[410,262]],{lw:8,col:C.orange,single:1,wob:1.6});pop();
 txt('Break the pasta loop.',270,350,50,C.red,'Brush',{align:'center',n:(lt-.6)*30});
 if(lt>1.1){const q=back(span(lt,1.1,1.5));push();tr(270,418);sc(q);tr(-270,-418);shape(rrect(150,390,240,58,29),C.yellow,{lw:3.4,gap:4.5,fw:8});txt('@dinrr.app',270,430,34,NAVY,'Brush',{align:'center'});pop()}
 if(lt>1.6){const q=back(span(lt,1.6,2.0));push();tr(270,560);sc(q);tr(-270,-560);
  shape([[44,496],[496,492],[500,628],[40,632]],CREAM,{lw:3.4,gap:6,fw:10,solid:CREAM});
  txt('Be honest...',270,548,40,NAVY,'Brush',{align:'center'});txt('how many pasta nights in a row?',270,606,38,C.red,'Brush',{align:'center'});pop()}}

// ── sound events ──
const SFX=[];const ev=(t,type,x={})=>SFX.push({t:Math.round(t*1000)/1000,type,...x});
ev(0,'honk');ev(0,'bonk',{i:7});ev(.05,'squeak');ev(.7,'honk');
ev(1.4,'whoosh',{dir:'out'});ev(1.7,'whoosh',{dir:'in'});
DAYS.slice(1).forEach((d,i)=>{ev(d[0]+.02,'bonk',{i});ev(d[0]+.12,'thud')});
ev(1.8,'xylo',{i:2});ev(2.62,'boing');ev(3.47,'pop',{i:2});ev(4.32,'slide',{dir:'down'});ev(5.17,'deflate');ev(6.02,'woof');ev(6.9,'pop',{i:1});
ev(7.25,'wah');ev(7.5,'howl');
ev(8.3,'tada');ev(8.35,'tink',{i:4});
ev(9.2,'whoosh',{dir:'out'});ev(9.55,'whoosh',{dir:'in'});
ev(10.6,'tap');ev(12.4,'tap');ev(12.9,'tap');[13.6,14.2,14.8].forEach((tc,i)=>{ev(tc,'check');ev(tc+.05,'tink',{i})});
ev(15.4,'whoosh',{dir:'out'});ev(15.9,'whoosh',{dir:'in'});
ev(16.0,'sparkles');[16.05,16.11,16.17].forEach((tc,i)=>ev(tc,'pop',{i:i+3}));ev(16.15,'xylo',{i:0});ev(16.2,'tada');
ev(17.6,'woof');ev(17.95,'woof');ev(18.95,'xylo',{i:1});
ev(19.7,'whoosh',{dir:'out'});ev(20.4,'logo');ev(21.0,'sparkles');ev(21.6,'chime');
window.SFX=SFX.sort((a,b)=>a.t-b.t);window.DUR=TL.DUR;window.TL=TL;

window.render=(t,tap)=>{
 SEED=Math.floor(t*8);K=0;GA=1;M=[1,0,0,1,0,0];stack=[];
 ctx.setTransform(2,0,0,2,0,0);ctx.globalAlpha=1;ctx.fillStyle=PAPER;ctx.fillRect(0,0,W,H);
 const app=document.getElementById('pw'),tp=document.getElementById('tap');let appOn=false;
 if(t<TL.C-.25)sceneA(t);else if(t<TL.D-.25){appScene(t);appOn=t>9.5&&t<15.95}else if(t<TL.E-.25)sceneD(t);else endCard(t);
 wipe(t,1.7,C.orange);wipe(t,TL.C-.1);wipe(t,TL.D-.1,C.green);wipe(t,TL.E-.1,C.orange);
 const g=ctx.createRadialGradient(W/2,H*.45,260,W/2,H/2,760);g.addColorStop(0,'rgba(255,250,235,0)');g.addColorStop(1,'rgba(150,120,80,.2)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=.55;ctx.drawImage(grain,0,0);ctx.globalAlpha=1;
 app.style.visibility=appOn?'visible':'hidden';
 const slide=1-back(span(t,9.55,10.2)),out=ein(span(t,15.4,15.9));app.style.transform=`translateY(${(slide+out)*900}px)`;
 if(tap&&t>=tap.t-.05&&t<tap.t+.35){const k=(t-tap.t)/.35;tp.style.opacity=k<0?0:1-k;tp.style.left=tap.x+'px';tp.style.top=tap.y+'px';tp.style.transform=`scale(${.6+k*.8})`}else tp.style.opacity=0;
};
</script>
