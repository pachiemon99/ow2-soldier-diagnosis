const { test, expect } = require('@playwright/test');

const JAPANESE_RE = /[ぁ-んァ-ン一-龥]/;
const ENGLISH_ONLY_TARGET_NAMES = ['Soldier: 76', 'Sojourn', 'Cassidy', 'Ashe', 'Reaper', 'Symmetra', 'Hanzo', 'Torbjörn', 'Bastion', 'Mei', 'Sombra', 'Tracer', 'Genji'];
const JAPANESE_TARGET_NAMES = ['ソルジャー76', 'ソジョーン', 'キャスディ', 'アッシュ', 'リーパー', 'シンメトラ', 'ハンゾー', 'トールビョーン', 'バスティオン', 'メイ', 'ソンブラ', 'トレーサー', 'ゲンジ'];
const LEGACY_MIXED_WORDS = ['Japanese', '有利寄り', '五分寄り', '不利寄り', 'かなり注意', 'かなり厳しい', 'Even-ish', 'High Risk', 'Caution'];

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

async function chooseFromFlagMenu(page, lang) {
  await page.locator('#flagLangBtn').click();
  await expect(page.locator('#flagLangMenu')).toBeVisible();
  await expect(page.locator('#flagLangMenu [data-lang-choice="ja"]')).toContainText('日本語');
  await expect(page.locator('#flagLangMenu [data-lang-choice="en"]')).toContainText('English');
  await page.locator(`#flagLangMenu [data-lang-choice="${lang}"]`).click();
  await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.owLang)).toBe(lang);
  await expect(page.locator('#flagLangMenu')).not.toBeVisible();
}

async function runDiagnosis(page) {
  await page.locator('#comp button.primary').click();
  await expect(page.locator('#result .affinityValue')).toBeVisible();
}

async function openDetail(page, heroId = 'Sombra') {
  await page.locator('.tabs .tab').nth(1).click();
  await expect(page.locator('#detail')).toHaveClass(/active/);
  await page.locator(`[data-hero-id="${heroId}"]`).click();
  await expect(page.locator('#detailResult .card')).toBeVisible();
}

async function assertLanguageSurface(page, lang) {
  await expect(page.locator('#owLang option[value="ja"]')).toHaveText('日本語');
  await expect(page.locator('#owLang option[value="en"]')).toHaveText('English');
  await expect(page.locator('#flagLangBtn')).toHaveText(lang === 'en' ? '🇺🇸' : '🇯🇵');

  const targetTexts = await page.locator('#targetHero option').evaluateAll(options => options.map(option => option.textContent.trim()).filter(Boolean));
  const detailTargetTexts = await page.locator('#targetHeroDetail option').evaluateAll(options => options.map(option => option.textContent.trim()).filter(Boolean));
  const combinedTargetText = [...targetTexts, ...detailTargetTexts].join('|');

  if (lang === 'en') {
    for (const name of ENGLISH_ONLY_TARGET_NAMES) expect(combinedTargetText).toContain(name);
    for (const name of JAPANESE_TARGET_NAMES) expect(combinedTargetText).not.toContain(name);
    expect(combinedTargetText).not.toMatch(JAPANESE_RE);
  } else {
    for (const name of JAPANESE_TARGET_NAMES) expect(combinedTargetText).toContain(name);
    for (const name of ENGLISH_ONLY_TARGET_NAMES) expect(combinedTargetText).not.toContain(name);
  }
}

async function assertDiagnosisLanguage(page, lang) {
  const result = page.locator('#result');
  await expect(result.locator('.affinityValue')).toHaveCount(1);
  const text = await result.textContent();
  if (lang === 'en') {
    expect(text).toContain('Game Plan');
    expect(text).toContain('Matchup');
    expect(text).not.toContain('構成評価');
    expect(text).not.toContain('戦い方');
  } else {
    expect(text).toContain('構成評価');
    expect(text).toContain('戦い方');
    expect(text).not.toContain('Composition Evaluation');
    expect(text).not.toContain('Game Plan');
  }
  for (const legacy of LEGACY_MIXED_WORDS) {
    if (lang === 'ja' && legacy === 'Japanese') continue;
    expect(text).not.toContain(legacy);
  }
}

async function assertDetailLanguage(page, lang) {
  const detail = page.locator('#detailResult');
  await expect(detail.locator('.card')).toHaveCount(1);
  const text = await detail.textContent();
  if (lang === 'en') {
    expect(text).toContain('Matchup Plan');
    expect(text).toContain('Priority Targets');
    expect(text).not.toContain('対面方針');
    expect(text).not.toContain('優先対象');
  } else {
    expect(text).toContain('対面方針');
    expect(text).toContain('優先対象');
    expect(text).not.toContain('Matchup Plan');
    expect(text).not.toContain('Priority Targets');
  }
}

async function assertEnemySlotsRemainUnique(page) {
  const values = await page.evaluate(() => ({
    dps1: document.querySelector('#dps1').value,
    dps2: document.querySelector('#dps2').value,
    sup1: document.querySelector('#sup1').value,
    sup2: document.querySelector('#sup2').value
  }));
  expect(values.dps1).not.toBe(values.dps2);
  expect(values.sup1).not.toBe(values.sup2);
}

async function assertRoundTripState(page, lang) {
  await assertLanguageSurface(page, lang);
  await assertEnemySlotsRemainUnique(page);
  await assertDiagnosisLanguage(page, lang);
  await assertDetailLanguage(page, lang);
}

test.describe('language round-trip endurance', () => {
  test('Japanese -> English -> Japanese endurance keeps diagnosis and detail surfaces clean', async ({ page }) => {
    await openWithLanguage(page, 'ja');
    await page.locator('#targetHero').selectOption('Tracer');
    await runDiagnosis(page);
    await openDetail(page, 'Sombra');
    await assertRoundTripState(page, 'ja');

    const sequence = ['en', 'ja', 'en', 'ja', 'en', 'ja', 'en', 'ja', 'en', 'ja'];
    for (const lang of sequence) {
      await chooseFromFlagMenu(page, lang);
      await assertRoundTripState(page, lang);
    }
  });

  test('English -> Japanese -> English endurance keeps diagnosis and detail surfaces clean', async ({ page }) => {
    await openWithLanguage(page, 'en');
    await page.locator('#targetHero').selectOption('Genji');
    await runDiagnosis(page);
    await openDetail(page, 'Widowmaker');
    await assertRoundTripState(page, 'en');

    const sequence = ['ja', 'en', 'ja', 'en', 'ja', 'en', 'ja', 'en', 'ja', 'en'];
    for (const lang of sequence) {
      await chooseFromFlagMenu(page, lang);
      await assertRoundTripState(page, lang);
    }
  });

  test('corrupted localStorage language value falls back without mixed language UI', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('owcoach_lang', 'pirate');
      localStorage.setItem('owcoach_lang_selected', '1');
    });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect.poll(async () => page.evaluate(() => ['ja', 'en'].includes(document.documentElement.dataset.owLang))).toBe(true);
    const lang = await page.evaluate(() => document.documentElement.dataset.owLang);
    await runDiagnosis(page);
    await openDetail(page, 'Sombra');
    await assertRoundTripState(page, lang);
  });
});
