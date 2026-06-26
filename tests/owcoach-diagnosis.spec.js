const { test, expect } = require('@playwright/test');

const ALLOWED_AFFINITY_JA = ['有利', 'やや有利', '五分', 'やや不利', '不利'];
const ALLOWED_AFFINITY_EN = ['Favored', 'Slightly Favored', 'Even', 'Slightly Unfavored', 'Unfavored'];
const LEGACY_AFFINITY_WORDS = ['有利寄り', '五分寄り', '不利寄り', 'かなり注意', 'かなり厳しい', 'Caution', 'High Risk', 'Even-ish'];

async function openWithLanguage(page, lang) {
  await page.addInitScript((selectedLang) => {
    localStorage.setItem('owcoach_lang', selectedLang);
    localStorage.setItem('owcoach_lang_selected', '1');
  }, lang);
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('#langSelectModal')).not.toBeVisible();
}

async function diagnoseCurrent(page) {
  await page.locator('button.primary').click();
  await expect(page.locator('#result .affinityValue')).toBeVisible();
}

async function chooseFromFlagMenu(page, lang) {
  await page.locator('#flagLangBtn').click();
  await page.locator(`#flagLangMenu [data-lang-choice="${lang}"]`).click();
  await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.owLang)).toBe(lang);
}

async function targetIds(page) {
  return page.locator('#targetHero option').evaluateAll(options => options.map(option => option.value).filter(Boolean));
}

async function assertAffinityIsFiveStage(page, lang) {
  const affinity = (await page.locator('#result .affinityValue').first().innerText()).trim();
  expect(lang === 'en' ? ALLOWED_AFFINITY_EN : ALLOWED_AFFINITY_JA).toContain(affinity);
  const resultText = await page.locator('#result').innerText();
  for (const legacy of LEGACY_AFFINITY_WORDS) {
    expect(resultText).not.toContain(legacy);
  }
}

async function assertEnemyUnique(page) {
  const values = await page.evaluate(() => ({
    dps1: document.querySelector('#dps1').value,
    dps2: document.querySelector('#dps2').value,
    sup1: document.querySelector('#sup1').value,
    sup2: document.querySelector('#sup2').value,
    dps2DisabledForDps1: [...document.querySelector('#dps2').options].find(o => o.value === document.querySelector('#dps1').value)?.disabled === true,
    dps1DisabledForDps2: [...document.querySelector('#dps1').options].find(o => o.value === document.querySelector('#dps2').value)?.disabled === true,
    sup2DisabledForSup1: [...document.querySelector('#sup2').options].find(o => o.value === document.querySelector('#sup1').value)?.disabled === true,
    sup1DisabledForSup2: [...document.querySelector('#sup1').options].find(o => o.value === document.querySelector('#sup2').value)?.disabled === true
  }));
  expect(values.dps1).not.toBe(values.dps2);
  expect(values.sup1).not.toBe(values.sup2);
  expect(values.dps2DisabledForDps1).toBe(true);
  expect(values.dps1DisabledForDps2).toBe(true);
  expect(values.sup2DisabledForSup1).toBe(true);
  expect(values.sup1DisabledForSup2).toBe(true);
}

test('initial enemy damage/support slots are unique and duplicate attempts auto-correct', async ({ page }) => {
  await openWithLanguage(page, 'ja');
  await assertEnemyUnique(page);

  await page.evaluate(() => {
    const dps1 = document.querySelector('#dps1').value;
    const dps2 = document.querySelector('#dps2');
    dps2.value = dps1;
    dps2.dispatchEvent(new Event('change', { bubbles: true }));

    const sup1 = document.querySelector('#sup1').value;
    const sup2 = document.querySelector('#sup2');
    sup2.value = sup1;
    sup2.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect.poll(async () => page.evaluate(() => document.querySelector('#dps1').value !== document.querySelector('#dps2').value)).toBe(true);
  await expect.poll(async () => page.evaluate(() => document.querySelector('#sup1').value !== document.querySelector('#sup2').value)).toBe(true);
  await assertEnemyUnique(page);
});

test('all diagnosable heroes render composition diagnosis with five-stage affinity in Japanese and English', async ({ page }) => {
  await openWithLanguage(page, 'ja');
  const ids = await targetIds(page);
  expect(ids.length).toBe(10);

  for (const lang of ['ja', 'en']) {
    if (lang === 'en') await chooseFromFlagMenu(page, 'en');
    for (const id of ids) {
      await page.locator('#targetHero').selectOption(id);
      await page.evaluate(() => document.querySelector('#targetHero').dispatchEvent(new Event('change', { bubbles: true })));
      await assertEnemyUnique(page);
      await diagnoseCurrent(page);
      await assertAffinityIsFiveStage(page, lang);
    }
  }
});

test('diagnosis output re-renders cleanly after repeated language switching', async ({ page }) => {
  await openWithLanguage(page, 'en');
  await page.locator('#targetHero').selectOption('Soldier76');
  await diagnoseCurrent(page);
  await assertAffinityIsFiveStage(page, 'en');

  const sequence = ['ja', 'en', 'ja', 'en', 'ja', 'en'];
  for (const lang of sequence) {
    await chooseFromFlagMenu(page, lang);
    await diagnoseCurrent(page);
    await assertAffinityIsFiveStage(page, lang);
    const text = await page.locator('#result').innerText();
    if (lang === 'en') {
      expect(text).toContain('Game Plan');
      expect(text).not.toContain('戦い方');
    } else {
      expect(text).toContain('戦い方');
    }
  }
});
