const { test, expect } = require('@playwright/test');

const DAMAGE_IDS = ['dps1', 'dps2'];
const SUPPORT_IDS = ['sup1', 'sup2'];
const TARGET_SEQUENCE = ['Soldier76', 'Sojourn', 'Cassidy', 'Ashe', 'Reaper', 'Symmetra', 'Hanzo', 'Torbjorn', 'Tracer', 'Genji'];

async function openWithLanguage(page, lang = 'ja') {
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
}

async function slotState(page) {
  return page.evaluate(() => {
    const read = (id) => {
      const el = document.querySelector(`#${id}`);
      return {
        id,
        value: el?.value || '',
        options: [...(el?.options || [])].map((option) => ({
          value: option.value,
          text: option.textContent.trim(),
          disabled: option.disabled
        }))
      };
    };
    return {
      dps1: read('dps1'),
      dps2: read('dps2'),
      sup1: read('sup1'),
      sup2: read('sup2')
    };
  });
}

function expectPairIsUnique(state, a, b) {
  expect(state[a].value, `${a} should have a selected hero`).toBeTruthy();
  expect(state[b].value, `${b} should have a selected hero`).toBeTruthy();
  expect(state[a].value, `${a} and ${b} must not be the same hero`).not.toBe(state[b].value);

  const aOptionInB = state[b].options.find((option) => option.value === state[a].value);
  const bOptionInA = state[a].options.find((option) => option.value === state[b].value);
  expect(aOptionInB, `${state[a].value} should exist as an option in ${b}`).toBeTruthy();
  expect(bOptionInA, `${state[b].value} should exist as an option in ${a}`).toBeTruthy();
  expect(aOptionInB.disabled, `${b} should disable the hero selected in ${a}`).toBe(true);
  expect(bOptionInA.disabled, `${a} should disable the hero selected in ${b}`).toBe(true);
}

async function expectEnemySlotsAreUnique(page) {
  const state = await slotState(page);
  expectPairIsUnique(state, 'dps1', 'dps2');
  expectPairIsUnique(state, 'sup1', 'sup2');
}

async function enabledAlternatives(page, selectId) {
  return page.locator(`#${selectId} option`).evaluateAll((options) => options
    .filter((option) => option.value && !option.disabled)
    .map((option) => option.value));
}

async function selectFirstDifferentEnabledOption(page, selectId, currentValue) {
  const values = (await enabledAlternatives(page, selectId)).filter((value) => value !== currentValue);
  expect(values.length, `${selectId} needs at least one enabled alternative`).toBeGreaterThan(0);
  await page.locator(`#${selectId}`).selectOption(values[0]);
  await page.locator(`#${selectId}`).dispatchEvent('change');
  await expectEnemySlotsAreUnique(page);
}

async function forceDuplicateAndExpectRepair(page, sourceId, targetId) {
  const repaired = await page.evaluate(({ sourceId, targetId }) => {
    const source = document.querySelector(`#${sourceId}`);
    const target = document.querySelector(`#${targetId}`);
    if (!source || !target) return { ok: false, reason: 'missing select' };
    const duplicateValue = source.value;
    target.value = duplicateValue;
    target.dispatchEvent(new Event('change', { bubbles: true }));
    return { ok: true, source: source.value, target: target.value };
  }, { sourceId, targetId });
  expect(repaired.ok).toBe(true);
  await expect.poll(async () => page.evaluate(({ sourceId, targetId }) => {
    return document.querySelector(`#${sourceId}`)?.value !== document.querySelector(`#${targetId}`)?.value;
  }, { sourceId, targetId })).toBe(true);
  await expectEnemySlotsAreUnique(page);
}

async function diagnoseAndExpectUnique(page) {
  await expectEnemySlotsAreUnique(page);
  await page.locator('button.primary').click();
  await expect(page.locator('#result .affinityValue')).toBeVisible();
  await expectEnemySlotsAreUnique(page);
}

test('initial enemy damage and support slots never start duplicated', async ({ page }) => {
  for (const lang of ['ja', 'en']) {
    await openWithLanguage(page, lang);
    await expectEnemySlotsAreUnique(page);
    await diagnoseAndExpectUnique(page);
  }
});

test('disabled options prevent manual same-role duplicate picks', async ({ page }) => {
  await openWithLanguage(page, 'ja');
  await expectEnemySlotsAreUnique(page);

  const initial = await slotState(page);
  await selectFirstDifferentEnabledOption(page, 'dps1', initial.dps1.value);
  await selectFirstDifferentEnabledOption(page, 'dps2', (await slotState(page)).dps2.value);
  await selectFirstDifferentEnabledOption(page, 'sup1', (await slotState(page)).sup1.value);
  await selectFirstDifferentEnabledOption(page, 'sup2', (await slotState(page)).sup2.value);

  await diagnoseAndExpectUnique(page);
});

test('programmatic duplicate states are repaired before diagnosis', async ({ page }) => {
  await openWithLanguage(page, 'ja');
  await forceDuplicateAndExpectRepair(page, 'dps1', 'dps2');
  await forceDuplicateAndExpectRepair(page, 'dps2', 'dps1');
  await forceDuplicateAndExpectRepair(page, 'sup1', 'sup2');
  await forceDuplicateAndExpectRepair(page, 'sup2', 'sup1');
  await diagnoseAndExpectUnique(page);
});

test('enemy uniqueness survives language round trips and target hero changes', async ({ page }) => {
  await openWithLanguage(page, 'en');
  await expectEnemySlotsAreUnique(page);

  for (const targetId of TARGET_SEQUENCE) {
    await page.locator('#targetHero').selectOption(targetId);
    await page.locator('#targetHero').dispatchEvent('change');
    await expectEnemySlotsAreUnique(page);

    await chooseFromFlagMenu(page, 'ja');
    await expectEnemySlotsAreUnique(page);
    await diagnoseAndExpectUnique(page);

    await chooseFromFlagMenu(page, 'en');
    await expectEnemySlotsAreUnique(page);
    await diagnoseAndExpectUnique(page);
  }
});

test('tank slot is not over-restricted while damage/support pairs stay unique', async ({ page }) => {
  await openWithLanguage(page, 'ja');
  await expectEnemySlotsAreUnique(page);

  const tankValues = await enabledAlternatives(page, 'tank');
  expect(tankValues.length, 'tank slot should keep selectable tank options').toBeGreaterThan(0);

  for (const tankId of tankValues.slice(0, 4)) {
    await page.locator('#tank').selectOption(tankId);
    await page.locator('#tank').dispatchEvent('change');
    await expect(page.locator('#tank')).toHaveValue(tankId);
    await expectEnemySlotsAreUnique(page);
  }
});
