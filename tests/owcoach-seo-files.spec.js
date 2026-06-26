const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_BASE_URL = 'https://owcoach.jp';
const REQUIRED_PAGES = ['/', '/notices.html', '/terms.html', '/privacy.html', '/tokusho.html'];

function readRootFile(name) {
  return fs.readFileSync(path.join(ROOT, name), 'utf8');
}

test.describe('SEO support files', () => {
  test('robots.txt and sitemap.xml exist in the app root', async () => {
    for (const fileName of ['robots.txt', 'sitemap.xml']) {
      const filePath = path.join(ROOT, fileName);
      expect(fs.existsSync(filePath), `${fileName} should exist at the package root`).toBeTruthy();
      expect(fs.statSync(filePath).size, `${fileName} should not be empty`).toBeGreaterThan(20);
    }
  });

  test('robots.txt allows crawling and points to the production sitemap', async () => {
    const robots = readRootFile('robots.txt');
    expect(robots).toMatch(/User-agent:\s*\*/i);
    expect(robots).toMatch(/Allow:\s*\//i);
    expect(robots).toContain(`Sitemap: ${PUBLIC_BASE_URL}/sitemap.xml`);
    expect(robots).not.toMatch(/Disallow:\s*\//i);
    expect(robots).not.toContain('your-domain' + '.example');
  });

  test('sitemap.xml lists every public OW Coach page with the production URL', async () => {
    const sitemap = readRootFile('sitemap.xml');
    expect(sitemap).toMatch(/^<\?xml\s+version="1\.0"/);
    expect(sitemap).toContain('http://www.sitemaps.org/schemas/sitemap/0.9');
    for (const pagePath of REQUIRED_PAGES) {
      const expectedUrl = `${PUBLIC_BASE_URL}${pagePath === '/' ? '/' : pagePath}`;
      expect(sitemap, `sitemap should include ${expectedUrl}`).toContain(`<loc>${expectedUrl}</loc>`);
    }
    expect(sitemap).not.toMatch(/undefined|null|\[object Object\]|NaN/);
    expect(sitemap).not.toContain('your-domain' + '.example');
  });

  test('robots.txt and sitemap.xml are served by the static server', async ({ page }) => {
    await page.goto('/robots.txt');
    await expect(page.locator('body')).toContainText('User-agent: *');
    await expect(page.locator('body')).toContainText(`Sitemap: ${PUBLIC_BASE_URL}/sitemap.xml`);

    await page.goto('/sitemap.xml');
    await expect(page.locator('body')).toContainText('<urlset');
    await expect(page.locator('body')).toContainText(`${PUBLIC_BASE_URL}/privacy.html`);
  });
});
