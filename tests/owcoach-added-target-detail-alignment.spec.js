const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('./static-server.cjs');
let server;
test.beforeAll(async()=>{ server = await startStaticServer(); });
test.afterAll(async()=>{ if(server) await server.close(); });
async function open(page){ await page.goto(server.url('/index.html')); await page.waitForSelector('#targetHero'); }
async function setComp(page, ids){ const keys=['tank','dps1','dps2','sup1','sup2']; for(let i=0;i<keys.length;i++){ await page.selectOption('#'+keys[i], ids[i]); } }

const targets=[['Junkrat','入口'],['Pharah','屋根'],['Echo','スティッキー・ボム'],['Emre','サイバー・フラグ']];
test('added target detail guides are concrete', async({page})=>{ await open(page); for(const [id,word] of targets){ await page.selectOption('#targetHeroDetail',id); await page.locator('.heroBtn').filter({hasText:'キリコ'}).first().click(); await expect(page.locator('#detailResult')).toContainText(word); await expect(page.locator('#detailResult')).not.toContainText('爆風を置く'); } });
