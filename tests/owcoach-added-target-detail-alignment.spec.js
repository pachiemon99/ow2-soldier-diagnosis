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

const targets=[['Junkrat','ダイブ経路'],['Pharah','屋根'],['Echo','スティッキー・ボム'],['Emre','サイバー・フラグ']];
test('added target detail guides are concrete', async({page})=>{ await open(page); await page.locator('.tab').nth(1).click(); await expect(page.locator('#detail')).toHaveClass(/active/); for(const [id,word] of targets){ await page.selectOption('#targetHeroDetail',id); await page.locator('.heroBtn').filter({hasText:'キリコ'}).first().click(); await expect(page.locator('#detailResult')).toContainText(word); await expect(page.locator('#detailResult')).not.toContainText('爆風を置く'); } });
