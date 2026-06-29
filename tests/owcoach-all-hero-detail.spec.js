const { test, expect } = require('@playwright/test');

const BROKEN_OUTPUT_WORDS = ['undefined', 'null', '[object Object]'];
const OLD_BAD_WORDS = ['ストルワート', 'Hard No', 'ja_to_en_verified', '横道', '遮蔽へ切る', '同じダイブ経路'];
const JA_DETAIL_HEADINGS = ['対面方針', '優先対象', '絶対NG'];
const EN_DETAIL_HEADINGS = ['Matchup Plan', 'Priority Targets', 'Avoid'];
const JA_ROLES = ['タンク', 'ダメージ', 'サポート'];
const JA_SUBROLES = ['イニシエーター', 'ブルーザー', 'ストールワート', 'スペシャリスト', 'リコン', 'フランカー', 'シャープシューター', 'タクティシャン', 'メディック', 'サバイバー'];
const EN_ROLES = ['Tank', 'Damage', 'Support'];
const EN_SUBROLES = ['Initiator', 'Bruiser', 'Stalwart', 'Specialist', 'Recon', 'Flanker', 'Sharpshooter', 'Tactician', 'Medic', 'Survivor'];

async function openWithLanguage(page, lang) {
  await page.addInitScript((selectedLang) => {
    localStorage.setItem('owcoach_lang', selectedLang);
    localStorage.setItem('owcoach_lang_selected', '1');
  }, lang);
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('#langSelectModal')).not.toBeVisible();
  await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.owLang)).toBe(lang);
}

async function openDetailTab(page) {
  await page.locator('.tab').nth(1).click();
  await expect(page.locator('#detail')).toHaveClass(/active/);
  await expect(page.locator('#heroGrid .heroBtn').first()).toBeVisible();
}

async function chooseFromFlagMenu(page, lang) {
  await page.locator('#flagLangBtn').click();
  await expect(page.locator('#flagLangMenu')).toBeVisible();
  await expect(page.locator('#flagLangMenu [data-lang-choice="ja"]')).toContainText('日本語');
  await expect(page.locator('#flagLangMenu [data-lang-choice="en"]')).toContainText('English');
  await page.locator(`#flagLangMenu [data-lang-choice="${lang}"]`).click();
  await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.owLang)).toBe(lang);
}

async function getHeroIds(page) {
  return page.locator('#heroGrid .heroBtn').evaluateAll(buttons => buttons.map(button => button.dataset.heroId).filter(Boolean));
}

async function clickHeroById(page, heroId) {
  await page.evaluate((id) => {
    const button = [...document.querySelectorAll('#heroGrid .heroBtn')].find(btn => btn.dataset.heroId === id);
    if (!button) throw new Error(`Hero button not found: ${id}`);
    button.click();
  }, heroId);
  await expect(page.locator('#detailResult .card')).toBeVisible();
  await expect(page.locator('#detailResult h2')).toBeVisible();
}

async function assertNoBrokenOutput(page) {
  const text = await page.locator('#detailResult').innerText();
  for (const word of BROKEN_OUTPUT_WORDS) expect(text).not.toContain(word);
  for (const word of OLD_BAD_WORDS) expect(text).not.toContain(word);
}

async function assertDetailLanguage(page, lang) {
  const text = await page.locator('#detailResult').innerText();
  if (lang === 'en') {
    for (const heading of EN_DETAIL_HEADINGS) expect(text).toContain(heading);
    for (const heading of JA_DETAIL_HEADINGS) expect(text).not.toContain(heading);
    expect(text).not.toMatch(/[ぁ-んァ-ヶ一-龠]/);
  } else {
    for (const heading of JA_DETAIL_HEADINGS) expect(text).toContain(heading);
    for (const heading of EN_DETAIL_HEADINGS) expect(text).not.toContain(heading);
  }
}

async function assertRoleAndSubRolePills(page, lang) {
  const pills = await page.locator('#detailResult .pill').evaluateAll(nodes => nodes.map(node => node.textContent.trim()));
  expect(pills.length).toBeGreaterThanOrEqual(3);
  const allowedRoles = lang === 'en' ? EN_ROLES : JA_ROLES;
  const allowedSubRoles = lang === 'en' ? EN_SUBROLES : JA_SUBROLES;
  expect(pills.some(pill => allowedRoles.includes(pill))).toBe(true);
  expect(pills.some(pill => allowedSubRoles.includes(pill))).toBe(true);
}

async function assertAllHeroButtonsHaveStableIds(page) {
  const report = await page.locator('#heroGrid .heroBtn').evaluateAll(buttons => {
    const ids = buttons.map(button => button.dataset.heroId || '');
    return {
      count: ids.length,
      emptyIds: ids.filter(id => !id).length,
      uniqueCount: new Set(ids).size,
      labels: buttons.map(button => button.textContent.trim()).filter(Boolean)
    };
  });
  expect(report.count).toBe(51);
  expect(report.emptyIds).toBe(0);
  expect(report.uniqueCount).toBe(51);
}

test.describe('all hero detail diagnosis regression', () => {
  for (const lang of ['ja', 'en']) {
    test(`${lang}: every shared hero opens a clean detail diagnosis`, async ({ page }, testInfo) => {
      await openWithLanguage(page, lang);
      await openDetailTab(page);
      await assertAllHeroButtonsHaveStableIds(page);
      const heroIds = await getHeroIds(page);
      expect(heroIds.length).toBe(51);

      for (const heroId of heroIds) {
        await clickHeroById(page, heroId);
        await assertNoBrokenOutput(page);
        await assertDetailLanguage(page, lang);
        await assertRoleAndSubRolePills(page, lang);
      }

      await testInfo.attach(`detail-all-heroes-${lang}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png'
      });
    });
  }

  test('selected detail hero survives repeated language switching without mixed text', async ({ page }) => {
    await openWithLanguage(page, 'en');
    await openDetailTab(page);
    await clickHeroById(page, 'Sombra');
    await assertDetailLanguage(page, 'en');
    await expect(page.locator('#detailResult h2')).toContainText('Sombra');

    const sequence = ['ja', 'en', 'ja', 'en', 'ja', 'en'];
    for (const lang of sequence) {
      await chooseFromFlagMenu(page, lang);
      await expect(page.locator('#detailResult .card')).toBeVisible();
      await assertNoBrokenOutput(page);
      await assertDetailLanguage(page, lang);
      const heading = await page.locator('#detailResult h2').innerText();
      if (lang === 'en') expect(heading).toContain('Sombra');
      else expect(heading).toContain('ソンブラ');
    }
  });

  test('shared hero data has complete id, locale name, role, and official sub-role metadata', async ({ page }) => {
    await openWithLanguage(page, 'ja');
    const report = await page.evaluate(() => {
      const heroes = window.OWCOACH_SHARED_HEROES || [];
      const ids = heroes.map(h => h.hero_id);
      const allowedRoles = ['タンク', 'ダメージ', 'サポート'];
      const allowedSubRoles = ['イニシエーター', 'ブルーザー', 'ストールワート', 'スペシャリスト', 'リコン', 'フランカー', 'シャープシューター', 'タクティシャン', 'メディック', 'サバイバー'];
      return {
        count: heroes.length,
        uniqueCount: new Set(ids).size,
        missingId: heroes.filter(h => !h.hero_id).map(h => h.hero_ja || '(unknown)'),
        missingJa: heroes.filter(h => !h.hero_ja).map(h => h.hero_id || '(unknown)'),
        badRole: heroes.filter(h => !allowedRoles.includes(h.role)).map(h => `${h.hero_id}:${h.role}`),
        badSubRole: heroes.filter(h => !allowedSubRoles.includes(h.sub_role)).map(h => `${h.hero_id}:${h.sub_role}`)
      };
    });
    expect(report.count).toBe(51);
    expect(report.uniqueCount).toBe(51);
    expect(report.missingId).toEqual([]);
    expect(report.missingJa).toEqual([]);
    expect(report.badRole).toEqual([]);
    expect(report.badSubRole).toEqual([]);
  });
});
