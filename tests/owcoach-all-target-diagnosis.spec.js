const { test, expect } = require('@playwright/test');

const ALLOWED_AFFINITY = {
  ja: ['有利', 'やや有利', '五分', 'やや不利', '不利'],
  en: ['Favored', 'Slightly Favored', 'Even', 'Slightly Unfavored', 'Unfavored']
};

const EXPECTED_TARGET_LABELS = {
  ja: {
    Soldier76: 'ソルジャー76',
    Sojourn: 'ソジョーン',
    Cassidy: 'キャスディ',
    Ashe: 'アッシュ',
    Reaper: 'リーパー',
    Symmetra: 'シンメトラ',
    Hanzo: 'ハンゾー',
    Torbjorn: 'トールビョーン',
    Bastion: 'バスティオン',
    Mei: 'メイ',
    Sombra: 'ソンブラ',
    Tracer: 'トレーサー',
    Genji: 'ゲンジ'
  },
  en: {
    Soldier76: 'Soldier: 76',
    Sojourn: 'Sojourn',
    Cassidy: 'Cassidy',
    Ashe: 'Ashe',
    Reaper: 'Reaper',
    Symmetra: 'Symmetra',
    Hanzo: 'Hanzo',
    Torbjorn: 'Torbjörn',
    Bastion: 'Bastion',
    Mei: 'Mei',
    Sombra: 'Sombra',
    Tracer: 'Tracer',
    Genji: 'Genji'
  }
};

const LEGACY_AFFINITY_WORDS = [
  '有利寄り', '五分寄り', '不利寄り', '注意', 'かなり注意', 'かなり厳しい',
  'Caution', 'High Risk', 'Even-ish'
];

const BROKEN_OUTPUT_WORDS = ['undefined', 'null', '[object Object]'];

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

async function getTargetIds(page) {
  return page.locator('#targetHero option').evaluateAll(options => options.map(option => option.value).filter(Boolean));
}

async function selectTargetAndDiagnose(page, heroId) {
  await page.locator('#targetHero').selectOption(heroId);
  await page.evaluate(() => document.querySelector('#targetHero').dispatchEvent(new Event('change', { bubbles: true })));
  await expect(page.locator('#targetHero')).toHaveValue(heroId);
  await page.locator('#comp button.primary').click();
  await expect(page.locator('#result .affinityValue')).toBeVisible();
}

async function assertTargetLabel(page, lang, heroId) {
  const selectedLabel = await page.locator('#targetHero option:checked').innerText();
  expect(selectedLabel.trim()).toBe(EXPECTED_TARGET_LABELS[lang][heroId]);
}

async function assertEnemySlotsUnique(page) {
  const state = await page.evaluate(() => ({
    dps1: document.querySelector('#dps1').value,
    dps2: document.querySelector('#dps2').value,
    sup1: document.querySelector('#sup1').value,
    sup2: document.querySelector('#sup2').value
  }));
  expect(state.dps1).not.toBe(state.dps2);
  expect(state.sup1).not.toBe(state.sup2);
}

async function assertDiagnosisResult(page, lang, heroId) {
  await assertTargetLabel(page, lang, heroId);
  await assertEnemySlotsUnique(page);

  const affinity = (await page.locator('#result .affinityValue').first().innerText()).trim();
  expect(ALLOWED_AFFINITY[lang]).toContain(affinity);

  const resultText = await page.locator('#result').innerText();
  for (const word of BROKEN_OUTPUT_WORDS) {
    expect(resultText).not.toContain(word);
  }
  for (const word of LEGACY_AFFINITY_WORDS) {
    expect(resultText).not.toContain(word);
  }

  if (lang === 'en') {
    expect(resultText).toContain('Game Plan');
    expect(resultText).toContain('Matchup');
    expect(resultText).not.toContain('構成評価');
    expect(resultText).not.toContain('戦い方');
  } else {
    expect(resultText).toContain('構成評価');
    expect(resultText).toContain('戦い方');
    expect(resultText).not.toContain('Composition Evaluation');
    expect(resultText).not.toContain('Game Plan');
  }
}

test.describe('all target composition diagnosis regression', () => {
  for (const lang of ['ja', 'en']) {
    test(`${lang}: every diagnosable hero renders a clean five-stage composition diagnosis`, async ({ page }) => {
      await openWithLanguage(page, lang);
      const ids = await getTargetIds(page);
      expect(ids).toEqual(Object.keys(EXPECTED_TARGET_LABELS.ja));

      for (const heroId of ids) {
        await selectTargetAndDiagnose(page, heroId);
        await assertDiagnosisResult(page, lang, heroId);
      }
    });
  }

  test('target changes recalculate affinity instead of leaving stale result text', async ({ page }) => {
    await openWithLanguage(page, 'en');
    const ids = await getTargetIds(page);
    expect(ids.length).toBe(13);

    let previousHeader = '';
    for (const heroId of ids) {
      await selectTargetAndDiagnose(page, heroId);
      const resultText = await page.locator('#result').innerText();
      expect(resultText).toContain(EXPECTED_TARGET_LABELS.en[heroId]);
      expect(resultText).not.toBe(previousHeader);
      previousHeader = resultText;
    }
  });
});
