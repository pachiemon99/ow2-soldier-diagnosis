const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('./static-server.cjs');
let server;
test.beforeAll(async()=>{ server = await startStaticServer(); });
test.afterAll(async()=>{ if(server) await server.close(); });
async function open(page){ await page.goto(server.url('/index.html')); await page.waitForSelector('#targetHero'); }
async function setComp(page, ids){ const keys=['tank','dps1','dps2','sup1','sup2']; for(let i=0;i<keys.length;i++){ await page.selectOption('#'+keys[i], ids[i]); } }

const comps=[['Winston','Tracer','Genji','Kiriko','Lifeweaver'],['Sigma','Ashe','Pharah','Mercy','Zenyatta'],['Sigma','Tracer','Sombra','Ana','Zenyatta'],['Reinhardt','Reaper','Mei','Lúcio','Kiriko'],['Orisa','Sojourn','Hanzo','Ana','Lifeweaver'],['Zarya','Cassidy','Hanzo','Kiriko','Lifeweaver'],['Zarya','Soldier: 76','Hanzo','Ana','Lúcio']];
const targets=['Soldier76','Sojourn','Cassidy','Ashe','Reaper','Symmetra','Hanzo','Torbjorn','Bastion','Mei','Sombra','Tracer','Genji','Junkrat','Pharah','Echo','Emre'];
test('17 targets by 7 compositions render without broken output', async({page})=>{ await open(page); for(const target of targets){ await page.selectOption('#targetHero',target); for(const comp of comps){ await setComp(page,comp); await page.click('text=構成を診断する'); const txt=await page.locator('#result').innerText(); expect(txt).toContain('構成の勝ち筋'); expect(txt).not.toMatch(/undefined|null|\[object Object\]|NaN|該当なし/); } } });
