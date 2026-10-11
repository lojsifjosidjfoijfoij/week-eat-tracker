import { chromium } from "playwright";
import fs from "node:fs";
import { makeBackend, fakeSession } from "../../e2e/mock.mjs";
const FPS=30,OUT=process.env.OUT||"frames2",ONLY=process.env.ONLY?process.env.ONLY.split(",").map(Number):null;
fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
const FID="f1";
const backend=makeBackend({family:{id:FID,name:"Family",code:"AB7KQ9ZP",owner_id:"u1"},premium:{self:true,family:true}});
backend.state.members=[{user_id:"u1",email:"louis@example.com",name:"Louis",is_owner:true},{user_id:"u2",email:"mom@example.com",name:"Mom",is_owner:false},{user_id:"u3",email:"dad@example.com",name:"Dad",is_owner:false}];
const MEALS=["Tacos","Lasagna","Chicken curry","Salmon & potatoes","Pizza night","Pesto pasta","Roast chicken"];
let created=Date.parse("2026-10-07T15:00:00Z");
const item=(name,day)=>({id:`it-${name}-${day}`.replace(/\W+/g,"-"),family_id:FID,day_index:day,name,checked:false,created_at:new Date(created+=1000).toISOString()});
const BATCHES=[[["Tomatoes",1],["Onion",1],["Avocado",0],["Ground beef",1],["Lasagna sheets",1],["Mozzarella",1]],[["Tortillas",0],["Sour cream",0]],[["Coconut milk",2],["Curry paste",2],["Rice",2]]];
const browser=await chromium.launch({executablePath:process.env.CHROMIUM||"/opt/pw-browsers/chromium"});
const ctx=await browser.newContext({viewport:{width:540,height:960},deviceScaleFactor:2,locale:"en-US"});
await ctx.route(/supabase\.co/,r=>backend.handle(r));
await ctx.addInitScript(([s])=>{if(location.port==="4173"){localStorage.setItem("sb-exfsipwxedgvlhsmfrub-auth-token",JSON.stringify(s));localStorage.setItem("mealweek-language","en");localStorage.setItem("onboarding_done","true");localStorage.setItem("dinrr:shoppingSort","aisle");localStorage.removeItem("dinrr:aisleOverrides")}},[fakeSession()]);
const page=await ctx.newPage();
page.on("pageerror",e=>console.log("ERR",e.message));
await page.clock.setFixedTime(new Date("2026-10-12T08:00:00"));
await page.goto("http://localhost:4175/crayon2.html");
const app=page.frameLocator("#app"),appFrame=()=>page.frames().find(f=>f.url().startsWith("http://localhost:4173"));
await app.locator(".bottom-bar__family").waitFor({state:"attached"});
await page.evaluate(async()=>{await Promise.all(["40px Pat","40px Brush"].map(f=>document.fonts.load(f)));await document.fonts.ready});
await appFrame().evaluate(()=>document.fonts.ready);await page.waitForTimeout(500);
fs.writeFileSync("sfx2.json",JSON.stringify(await page.evaluate(()=>window.SFX),null,1));
const DUR=await page.evaluate(()=>window.DUR);
await appFrame().evaluate(()=>{const st=document.createElement("style");st.textContent=`@keyframes adPop{0%{transform:scale(.96);background:#EBF2E2}55%{transform:scale(1.015);background:#EBF2E2}100%{transform:none}}.week-row.ad-pop{animation:adPop .55s cubic-bezier(.22,1,.36,1)}.shop-row.ad-in{animation:fadeUp .38s cubic-bezier(.22,1,.36,1) both}`;document.head.appendChild(st)});
async function stagePoint(sel){const r=await app.locator(sel).first().evaluate(el=>{const b=el.getBoundingClientRect();return{x:b.left+b.width/2,y:b.top+b.height/2}});return{x:95+r.x*.897,y:102+r.y*.897}}
const refresh=async()=>{await appFrame().evaluate(()=>window.dispatchEvent(new Event("online")))};
let tap=null;const actions=[];const at=(t,run)=>actions.push({t,run});
const E0=15.6;
MEALS.forEach((meal,d)=>{const t=E0+d*.34;at(t,async()=>{backend.db.meal_plans.push({id:`m${d}`,family_id:FID,day_index:d,meal});await refresh();for(let k=0;k<40;k++){if((await app.locator(".week-row").nth(d).textContent()).includes(meal))break;await page.waitForTimeout(25)}await app.locator(".week-row").nth(d).evaluate(el=>{el.classList.remove("ad-pop");void el.offsetWidth;el.classList.add("ad-pop")})})});
const taps=[{t:18.2,sel:".shop-btn"},{t:19.95,sel:'.shop-row__main:has-text("Tomatoes")'},{t:20.3,sel:'.shop-row__main:has-text("Mozzarella")'}];
for(const k of taps){at(k.t-.25,async()=>{tap={t:k.t,...(await stagePoint(k.sel))}});at(k.t,()=>app.locator(k.sel).first().dispatchEvent("click"))}
[18.55,19.0,19.4].forEach((t,b)=>at(t,async()=>{const before=await app.locator(".shop-row").count();BATCHES[b].forEach(([n,d])=>backend.db.ingredients.push(item(n,d)));await refresh();for(let k=0;k<40;k++){if((await app.locator(".shop-row").count())>before)break;await page.waitForTimeout(25)}await page.waitForTimeout(80);const names=BATCHES[b].map(x=>x[0]);await appFrame().evaluate(names=>{document.querySelectorAll(".shop-row").forEach(row=>{const n=row.querySelector(".shop-row__name")?.textContent?.trim();if(names.includes(n)&&!row.dataset.adSeen){row.dataset.adSeen="1";row.classList.add("ad-in")}})},names)}));
actions.sort((a,b)=>a.t-b.t);
const seek=async ms=>{await appFrame().evaluate(async vt=>{await new Promise(r=>requestAnimationFrame(()=>r()));for(const a of document.getAnimations()){if(a.__s===undefined)a.__s=vt;a.pause();a.currentTime=Math.max(0,vt-a.__s)}},ms)};
const N=Math.round(DUR*FPS);let next=0;const t0=Date.now();
for(let f=0;f<N;f++){const t=f/FPS;
 while(next<actions.length&&actions[next].t<=t+1e-6){await actions[next].run();next++}
 if(t>=14.3&&t<21.3)await seek(t*1000);
 if(ONLY&&!ONLY.some(x=>Math.abs(x-t)<.5/FPS))continue;
 await page.evaluate(([t,tap])=>window.render(t,tap),[t,tap]);
 await page.screenshot({path:`${OUT}/${String(f).padStart(5,"0")}.png`});
 if(f%60==0)console.log(`frame ${f}/${N} t=${t.toFixed(2)} (${((Date.now()-t0)/1000).toFixed(0)}s)`)}
console.log("done");await browser.close();
