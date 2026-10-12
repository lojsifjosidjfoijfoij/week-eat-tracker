import { chromium } from "playwright";
import fs from "node:fs";
import { makeBackend, fakeSession } from "../../e2e/mock.mjs";
const FPS=30,OUT=process.env.OUT||"frames4",ONLY=process.env.ONLY?process.env.ONLY.split(",").map(Number):null;
fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
const FID="f1";
const backend=makeBackend({family:{id:FID,name:"Family",code:"AB7KQ9ZP",owner_id:"u1"},premium:{self:true,family:true}});
backend.state.members=[{user_id:"u1",email:"louis@example.com",name:"Louis",is_owner:true},{user_id:"u2",email:"mom@example.com",name:"Mom",is_owner:false},{user_id:"u3",email:"dad@example.com",name:"Dad",is_owner:false}];
const MEALS=["Pasta bolognese","Tacos","Pancakes","Fish & potatoes","Pizza night"];
MEALS.forEach((meal,d)=>backend.db.meal_plans.push({id:`m${d}`,family_id:FID,day_index:d,meal}));
let created=Date.parse("2026-10-11T15:00:00Z");
const item=(name,day)=>({id:`it-${name}-${day}`.replace(/\W+/g,"-"),family_id:FID,day_index:day,name,checked:false,created_at:new Date(created+=1000).toISOString()});
[["Pasta",0],["Minced beef",0],["Tomatoes",0],["Onion",0],["Tortillas",1],["Cheese",1],["Avocado",1],["Eggs",2],["Milk",2],["Flour",2],["Cheese",4],["Flour",4],["Bananas",7],["Coffee",7]].forEach(([n,d])=>backend.db.ingredients.push(item(n,d)));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM||"/opt/pw-browsers/chromium"});
const ctx=await browser.newContext({viewport:{width:540,height:960},deviceScaleFactor:2,locale:"en-US"});
await ctx.route(/supabase\.co/,r=>backend.handle(r));
await ctx.addInitScript(([s])=>{if(location.port==="4173"){localStorage.setItem("sb-exfsipwxedgvlhsmfrub-auth-token",JSON.stringify(s));localStorage.setItem("mealweek-language","en");localStorage.setItem("onboarding_done","true");localStorage.setItem("dinrr:shoppingSort","aisle");localStorage.removeItem("dinrr:aisleOverrides")}},[fakeSession()]);
const page=await ctx.newPage();
page.on("pageerror",e=>console.log("ERR",e.message));
await page.clock.setFixedTime(new Date("2026-10-12T08:00:00"));
await page.goto(`http://localhost:4175/${process.env.PAGE||"crayon4.html"}`);
const app=page.frameLocator("#app"),appFrame=()=>page.frames().find(f=>f.url().startsWith("http://localhost:4173"));
await app.locator(".bottom-bar__family").waitFor({state:"attached"});
await page.evaluate(async()=>{await Promise.all(["40px Pat","40px Brush"].map(f=>document.fonts.load(f)));await document.fonts.ready});
await appFrame().evaluate(()=>document.fonts.ready);await page.waitForTimeout(800);
fs.writeFileSync("sfx4.json",JSON.stringify(await page.evaluate(()=>window.SFX),null,1));
const DUR=await page.evaluate(()=>window.DUR);
async function stagePoint(sel){const r=await app.locator(sel).first().evaluate(el=>{const b=el.getBoundingClientRect();return{x:b.left+b.width/2,y:b.top+b.height/2}});return{x:95+r.x*.897,y:102+r.y*.897}}
let tap=null;const actions=[];const at=(t,run)=>actions.push({t,run});
const taps=[{t:13.75,sel:".shop-btn"},{t:14.4,name:"Milk"},{t:15.1,name:"Pasta"},{t:15.8,name:"Eggs"},{t:16.5,name:"Bananas"},{t:17.2,name:"Cheese"}];
for(const k of taps){const sel=k.sel||`.shop-row:not(.is-checked) .shop-row__main:has(.shop-row__name:text-is("${k.name}"))`;
 at(k.t-.25,async()=>{tap={t:k.t,...(await stagePoint(sel))}});at(k.t,()=>app.locator(sel).first().dispatchEvent("click"))}
actions.sort((a,b)=>a.t-b.t);
const seek=async ms=>{await appFrame().evaluate(async vt=>{await new Promise(r=>requestAnimationFrame(()=>r()));for(const a of document.getAnimations()){if(a.__s===undefined)a.__s=vt;a.pause();a.currentTime=Math.max(0,vt-a.__s)}},ms)};
const N=Math.round(DUR*FPS);let next=0;const t0=Date.now();
for(let f=0;f<N;f++){const t=f/FPS;
 while(next<actions.length&&actions[next].t<=t+1e-6){await actions[next].run();next++}
 if(t>=12.9&&t<19.3)await seek(t*1000);
 if(ONLY&&!ONLY.some(x=>Math.abs(x-t)<.5/FPS))continue;
 await page.evaluate(([t,tap])=>window.render(t,tap),[t,tap]);
 await page.screenshot({path:`${OUT}/${ONLY?"s_"+t.toFixed(2):String(f).padStart(5,"0")}.png`});
 if(f%60==0)console.log(`frame ${f}/${N} t=${t.toFixed(2)} (${((Date.now()-t0)/1000).toFixed(0)}s)`)}
console.log("done");await browser.close();
