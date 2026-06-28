const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('./static-server.cjs');
let server;
test.beforeAll(async()=>{ server = await startStaticServer(); });
test.afterAll(async()=>{ if(server) await server.close(); });
async function open(page){
  await page.addInitScript(() => {
    localStorage.setItem('owcoach_lang', 'ja');
    localStorage.setItem('owcoach_lang_selected', '1');
  });
  await page.goto(server.url('/index.html'));
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('#langSelectModal')).not.toBeVisible();
  await page.waitForSelector('#targetHero');
}
async function setComp(page, ids){ const keys=['tank','dps1','dps2','sup1','sup2']; for(let i=0;i<keys.length;i++){ await page.selectOption('#'+keys[i], ids[i]); } }

test('synergy block renders main and secondary synergy', async({page})=>{ await open(page); await page.selectOption('#targetHero','Soldier76'); await setComp(page,['Winston','Tracer','Genji','Kiriko','Lifeweaver']); await page.click('text=構成を診断する'); await expect(page.locator('#result')).toContainText('構成の勝ち筋'); await expect(page.locator('#result')).toContainText('主シナジー：'); await expect(page.locator('#result')).toContainText('敵5人を1人ずつの対面として読まない'); });
