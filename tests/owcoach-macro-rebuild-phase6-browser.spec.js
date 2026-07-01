// Covered by Playwright projects: Mobile Safari width and Desktop Chromium.
const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('./static-server.cjs');

let server;
test.beforeAll(async () => { server = await startStaticServer(); });
test.afterAll(async () => { if (server) await server.close(); });

test.setTimeout(120000);

async function open(page, mode = 'quick') {
  await page.addInitScript((resultMode) => {
    localStorage.setItem('owcoach_lang', 'ja');
    localStorage.setItem('owcoach_lang_selected', '1');
    localStorage.setItem('owcoach_result_mode', resultMode);
  }, mode);
  await page.goto(server.url('/index.html'));
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('#langSelectModal')).not.toBeVisible();
  await page.waitForSelector('#targetHero');
}

async function setComp(page, ids) {
  const keys = ['tank', 'dps1', 'dps2', 'sup1', 'sup2'];
  for (let i = 0; i < keys.length; i += 1) {
    await page.selectOption(`#${keys[i]}`, ids[i]);
  }
}

async function runDiagnosis(page, target, comp) {
  await page.selectOption('#targetHero', target);
  await setComp(page, comp);
  await page.evaluate(() => {
    if (typeof window.diagnose !== 'function') throw new Error('diagnose function not found');
    window.diagnose();
  });
  await expect(page.locator('#result')).toContainText('構成評価');
}

async function expectPhaseBlocks(page) {
  const result = page.locator('#result');
  await expect(result).toContainText('完成コア検出 / 5人構成合成');
  await expect(result).toContainText('敵5人の完成形');
  await expect(result).toContainText('切るべき配線');
  await expect(result).toContainText('主勝ち筋 / 副勝ち筋');
  await expect(result).toContainText('敵の勝ち筋');
  await expect(result).toContainText('攻撃優先順位');
  await expect(result).not.toContainText('undefined');
  await expect(result).not.toContainText('null');
  await expect(result).not.toContainText('[object Object]');
}

const cases = [
  {
    label: 'dive trio core',
    target: 'Soldier76',
    comp: ['Winston', 'Tracer', 'Genji', 'Ana', 'Kiriko'],
    expected: ['ウィンストン＋トレーサー＋アナ', 'ダイブ確定コア']
  },
  {
    label: 'rush split core',
    target: 'Ashe',
    comp: ['Reinhardt', 'Reaper', 'Mei', 'Lúcio', 'Kiriko'],
    expected: ['ラインハルト＋メイ＋ルシオ', 'ラッシュ完成コア']
  },
  {
    label: 'bunker sustain core',
    target: 'Sombra',
    comp: ['Sigma', 'Bastion', 'Ashe', 'Baptiste', 'Zenyatta'],
    expected: ['シグマ＋バスティオン＋バティスト', 'ポーク・ピック完成形']
  }
];

test('phase 5 synthesis is visible in all result modes', async ({ page }) => {
  for (const mode of ['quick', 'standard', 'detail']) {
    await open(page, mode);
    await runDiagnosis(page, 'Soldier76', cases[0].comp);
    await expectPhaseBlocks(page);
    await expect(page.locator('#result')).toContainText('ウィンストン＋トレーサー＋アナ');
    await expect(page.locator('#result')).toContainText('ダイブ確定コア');
  }
});

for (const item of cases) {
  test(`phase 6 browser qa detects ${item.label}`, async ({ page }) => {
    await open(page, 'standard');
    await runDiagnosis(page, item.target, item.comp);
    await expectPhaseBlocks(page);
    for (const text of item.expected) {
      await expect(page.locator('#result')).toContainText(text);
    }
  });
}

test('phase 4 detail surface stays visible after phase 5 synthesis', async ({ page }) => {
  await open(page, 'standard');
  await runDiagnosis(page, 'Cassidy', cases[0].comp);
  await page.locator('.tab').nth(1).click();
  await expect(page.locator('#detail')).toHaveClass(/active/);
  await page.locator('.heroBtn').filter({ hasText: 'ウィンストン' }).first().click();
  const detail = page.locator('#detailResult');
  await expect(detail).toContainText('構成内の役割');
  await expect(detail).toContainText('安全な席');
  await expect(detail).toContainText('先に止める線');
  await expect(detail).toContainText('成立役・シナジー確認');
  await expect(detail).not.toContainText('undefined');
  await expect(detail).not.toContainText('[object Object]');
});
