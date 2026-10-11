import { chromium } from "playwright";
import fs from "node:fs";
const FPS=30,OUT="frames";
fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({executablePath:"/opt/pw-browsers/chromium"});
const p=await b.newPage({viewport:{width:540,height:960},deviceScaleFactor:2});
p.on("pageerror",e=>console.log("ERR",e.message));
await p.goto("http://localhost:4175/crayon.html");
await p.evaluate(async()=>{await Promise.all(["40px Pat","40px Brush"].map(f=>document.fonts.load(f)));await document.fonts.ready});
const DUR=await p.evaluate(()=>window.DUR);
fs.writeFileSync("sfx.json",JSON.stringify(await p.evaluate(()=>window.SFX),null,1));
const N=Math.round(DUR*FPS),t0=Date.now();
for(let f=0;f<N;f++){await p.evaluate(t=>window.render(t),f/FPS);await p.screenshot({path:`${OUT}/${String(f).padStart(5,"0")}.png`});if(f%60==0)console.log(`frame ${f}/${N} ${((Date.now()-t0)/1000).toFixed(0)}s`)}
console.log("done");await b.close();
