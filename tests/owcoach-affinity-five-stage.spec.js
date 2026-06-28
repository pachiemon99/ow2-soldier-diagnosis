const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ALLOWED = {
  ja: ['有利', 'やや有利', '五分', 'やや不利', '不利'],
  en: ['Favored', 'Slightly Favored', 'Even', 'Slightly Unfavored', 'Unfavored']
};

const LEGACY_AFFINITY = [
  '有利寄り', '五分寄り', '不利寄り', 'かなり注意', 'かなり厳しい',
  'Even-ish', 'High Risk', 'Caution'
];

const BROKEN_OUTPUT = ['undefined', 'null', '[object Object]'];

function appRoot() {
  return path.resolve(__dirname, '..');
}

function appSourceFiles() {
  const root = appRoot();
  return fs.readdirSync(root)
    .filter((name) => /\.(html|csv|js|json)$/.test(name))
    .filter((name) => !name.startsWith('validation_report'))
    .map((name) => path.join(root, name));
}

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

async function chooseLanguage(page, lang) {
  await page.locator('#flagLangBtn').click();
  await page.locator(`#flagLangMenu [data-lang-choice="${lang}"]`).click();
  await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.owLang)).toBe(lang);
}

async function enemyFixtures(page) {
  return page.evaluate(() => {
    const values = (id) => [...document.querySelector(`#${id}`).options]
      .map((o) => o.value)
      .filter(Boolean);
    const tanks = values('tank');
    const dps = values('dps1');
    const sups = values('sup1');
    const pick = (arr, i) => arr[((i % arr.length) + arr.length) % arr.length];
    return [0, 3, 7].map((offset) => ({
      tank: pick(tanks, offset),
      dps1: pick(dps, offset),
      dps2: pick(dps, offset + 5),
      sup1: pick(sups, offset),
      sup2: pick(sups, offset + 3)
    }));
  });
}

async function applyEnemyFixture(page, fixture) {
  await page.evaluate((nextFixture) => {
    for (const [id, value] of Object.entries(nextFixture)) {
      const select = document.querySelector(`#${id}`);
      if (select) select.value = value;
    }
    for (const id of ['tank', 'dps1', 'dps2', 'sup1', 'sup2']) {
      const select = document.querySelector(`#${id}`);
      if (select) select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, fixture);
  await expect.poll(async () => page.evaluate(() => ({
    tank: Boolean(document.querySelector('#tank')?.value),
    dps: document.querySelector('#dps1').value !== document.querySelector('#dps2').value,
    sup: document.querySelector('#sup1').value !== document.querySelector('#sup2').value
  }))).toEqual({ tank: true, dps: true, sup: true });
}

async function diagnose(page) {
  await page.locator('#comp button.primary').click();
  await expect(page.locator('#result .affinityValue')).toBeVisible();
}

async function assertAffinityDom(page, lang) {
  const affinity = (await page.locator('#result .affinityValue').first().innerText()).trim();
  expect(ALLOWED[lang]).toContain(affinity);

  const resultText = await page.locator('#result').innerText();
  for (const legacy of LEGACY_AFFINITY) expect(resultText).not.toContain(legacy);
  for (const broken of BROKEN_OUTPUT) expect(resultText).not.toContain(broken);
}

test.describe('five-stage affinity guardrails', () => {
  test('app source does not contain legacy affinity labels or display-time legacy normalizers', async () => {
    const files = appSourceFiles();
    expect(files.length).toBeGreaterThan(0);
    const combined = files.map((file) => `\n/* ${path.basename(file)} */\n` + fs.readFileSync(file, 'utf8')).join('\n');

    for (const legacy of LEGACY_AFFINITY) {
      expect(combined, `legacy affinity label remains in app source: ${legacy}`).not.toContain(legacy);
    }
    expect(combined).not.toContain('normalizeCompAffinity');
  });

  test('source scoring helpers produce only the five allowed Japanese affinity labels', async ({ page }) => {
    await openWithLanguage(page, 'ja');
    const values = await page.evaluate(() => {
      const scoreInputs = [-100, 0, 3.09, 3.1, 4.19, 4.2, 5.29, 5.3, 6.39, 6.4, 100, NaN, undefined, null, 'bad'];
      const ratingInputs = [-100, 0, 3.49, 3.5, 4.99, 5, 6.49, 6.5, 7.99, 8, 100, NaN, undefined, null, 'bad'];
      return {
        affinityFromScoreType: typeof affinityFromScore,
        affinityFromRatingType: typeof affinityFromRating,
        scoreOutputs: scoreInputs.map((v) => affinityFromScore(v)),
        ratingOutputs: ratingInputs.map((v) => affinityFromRating(v)),
        legacySafetyOutputs: ['有利寄り', '五分寄り', '不利寄り', 'かなり注意', 'かなり厳しい'].map((v) => ensureCompAffinityJa(v))
      };
    });
    expect(values.affinityFromScoreType).toBe('function');
    expect(values.affinityFromRatingType).toBe('function');
    for (const output of [...values.scoreOutputs, ...values.ratingOutputs, ...values.legacySafetyOutputs]) {
      expect(ALLOWED.ja).toContain(output);
      expect(LEGACY_AFFINITY).not.toContain(output);
    }
  });

  for (const lang of ['ja', 'en']) {
    test(`${lang}: every target and varied enemy fixture displays only five-stage affinity`, async ({ page }) => {
      await openWithLanguage(page, lang);
      const targetIds = await page.locator('#targetHero option').evaluateAll((options) => options.map((o) => o.value).filter(Boolean));
      expect(targetIds.length).toBe(13);
      const fixtures = await enemyFixtures(page);
      expect(fixtures.length).toBe(3);

      for (const targetId of targetIds) {
        await page.locator('#targetHero').selectOption(targetId);
        await page.evaluate(() => document.querySelector('#targetHero').dispatchEvent(new Event('change', { bubbles: true })));
        for (const fixture of fixtures) {
          await applyEnemyFixture(page, fixture);
          await diagnose(page);
          await assertAffinityDom(page, lang);
        }
      }
    });
  }

  test('affinity remains five-stage after language switching with an existing diagnosis', async ({ page }) => {
    await openWithLanguage(page, 'ja');
    await page.locator('#targetHero').selectOption('Genji');
    await applyEnemyFixture(page, (await enemyFixtures(page))[1]);
    await diagnose(page);
    await assertAffinityDom(page, 'ja');

    const sequence = ['en', 'ja', 'en', 'ja'];
    for (const lang of sequence) {
      await chooseLanguage(page, lang);
      await diagnose(page);
      await assertAffinityDom(page, lang);
    }
  });
});
