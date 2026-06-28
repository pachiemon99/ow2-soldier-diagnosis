const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('./static-server.cjs');
let server;
test.beforeAll(async()=>{ server = await startStaticServer(); });
test.afterAll(async()=>{ if(server) await server.close(); });
async function open(page){ await page.goto(server.url('/index.html')); await page.waitForSelector('#targetHero'); }
async function setComp(page, ids){ const keys=['tank','dps1','dps2','sup1','sup2']; for(let i=0;i<keys.length;i++){ await page.selectOption('#'+keys[i], ids[i]); } }

const targets=[['Junkrat','フラグ・ランチャー'],['Pharah','ロケット'],['Echo','スティッキー・ボム'],['Emre','サイバー・フラグ']];
test('added targets show unique synergy role lines', async({page})=>{ await open(page); await setComp(page,['Winston','Tracer','Genji','Kiriko','Lifeweaver']); for(const [id,skill] of targets){ await page.selectOption('#targetHero',id); await page.click('text=構成を診断する'); await expect(page.locator('#result')).toContainText('自分の役割'); await expect(page.locator('#result')).toContainText(skill); } });
