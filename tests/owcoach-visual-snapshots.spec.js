const { test, expect } = require('@playwright/test');
const fs = require('fs/promises');
const path = require('path');

const TARGET_SNAPSHOT_IDS = [
  'Soldier76', 'Sojourn', 'Cassidy', 'Ashe', 'Reaper',
  'Symmetra', 'Hanzo', 'Torbjorn', 'Bastion', 'Mei', 'Sombra', 'Tracer', 'Genji'
];

function safeName(name) {
  return String(name).replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
}

async function openFresh(page) {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
}

async function openWithLanguage(page, lang, url = '/') {
  await page.addInitScript((selectedLang) => {
    localStorage.setItem('owcoach_lang', selectedLang);
    localStorage.setItem('owcoach_lang_selected', '1');
  }, lang);
  await page.goto(url);
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('#langSelectModal')).not.toBeVisible();
  await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.owLang)).toBe(lang);
}

async function chooseFromFlagMenu(page, lang) {
  await page.locator('#flagLangBtn').click();
  await expect(page.locator('#flagLangMenu')).toBeVisible();
  await expect(page.locator('#flagLangMenu [data-lang-choice="ja"]')).toContainText('日本語');
  await expect(page.locator('#flagLangMenu [data-lang-choice="en"]')).toContainText('English');
  await page.locator(`#flagLangMenu [data-lang-choice="${lang}"]`).click();
  await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.owLang)).toBe(lang);
}

async function diagnoseCurrent(page) {
  await page.locator('button.primary').click();
  await expect(page.locator('#result .card')).toBeVisible();
  await expect(page.locator('#result .affinityValue')).toBeVisible();
}

async function openDetailTab(page) {
  await page.locator('.tab').nth(1).click();
  await expect(page.locator('#detail')).toHaveClass(/active/);
  await expect(page.locator('#heroGrid .heroBtn').first()).toBeVisible();
}

async function clickHeroById(page, heroId) {
  await page.evaluate((id) => {
    const button = [...document.querySelectorAll('#heroGrid .heroBtn')].find(btn => btn.dataset.heroId === id);
    if (!button) throw new Error(`Hero button not found: ${id}`);
    button.click();
  }, heroId);
  await expect(page.locator('#detailResult .card')).toBeVisible();
}

async function ensureNoHorizontalOverflow(page) {
  const dims = await page.evaluate(() => ({
    width: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth
  }));
  expect(Math.max(dims.scrollWidth, dims.bodyScrollWidth)).toBeLessThanOrEqual(dims.width + 2);
}

async function saveSnapshot(page, testInfo, name, options = {}) {
  const project = safeName(testInfo.project.name || 'default');
  const fileName = `${project}-${safeName(name)}.png`;
  const dir = path.join(process.cwd(), 'visual-snapshots');
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, fileName);
  await page.screenshot({ path: filePath, fullPage: options.fullPage !== false });
  await testInfo.attach(name, { path: filePath, contentType: 'image/png' });
  return filePath;
}

async function expectLanguageOptionsSelfNamed(page) {
  await expect(page.locator('[data-lang-choice="ja"]').first()).toContainText('日本語');
  await expect(page.locator('[data-lang-choice="en"]').first()).toContainText('English');
  await expect(page.locator('#owLang option[value="ja"]')).toHaveText('日本語');
  await expect(page.locator('#owLang option[value="en"]')).toHaveText('English');
}

test.describe('visual snapshot artifacts for UI regression review', () => {
  test('captures first-visit modal and language menu states', async ({ page }, testInfo) => {
    await openFresh(page);
    await expect(page.locator('#langSelectModal')).toBeVisible();
    await expect(page.locator('#langSelectModal [data-lang-choice="ja"]')).toContainText('日本語');
    await expect(page.locator('#langSelectModal [data-lang-choice="en"]')).toContainText('English');
    await saveSnapshot(page, testInfo, '01-first-visit-language-modal');

    await page.locator('#langSelectModal [data-lang-choice="ja"]').click();
    await expect(page.locator('#langSelectModal')).not.toBeVisible();
    await expect(page.locator('#flagLangBtn')).toHaveText('🇯🇵');
    await expectLanguageOptionsSelfNamed(page);
    await saveSnapshot(page, testInfo, '02-ja-main-after-first-choice');

    await page.locator('#flagLangBtn').click();
    await expect(page.locator('#flagLangMenu')).toBeVisible();
    await expectLanguageOptionsSelfNamed(page);
    await ensureNoHorizontalOverflow(page);
    await saveSnapshot(page, testInfo, '03-ja-flag-language-menu', { fullPage: false });
  });

  test('captures English mobile diagnosis, sticky header, and KPI compact state', async ({ page }, testInfo) => {
    await openWithLanguage(page, 'en');
    await page.locator('#targetHero').selectOption('Soldier76');
    await diagnoseCurrent(page);
    await expect(page.locator('#result .compactPlan')).toBeVisible();
    await expect(page.locator('#result .compactPlan')).not.toContainText(/should|because|while|when/i);
    await ensureNoHorizontalOverflow(page);
    await saveSnapshot(page, testInfo, '04-en-main-diagnosis-soldier-mobile');

    await page.evaluate(() => window.scrollTo(0, 520));
    await expect.poll(async () => page.locator('header').evaluate((header) => Math.round(header.getBoundingClientRect().top))).toBe(0);
    await saveSnapshot(page, testInfo, '05-en-sticky-header-after-scroll', { fullPage: false });

    await page.locator('#flagLangBtn').click();
    await expect(page.locator('#flagLangMenu')).toBeVisible();
    await ensureNoHorizontalOverflow(page);
    await saveSnapshot(page, testInfo, '06-en-flag-menu-in-viewport', { fullPage: false });
  });

  test('captures target diagnosis snapshots for every diagnosable hero', async ({ page }, testInfo) => {
    await openWithLanguage(page, 'en');
    const ids = await page.locator('#targetHero option').evaluateAll(options => options.map(option => option.value).filter(Boolean));
    expect(ids).toEqual(TARGET_SNAPSHOT_IDS);

    for (const id of ids) {
      await page.locator('#targetHero').selectOption(id);
      await page.evaluate(() => document.querySelector('#targetHero').dispatchEvent(new Event('change', { bubbles: true })));
      await diagnoseCurrent(page);
      await expect(page.locator('#result .compactPlan')).toBeVisible();
      await ensureNoHorizontalOverflow(page);
      await saveSnapshot(page, testInfo, `07-target-diagnosis-${id}`, { fullPage: false });
    }
  });

  test('captures detail diagnosis before and after language switching', async ({ page }, testInfo) => {
    await openWithLanguage(page, 'ja');
    await openDetailTab(page);
    await clickHeroById(page, 'Sombra');
    await expect(page.locator('#detailResult h2')).toContainText('ソンブラ');
    await ensureNoHorizontalOverflow(page);
    await saveSnapshot(page, testInfo, '08-ja-detail-sombra');

    await chooseFromFlagMenu(page, 'en');
    await expect(page.locator('#detailResult h2')).toContainText('Sombra');
    await ensureNoHorizontalOverflow(page);
    await saveSnapshot(page, testInfo, '09-en-detail-sombra-after-switch');
  });

  for (const policy of [
    { path: '/notices.html', name: 'notices' },
    { path: '/terms.html', name: 'terms' },
    { path: '/privacy.html', name: 'privacy' },
    { path: '/tokusho.html', name: 'tokusho' }
  ]) {
    test(`captures policy page language UI: ${policy.name}`, async ({ page }, testInfo) => {
      await openWithLanguage(page, 'en', policy.path);
      await expect(page.locator('#flagLangBtn')).toHaveText('🇺🇸');
      await expectLanguageOptionsSelfNamed(page);
      await ensureNoHorizontalOverflow(page);
      await saveSnapshot(page, testInfo, `10-policy-${policy.name}-english`);

      await chooseFromFlagMenu(page, 'ja');
      await expect(page.locator('#flagLangBtn')).toHaveText('🇯🇵');
      await expectLanguageOptionsSelfNamed(page);
      await saveSnapshot(page, testInfo, `13-policy-${policy.name}-japanese`);
    });
  }
});
