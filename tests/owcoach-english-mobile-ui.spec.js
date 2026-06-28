const { test, expect } = require('@playwright/test');

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
  await page.locator(`#flagLangMenu [data-lang-choice="${lang}"]`).click();
  await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.owLang)).toBe(lang);
}

async function diagnoseCurrent(page) {
  await page.locator('button.primary').click();
  await expect(page.locator('#result .card')).toBeVisible();
  await expect(page.locator('#result .compactPlan')).toBeVisible();
}

async function headerHeight(page) {
  return page.locator('header').evaluate((header) => Math.round(header.getBoundingClientRect().height));
}

async function viewportSnapshot(page) {
  return page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight, scrollWidth: document.documentElement.scrollWidth }));
}

async function assertNoHorizontalOverflow(page) {
  const v = await viewportSnapshot(page);
  expect(v.scrollWidth).toBeLessThanOrEqual(v.width + 2);
}

async function assertBoxInViewport(page, locator) {
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();
  expect(box).toBeTruthy();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
}

async function attachViewportScreenshot(page, testInfo, name) {
  const body = await page.screenshot({ fullPage: false });
  await testInfo.attach(name, { body, contentType: 'image/png' });
}

test('English sticky header remains compact and no taller than Japanese baseline', async ({ page }, testInfo) => {
  await openWithLanguage(page, 'ja');
  const jaHeight = await headerHeight(page);
  await assertNoHorizontalOverflow(page);

  await chooseFromFlagMenu(page, 'en');
  const enHeight = await headerHeight(page);
  const viewport = await viewportSnapshot(page);

  expect(enHeight).toBeLessThanOrEqual(jaHeight + 4);
  if (viewport.width <= 520) {
    expect(enHeight).toBeLessThanOrEqual(86);
  } else {
    expect(enHeight).toBeLessThanOrEqual(104);
  }

  await page.evaluate(() => window.scrollTo(0, 520));
  await expect.poll(async () => page.locator('header').evaluate((header) => Math.round(header.getBoundingClientRect().top))).toBe(0);
  expect(await headerHeight(page)).toBe(enHeight);
  await assertNoHorizontalOverflow(page);
  await attachViewportScreenshot(page, testInfo, 'english-sticky-header-compact');
});

test('English KPI cards stay short and Game Plan summary does not become long prose', async ({ page }, testInfo) => {
  await openWithLanguage(page, 'en');
  await page.locator('#targetHero').selectOption('Soldier76');
  await diagnoseCurrent(page);

  const kpiMetrics = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('#result .kpi')];
    return cards.map((card) => ({
      name: card.querySelector('.name')?.textContent.trim() || '',
      value: card.querySelector('.value')?.textContent.trim() || '',
      height: Math.round(card.getBoundingClientRect().height),
      width: Math.round(card.getBoundingClientRect().width)
    }));
  });

  const viewport = await viewportSnapshot(page);
  expect(kpiMetrics.length).toBeGreaterThanOrEqual(4);
  for (const card of kpiMetrics) {
    if (viewport.width <= 520) {
      expect(card.height, `${card.name}: ${card.value}`).toBeLessThanOrEqual(78);
    } else {
      expect(card.height, `${card.name}: ${card.value}`).toBeLessThanOrEqual(94);
    }
  }

  const gamePlan = kpiMetrics.find((card) => card.name === 'Game Plan');
  expect(gamePlan).toBeTruthy();
  expect(gamePlan.value.length).toBeLessThanOrEqual(34);
  expect(gamePlan.value.split(/\s+/).filter(Boolean).length).toBeLessThanOrEqual(5);
  expect(gamePlan.value).not.toMatch(/[.!?。]|should|when|because|while/i);

  await expect(page.locator('#result h3', { hasText: 'Game Plan' })).toBeVisible();
  await attachViewportScreenshot(page, testInfo, 'english-kpi-compact');
});

test('English compact KPI layout holds across all target heroes', async ({ page }) => {
  await openWithLanguage(page, 'en');
  const targetIds = await page.locator('#targetHero option').evaluateAll((options) => options.map((option) => option.value).filter(Boolean));
  expect(targetIds.length).toBe(13);

  const viewport = await viewportSnapshot(page);
  const maxHeight = viewport.width <= 520 ? 82 : 98;

  for (const id of targetIds) {
    await page.locator('#targetHero').selectOption(id);
    await page.evaluate(() => document.querySelector('#targetHero').dispatchEvent(new Event('change', { bubbles: true })));
    await diagnoseCurrent(page);
    const metrics = await page.evaluate(() => [...document.querySelectorAll('#result .kpi')].map((card) => ({
      name: card.querySelector('.name')?.textContent.trim() || '',
      value: card.querySelector('.value')?.textContent.trim() || '',
      height: Math.round(card.getBoundingClientRect().height)
    })));
    for (const card of metrics) {
      expect(card.height, `${id} / ${card.name}: ${card.value}`).toBeLessThanOrEqual(maxHeight);
    }
    const plan = metrics.find((card) => card.name === 'Game Plan');
    expect(plan, `${id} Game Plan card exists`).toBeTruthy();
    expect(plan.value.length, `${id} Game Plan too long: ${plan.value}`).toBeLessThanOrEqual(34);
    await assertNoHorizontalOverflow(page);
  }
});

test('English flag language menu stays inside the mobile viewport', async ({ page }, testInfo) => {
  await openWithLanguage(page, 'en');
  await page.locator('#flagLangBtn').click();
  const menu = page.locator('#flagLangMenu');
  await expect(menu).toBeVisible();
  await assertBoxInViewport(page, menu);
  await expect(menu.locator('[data-lang-choice="ja"]')).toContainText('日本語');
  await expect(menu.locator('[data-lang-choice="en"]')).toContainText('English');
  await attachViewportScreenshot(page, testInfo, 'english-flag-menu-in-viewport');
});
