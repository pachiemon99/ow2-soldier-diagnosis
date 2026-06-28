const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('./static-server.cjs');
let server;
test.beforeAll(async()=>{ server = await startStaticServer(); });
test.afterAll(async()=>{ if(server) await server.close(); });
async function open(page){ await page.goto(server.url('/index.html')); await page.waitForSelector('#targetHero'); }
async function setComp(page, ids){ const keys=['tank','dps1','dps2','sup1','sup2']; for(let i=0;i<keys.length;i++){ await page.selectOption('#'+keys[i], ids[i]); } }

test('english synergy render includes main secondary and role', async({page})=>{ await open(page); await page.evaluate(()=>{ localStorage.setItem('owcoach_lang','en'); localStorage.setItem('owcoach_lang_selected','1'); location.reload(); }); await page.waitForSelector('#targetHero'); await page.selectOption('#targetHero','Pharah'); await setComp(page,['Sigma','Ashe','Pharah','Mercy','Zenyatta']); await page.click('text=Check Composition'); await expect(page.locator('#result')).toContainText('Win Condition'); await expect(page.locator('#result')).toContainText('Main Synergy:'); await expect(page.locator('#result')).toContainText('Secondary Synergy:'); await expect(page.locator('#result')).toContainText('Your Role:'); });
