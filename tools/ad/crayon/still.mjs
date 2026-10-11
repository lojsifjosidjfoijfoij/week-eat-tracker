import { chromium } from "playwright";
import fs from "node:fs";
const times=(process.env.T||"0.1,1.0,2.2,3.2").split(",").map(Number);
const b=await chromium.launch({executablePath:"/opt/pw-browsers/chromium"});
const p=await b.newPage({viewport:{width:540,height:960},deviceScaleFactor:2});
p.on("console",m=>console.log("console:",m.text()));p.on("pageerror",e=>console.log("ERR",e.message));
await p.goto("http://localhost:4175/crayon.html");
await p.evaluate(async()=>{await Promise.all(["40px Pat","40px Brush","40px Gochi"].map(f=>document.fonts.load(f)));await document.fonts.ready});
fs.mkdirSync("stills",{recursive:true});
for(const t of times){await p.evaluate(t=>window.render(t),t);await p.screenshot({path:`stills/s_${t.toFixed(2)}.png`});}
await b.close();
