const { test, expect } = require('@playwright/test');

const POLICY_PAGES = ['/notices.html', '/terms.html', '/privacy.html', '/tokusho.html'];
const INVALID_LANG_VALUES = ['', 'jp', 'JA', 'english', 'fr', 'null', 'undefined', '__proto__', '<script>alert(1)</script>'];
const INVALID_SELECTED_VALUES = ['', '0', 'true', 'false', 'yes', 'ja', 'en', 'undefined', 'null', '<script>1</script>'];
const BROKEN_OUTPUT_WORDS = ['undefined', 'null', '[object Object]', 'NaN'];

async function setStorageBeforeLoad(page, entries) {
  await page.addInitScript((items) => {
    localStorage.clear();
    for (const [key, value] of Object.entries(items)) localStorage.setItem(key, value);
  }, entries);
}

async function openMainWithStorage(page, entries) {
  await setStorageBeforeLoad(page, entries);
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
}

async function openPolicyWithStorage(page, path, entries) {
  await setStorageBeforeLoad(page, entries);
  await page.goto(path);
  await page.waitForLoadState('domcontentloaded');
}

async function expectSelfNamedLanguageOptions(page) {
  await expect(page.locator('#owLang option[value="ja"]')).toHaveText('日本語');
  await expect(page.locator('#owLang option[value="en"]')).toHaveText('English');
  await expect(page.locator('[data-lang-choice="ja"]').first()).toContainText('日本語');
  await expect(page.locator('[data-lang-choice="en"]').first()).toContainText('English');
}

async function expectNoBrokenText(page) {
  const text = await page.locator('body').innerText();
  for (const word of BROKEN_OUTPUT_WORDS) expect(text).not.toContain(word);
}

async function expectLanguageState(page, lang) {
  await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.owLang)).toBe(lang);
  await expect.poll(async () => page.evaluate(() => document.documentElement.lang)).toBe(lang);
  await expectSelfNamedLanguageOptions(page);
}

async function expectMainJapaneseFallback(page) {
  await expectLanguageState(page, 'ja');
  await expect(page.locator('#langSelectModal')).not.toBeVisible();
  await expect(page.locator('#flagLangBtn')).toHaveText('🇯🇵');
  const selectText = await page.locator('#targetHero').evaluate(select => [...select.options].map(option => option.textContent.trim()).join('|'));
  expect(selectText).toContain('ソルジャー76');
  expect(selectText).not.toContain('Soldier: 76');
  await page.locator('#comp button.primary').click();
  await expect(page.locator('#result .affinityValue')).toBeVisible();
  await expect(page.locator('#result')).toContainText('構成評価');
  await expectNoBrokenText(page);
}

async function expectPolicyJapaneseFallback(page) {
  await expectLanguageState(page, 'ja');
  await expect(page.locator('#langSelectModal')).not.toBeVisible();
  await expect(page.locator('#flagLangBtn')).toHaveText('🇯🇵');
  await expect(page.locator('.langBlock.active')).toHaveAttribute('data-lang', 'ja');
  await expectNoBrokenText(page);
}

async function expectFirstChoiceRequired(page) {
  await expect(page.locator('#langSelectModal')).toBeVisible();
  await expect(page.locator('#flagLangControl')).not.toBeVisible();
  await expectSelfNamedLanguageOptions(page);
}

test.describe('localStorage fallback regression', () => {
  for (const invalidLang of INVALID_LANG_VALUES) {
    test(`main page falls back to Japanese when owcoach_lang is invalid: ${JSON.stringify(invalidLang)}`, async ({ page }) => {
      await openMainWithStorage(page, {
        owcoach_lang: invalidLang,
        owcoach_lang_selected: '1'
      });
      await expectMainJapaneseFallback(page);
    });
  }

  for (const invalidLang of INVALID_LANG_VALUES.slice(0, 5)) {
    test(`policy pages fall back to Japanese when owcoach_lang is invalid: ${JSON.stringify(invalidLang)}`, async ({ page }) => {
      for (const path of POLICY_PAGES) {
        await openPolicyWithStorage(page, path, {
          owcoach_lang: invalidLang,
          owcoach_lang_selected: '1'
        });
        await expectPolicyJapaneseFallback(page);
      }
    });
  }

  for (const invalidSelected of INVALID_SELECTED_VALUES) {
    test(`main page requires first-choice modal when owcoach_lang_selected is invalid: ${JSON.stringify(invalidSelected)}`, async ({ page }) => {
      await openMainWithStorage(page, {
        owcoach_lang: 'en',
        owcoach_lang_selected: invalidSelected
      });
      await expectLanguageState(page, 'en');
      await expectFirstChoiceRequired(page);
      await page.locator('#langSelectModal [data-lang-choice="ja"]').click();
      await expect(page.locator('#langSelectModal')).not.toBeVisible();
      await expectLanguageState(page, 'ja');
      await expect(page.locator('#flagLangBtn')).toHaveText('🇯🇵');
    });
  }

  test('corrupted storage can be repaired by the flag menu after first load', async ({ page }) => {
    await openMainWithStorage(page, {
      owcoach_lang: '__broken__',
      owcoach_lang_selected: '1'
    });
    await expectMainJapaneseFallback(page);

    await page.locator('#flagLangBtn').click();
    await expect(page.locator('#flagLangMenu')).toBeVisible();
    await page.locator('#flagLangMenu [data-lang-choice="en"]').click();
    await expectLanguageState(page, 'en');
    await expect(page.locator('#flagLangBtn')).toHaveText('🇺🇸');
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await expectLanguageState(page, 'en');
    await expect(page.locator('#langSelectModal')).not.toBeVisible();
  });

  test('corrupted localStorage with extra unknown keys does not break diagnosis or detail rendering', async ({ page }) => {
    await openMainWithStorage(page, {
      owcoach_lang: 'en',
      owcoach_lang_selected: '1',
      owcoach_last_detail_hero: '<bad-hero>',
      owcoach_selected_target: '[object Object]',
      owcoach_enemy_comp: '{not-json',
      owcoach_lang_menu_open: 'NaN'
    });
    await expectLanguageState(page, 'en');
    await expect(page.locator('#langSelectModal')).not.toBeVisible();
    await page.locator('#targetHero').selectOption('Soldier76');
    await page.locator('#comp button.primary').click();
    await expect(page.locator('#result .affinityValue')).toBeVisible();
    await expect(page.locator('#result')).toContainText('Composition Evaluation');
    await page.locator('.tabs .tab').nth(1).click();
    await page.locator('[data-hero-id="Sombra"]').click();
    await expect(page.locator('#detailResult .card')).toBeVisible();
    await expect(page.locator('#detailResult')).toContainText('Matchup Plan');
    await expectNoBrokenText(page);
  });
});
