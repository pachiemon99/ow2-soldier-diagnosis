const { test, expect } = require('@playwright/test');

const POLICY_PAGES = [
  {
    path: '/notices.html',
    jaTitle: '重要な注意事項',
    enTitle: 'Important Notices',
    jaBody: '非公式表記と収益化方針',
    enBody: 'Unofficial Status and Monetization Policy'
  },
  {
    path: '/terms.html',
    jaTitle: '利用規約',
    enTitle: 'Terms of Use',
    jaBody: '利用規約',
    enBody: 'Terms of Use'
  },
  {
    path: '/privacy.html',
    jaTitle: 'プライバシーポリシー',
    enTitle: 'Privacy Policy',
    jaBody: '利用者のプライバシー',
    enBody: 'OW Coach respects user privacy'
  },
  {
    path: '/tokusho.html',
    jaTitle: '特定商取引法に基づく表記',
    enTitle: 'Specified Commercial Transactions Act',
    jaBody: '特定商取引法に基づく表記',
    enBody: 'Specified Commercial Transactions Act'
  }
];

const BROKEN_OUTPUT_WORDS = ['undefined', 'null', '[object Object]'];
const OLD_BAD_WORDS = ['ストルワート', 'Hard No', 'ja_to_en_verified', '横道', '遮蔽へ切る', '同じダイブ経路'];

async function openFreshPolicy(page, path) {
  await page.addInitScript(() => localStorage.clear());
  await page.goto(path);
  await page.waitForLoadState('domcontentloaded');
}

async function openPolicyWithLanguage(page, path, lang) {
  await page.addInitScript((selectedLang) => {
    localStorage.setItem('owcoach_lang', selectedLang);
    localStorage.setItem('owcoach_lang_selected', '1');
  }, lang);
  await page.goto(path);
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('#langSelectModal')).not.toBeVisible();
  await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.owLang)).toBe(lang);
}

async function chooseFromFlagMenu(page, lang) {
  await page.locator('#flagLangBtn').click();
  await expect(page.locator('#flagLangMenu')).toBeVisible();
  await expect(page.locator('#flagLangMenu [data-lang-choice="ja"]')).toContainText('日本語');
  await expect(page.locator('#flagLangMenu [data-lang-choice="en"]')).toContainText('English');
  await page.locator(`#flagLangMenu.open [data-lang-choice="${lang}"]`).click();
  await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.owLang)).toBe(lang);
}

async function expectSelfNamedLanguageOptions(page) {
  await expect(page.locator('#langSelectModal [data-lang-choice="ja"]')).toContainText('日本語');
  await expect(page.locator('#langSelectModal [data-lang-choice="en"]')).toContainText('English');
  await expect(page.locator('#flagLangMenu [data-lang-choice="ja"]')).toContainText('日本語');
  await expect(page.locator('#flagLangMenu [data-lang-choice="en"]')).toContainText('English');
  await expect(page.locator('#owLang option[value="ja"]')).toHaveText('日本語');
  await expect(page.locator('#owLang option[value="en"]')).toHaveText('English');
}

async function expectPolicyLanguage(page, policy, lang) {
  const expectedTitle = lang === 'en' ? policy.enTitle : policy.jaTitle;
  const expectedBody = lang === 'en' ? policy.enBody : policy.jaBody;
  const forbiddenTitle = lang === 'en' ? policy.jaTitle : policy.enTitle;
  const forbiddenBody = lang === 'en' ? policy.jaBody : policy.enBody;

  await expect(page.locator('header h1')).toContainText(expectedTitle);
  await expect(page.locator('header h1')).not.toContainText(forbiddenTitle);
  await expect(page.locator('.langBlock.active')).toHaveAttribute('data-lang', lang);
  await expect(page.locator('.langBlock.active')).toContainText(expectedBody);
  if (expectedBody !== forbiddenBody) {
    const visibleBody = await page.locator('.langBlock.active').innerText();
    expect(visibleBody).not.toContain(forbiddenBody);
  }

  const state = await page.evaluate(() => ({
    dataset: document.documentElement.dataset.owLang,
    htmlLang: document.documentElement.lang,
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    activeLangs: [...document.querySelectorAll('.langBlock.active')].map(el => el.dataset.lang),
    hiddenEnglishBlocks: [...document.querySelectorAll('.langBlock[data-lang="en"]')].filter(el => getComputedStyle(el).display === 'none').length,
    hiddenJapaneseBlocks: [...document.querySelectorAll('.langBlock[data-lang="ja"]')].filter(el => getComputedStyle(el).display === 'none').length
  }));
  expect(state.dataset).toBe(lang);
  expect(state.htmlLang).toBe(lang);
  expect(state.title).toContain(expectedTitle);
  expect(state.description.length).toBeGreaterThan(10);
  expect(state.activeLangs).toEqual([lang]);
  if (lang === 'en') expect(state.hiddenJapaneseBlocks).toBeGreaterThanOrEqual(1);
  else expect(state.hiddenEnglishBlocks).toBeGreaterThanOrEqual(1);
}

async function expectNoBrokenPolicyText(page) {
  const text = await page.locator('body').innerText();
  for (const word of BROKEN_OUTPUT_WORDS) expect(text).not.toContain(word);
  for (const word of OLD_BAD_WORDS) expect(text).not.toContain(word);
}

test.describe('policy pages language UI regression', () => {
  for (const policy of POLICY_PAGES) {
    test(`${policy.path}: first visit shows language modal and self-named choices`, async ({ page }) => {
      await openFreshPolicy(page, policy.path);
      await expect(page.locator('#langSelectModal')).toBeVisible();
      await expect(page.locator('#flagLangControl')).not.toBeVisible();
      await expectSelfNamedLanguageOptions(page);
      await page.locator('#langSelectModal [data-lang-choice="en"]').click();
      await expect(page.locator('#langSelectModal')).not.toBeVisible();
      await expect(page.locator('#flagLangBtn')).toHaveText('🇺🇸');
      await expectPolicyLanguage(page, policy, 'en');
      await expectNoBrokenPolicyText(page);
    });

    test(`${policy.path}: flag menu round trips without title/body language mixing`, async ({ page }, testInfo) => {
      await openPolicyWithLanguage(page, policy.path, 'ja');
      await expectPolicyLanguage(page, policy, 'ja');
      await expectSelfNamedLanguageOptions(page);

      for (const lang of ['en', 'ja', 'en', 'ja', 'en']) {
        await chooseFromFlagMenu(page, lang);
        await expectPolicyLanguage(page, policy, lang);
        await expectSelfNamedLanguageOptions(page);
        await expectNoBrokenPolicyText(page);
      }

      await testInfo.attach(`policy-language-${policy.path.replace(/[^a-z0-9]/gi, '-')}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png'
      });
    });

    test(`${policy.path}: invalid localStorage language safely falls back`, async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('owcoach_lang', 'fr');
        localStorage.setItem('owcoach_lang_selected', '1');
      });
      await page.goto(policy.path);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('#langSelectModal')).not.toBeVisible();
      await expectPolicyLanguage(page, policy, 'ja');
      await expect(page.locator('#flagLangBtn')).toHaveText('🇯🇵');
      await expectSelfNamedLanguageOptions(page);
    });
  }

  test('policy navigation pills preserve shared language UI on every policy page', async ({ page }) => {
    await openPolicyWithLanguage(page, '/notices.html', 'en');
    const hrefs = await page.locator('header .back a').evaluateAll(links => links.map(a => a.getAttribute('href')).filter(href => href && href.endsWith('.html')));
    expect(hrefs).toEqual(expect.arrayContaining(['notices.html', 'terms.html', 'privacy.html', 'tokusho.html']));
    for (const href of hrefs) {
      await page.goto('/' + href);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('#flagLangBtn')).toHaveText('🇺🇸');
      await expectSelfNamedLanguageOptions(page);
      await expectNoBrokenPolicyText(page);
    }
  });
});
