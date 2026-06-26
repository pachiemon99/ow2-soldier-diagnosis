const { test, expect } = require('@playwright/test');

async function openFresh(page) {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
}

async function openWithLanguage(page, lang) {
  await page.addInitScript((selectedLang) => {
    localStorage.setItem('owcoach_lang', selectedLang);
    localStorage.setItem('owcoach_lang_selected', '1');
  }, lang);
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('#langSelectModal')).not.toBeVisible();
}

async function chooseFromFlagMenu(page, lang) {
  await page.locator('#flagLangBtn').click();
  await expect(page.locator('#flagLangMenu')).toBeVisible();
  await expect(page.locator('#flagLangMenu [data-lang-choice="ja"]')).toContainText('日本語');
  await expect(page.locator('#flagLangMenu [data-lang-choice="en"]')).toContainText('English');
  await page.locator(`#flagLangMenu [data-lang-choice="${lang}"]`).click();
  await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.owLang)).toBe(lang);
}

async function expectLanguageOptionsSelfNamed(page) {
  await expect(page.locator('[data-lang-choice="ja"]').first()).toContainText('日本語');
  await expect(page.locator('[data-lang-choice="en"]').first()).toContainText('English');
  await expect(page.locator('#owLang option[value="ja"]')).toHaveText('日本語');
  await expect(page.locator('#owLang option[value="en"]')).toHaveText('English');
}

async function expectSelectLanguage(page, lang) {
  const snapshot = await page.evaluate(() => ({
    target: [...document.querySelector('#targetHero').options].map(o => o.textContent),
    dps1: [...document.querySelector('#dps1').options].map(o => o.textContent),
    sup1: [...document.querySelector('#sup1').options].map(o => o.textContent)
  }));
  const joined = [...snapshot.target, ...snapshot.dps1, ...snapshot.sup1].join('|');
  if (lang === 'en') {
    expect(joined).toContain('Soldier: 76');
    expect(joined).toContain('Widowmaker');
    expect(joined).toContain('Sombra');
    expect(joined).not.toMatch(/[ぁ-んァ-ン一-龥]/);
  } else {
    expect(joined).toContain('ソルジャー76');
    expect(joined).toContain('ウィドウメイカー');
    expect(joined).toContain('ソンブラ');
  }
}

test('first visit shows language modal with self-named choices', async ({ page }) => {
  await openFresh(page);
  await expect(page.locator('#langSelectModal')).toBeVisible();
  await expect(page.locator('#flagLangControl')).not.toBeVisible();
  await expect(page.locator('#langSelectModal [data-lang-choice="ja"]')).toContainText('日本語');
  await expect(page.locator('#langSelectModal [data-lang-choice="en"]')).toContainText('English');

  await page.locator('#langSelectModal [data-lang-choice="en"]').click();
  await expect(page.locator('#langSelectModal')).not.toBeVisible();
  await expect(page.locator('#flagLangBtn')).toHaveText('🇺🇸');
  await expectLanguageOptionsSelfNamed(page);
});

test('flag menu keeps 日本語 / English labels in both languages', async ({ page }) => {
  await openWithLanguage(page, 'ja');
  await expectLanguageOptionsSelfNamed(page);
  await chooseFromFlagMenu(page, 'en');
  await expect(page.locator('#flagLangBtn')).toHaveText('🇺🇸');
  await expectLanguageOptionsSelfNamed(page);
  await chooseFromFlagMenu(page, 'ja');
  await expect(page.locator('#flagLangBtn')).toHaveText('🇯🇵');
  await expectLanguageOptionsSelfNamed(page);
});

test('language round trips do not mix hero option labels', async ({ page }) => {
  await openWithLanguage(page, 'en');
  await expectSelectLanguage(page, 'en');

  const sequence = ['ja', 'en', 'ja', 'en', 'ja', 'en'];
  for (const lang of sequence) {
    await chooseFromFlagMenu(page, lang);
    await expectLanguageOptionsSelfNamed(page);
    await expectSelectLanguage(page, lang);
  }
});
