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

const cases=[{comp:['Winston','Tracer','Ashe','Kiriko','Lifeweaver'],want:'ダイブ救助構成'},{comp:['Orisa','Sojourn','Hanzo','Ana','Lifeweaver'],want:'高耐久継戦構成'},{comp:['Zarya','Cassidy','Hanzo','Kiriko','Lifeweaver'],want:'救助継戦構成'},{comp:['Zarya','Soldier: 76','Hanzo','Ana','Lúcio'],want:'バランス構成'},{comp:['Sigma','Ashe','Pharah','Mercy','Zenyatta'],want:'長射線＋空中圧力構成'},{comp:['Sigma','Tracer','Sombra','Ana','Zenyatta'],want:'分断射線構成'},{comp:['Reinhardt','Reaper','Mei','Lúcio','Kiriko'],want:'ラッシュ継戦構成'}];
test('representative comps classify expected main synergy', async({page})=>{ await open(page); for(const c of cases){ await setComp(page,c.comp); await page.click('text=構成を診断する'); await expect(page.locator('#result')).toContainText(c.want); } });
