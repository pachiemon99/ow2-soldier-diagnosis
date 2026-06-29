const { test, expect } = require('@playwright/test');

const APP_PAGES = ['/', '/notices.html', '/terms.html', '/privacy.html', '/tokusho.html'];
const BROKEN_VISIBLE_WORDS = ['undefined', 'null', '[object Object]', 'NaN'];
const OLD_BAD_WORDS = [
  'ストルワート', 'Hard No', 'ja_to_en_verified', '横道', '触る', '遮蔽へ切る', '同じダイブ経路',
  '有利寄り', '五分寄り', '不利寄り', 'かなり注意', 'かなり厳しい',
  'Even-ish', 'High Risk', 'Caution'
];
const ALLOWED_AFFINITY = {
  ja: ['有利', 'やや有利', '五分', 'やや不利', '不利'],
  en: ['Favored', 'Slightly Favored', 'Even', 'Slightly Unfavored', 'Unfavored']
};

async function openWithLanguage(page, path, lang) {
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
  await page.locator(`#flagLangMenu [data-lang-choice="${lang}"]`).click();
  await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.owLang)).toBe(lang);
}

async function expectNoBadVisibleText(page, contextLabel = 'page') {
  const report = await page.evaluate(() => {
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    return {
      body: document.body?.innerText || '',
      title: document.title || '',
      metaDescription,
      currentLang: document.documentElement.dataset.owLang || '',
      htmlLang: document.documentElement.lang || ''
    };
  });
  const joined = [report.body, report.title, report.metaDescription].join('\n');
  for (const word of BROKEN_VISIBLE_WORDS) {
    expect(joined, `${contextLabel}: broken placeholder '${word}' is visible`).not.toContain(word);
  }
  for (const word of OLD_BAD_WORDS) {
    expect(joined, `${contextLabel}: old wording '${word}' is visible`).not.toContain(word);
  }
  expect(report.currentLang, `${contextLabel}: html data language should be set`).toMatch(/^(ja|en)$/);
  expect(report.htmlLang, `${contextLabel}: html lang should be set`).toMatch(/^(ja|en)$/);
}

async function expectNoBadSourceTerms(page) {
  const sourceReport = await page.evaluate(async (paths) => {
    const terms = [
      'ストルワート', 'Hard No', 'ja_to_en_verified', '横道', '触る', '遮蔽へ切る', '同じダイブ経路',
      '有利寄り', '五分寄り', '不利寄り', 'かなり注意', 'かなり厳しい',
      'Even-ish', 'High Risk', 'Caution', 'normalizeCompAffinity'
    ];
    const results = [];
    for (const path of paths) {
      const text = await fetch(path).then(r => r.text());
      for (const term of terms) {
        if (text.includes(term)) results.push(`${path}:${term}`);
      }
    }
    return results;
  }, APP_PAGES.filter(path => path !== '/'));
  expect(sourceReport).toEqual([]);
}

async function getTargetIds(page) {
  return page.locator('#targetHero option').evaluateAll(options => options.map(option => option.value).filter(Boolean));
}

async function runCompositionDiagnosis(page, heroId, lang) {
  await page.locator('#targetHero').selectOption(heroId);
  await page.evaluate(() => document.querySelector('#targetHero').dispatchEvent(new Event('change', { bubbles: true })));
  await page.locator('#comp button.primary').click();
  await expect(page.locator('#result .affinityValue')).toBeVisible();
  const affinity = (await page.locator('#result .affinityValue').first().innerText()).trim();
  expect(ALLOWED_AFFINITY[lang]).toContain(affinity);
  await expectNoBadVisibleText(page, `composition ${lang} ${heroId}`);
}

async function openDetailTab(page) {
  await page.locator('.tab').nth(1).click();
  await expect(page.locator('#detail')).toHaveClass(/active/);
  await expect(page.locator('#heroGrid .heroBtn').first()).toBeVisible();
}

async function getHeroIds(page) {
  return page.locator('#heroGrid .heroBtn').evaluateAll(buttons => buttons.map(button => button.dataset.heroId).filter(Boolean));
}

async function openHeroDetail(page, heroId) {
  await page.evaluate((id) => {
    const button = [...document.querySelectorAll('#heroGrid .heroBtn')].find(btn => btn.dataset.heroId === id);
    if (!button) throw new Error(`Hero button not found: ${id}`);
    button.click();
  }, heroId);
  await expect(page.locator('#detailResult .card')).toBeVisible();
  await expect(page.locator('#detailResult h2')).toBeVisible();
}

test.describe('broken output and legacy wording regression', () => {
  test('app source does not reintroduce old wording or legacy affinity helpers', async ({ page }) => {
    await openWithLanguage(page, '/', 'ja');
    await expectNoBadSourceTerms(page);
  });

  for (const path of APP_PAGES) {
    for (const lang of ['ja', 'en']) {
      test(`${path} ${lang}: visible page chrome has no broken placeholders or old wording`, async ({ page }) => {
        await openWithLanguage(page, path, lang);
        await expectNoBadVisibleText(page, `${path} ${lang}`);
        if (await page.locator('#flagLangBtn').count()) {
          await page.locator('#flagLangBtn').click();
          await expect(page.locator('#flagLangMenu')).toBeVisible();
          await expectNoBadVisibleText(page, `${path} ${lang} flag menu`);
        }
      });
    }
  }

  for (const lang of ['ja', 'en']) {
    test(`${lang}: every target composition diagnosis avoids broken output and old labels`, async ({ page }) => {
      await openWithLanguage(page, '/', lang);
      const ids = await getTargetIds(page);
      expect(ids.length).toBe(13);
      for (const heroId of ids) {
        await runCompositionDiagnosis(page, heroId, lang);
      }
    });

    test(`${lang}: every hero detail avoids broken output and old wording`, async ({ page }) => {
      await openWithLanguage(page, '/', lang);
      await openDetailTab(page);
      const heroIds = await getHeroIds(page);
      expect(heroIds.length).toBe(51);
      for (const heroId of heroIds) {
        await openHeroDetail(page, heroId);
        await expectNoBadVisibleText(page, `detail ${lang} ${heroId}`);
      }
    });
  }

  test('round-trip language changes keep broken output and old wording out of rendered diagnosis areas', async ({ page }) => {
    await openWithLanguage(page, '/', 'ja');
    await runCompositionDiagnosis(page, 'Soldier76', 'ja');
    await openDetailTab(page);
    await openHeroDetail(page, 'Sombra');

    for (const lang of ['en', 'ja', 'en', 'ja', 'en', 'ja']) {
      await chooseFromFlagMenu(page, lang);
      await expectNoBadVisibleText(page, `roundtrip ${lang}`);
      await page.locator('.tab').nth(0).click();
      await runCompositionDiagnosis(page, 'Soldier76', lang);
      await openDetailTab(page);
      await openHeroDetail(page, 'Sombra');
      await expect(page.locator('#detailResult .card')).toBeVisible();
      await expectNoBadVisibleText(page, `roundtrip detail ${lang}`);
    }
  });
});
