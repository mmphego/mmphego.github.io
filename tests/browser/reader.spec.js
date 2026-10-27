const { test, expect } = require('@playwright/test');
const article = '/blog/2026/10/23/a-0-1-second-tool-call-filled-my-agents-context-window.html';

test.beforeEach(async ({ page }) => {
  // Keep tests deterministic: third-party availability is not a UI prerequisite.
  await page.route('**/*', route => {
    const host = new URL(route.request().url()).hostname;
    return host === '127.0.0.1' ? route.continue() : route.abort();
  });
});

test('article metadata, section links and responsive images', async ({ page }) => {
  await page.goto(article);
  await expect(page.locator('title')).toHaveCount(1);
  await expect(page.locator('meta[name="description"]')).toHaveCount(1);
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  blocks.forEach(text => expect(() => JSON.parse(text)).not.toThrow());
  const contents = page.locator('#article-contents');
  await expect(contents).toBeVisible();
  if (!(await contents.getAttribute('open')) && !(await contents.evaluate(el => el.open))) await contents.locator('summary').click();
  const section = contents.locator('a').nth(1);
  const href = await section.getAttribute('href');
  await section.click();
  await expect(page).toHaveURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'));
  const hero = page.locator('.blog-post img').first();
  await expect(hero).toHaveAttribute('srcset', /400w/);
  await expect(hero).toHaveAttribute('loading', 'eager');
  expect(Number(await hero.getAttribute('width'))).toBeGreaterThan(0);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflow).toBe(false);
  await page.screenshot({ path: test.info().outputPath('article.png') });
});

test('table scroll and image dialog preserve reading context', async ({ page }) => {
  await page.goto(article);
  const wrapper = page.locator('.table-scroll').first();
  if ((await page.viewportSize()).width < 480) {
    const moved = await wrapper.evaluate(el => { el.scrollLeft = 100; return el.scrollLeft; });
    expect(moved).toBeGreaterThan(0);
  }
  const imageLink = page.locator('.blog-post a:has(img)').first();
  await imageLink.click();
  const dialog = page.getByRole('dialog', { name: 'Image viewer' });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close image', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Previous image' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('link', { name: 'Open full-resolution image' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(imageLink).toBeFocused();
  await expect(page).toHaveURL(new RegExp(article.replaceAll('.', '\\.')));
});

test('search finds body-only terms and survives refresh', async ({ page }) => {
  await page.goto('/search.html?q=filing%20cabinet');
  await expect(page.locator('#search-results')).toContainText('How a 0.1-Second Tool Call');
  await page.reload();
  await expect(page.locator('#search-query')).toHaveValue('filing cabinet');
  await page.locator('#search-query').fill('unfindablewordzzzz');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.locator('#search-status')).toHaveText('0 matching articles');
});

test('comments and newsletter load on request and expose failures', async ({ page }) => {
  const requests = [];
  page.on('request', r => requests.push(r.url()));
  await page.goto(article);
  expect(requests.some(u => /disqus.com\/embed|chimpstatic/.test(u))).toBe(false);
  await page.getByRole('button', { name: 'Load comments', exact: true }).click();
  await expect(page.locator('.comments-status')).toContainText('could not load');
  await expect(page.getByRole('button', { name: 'Load comments', exact: true })).toBeEnabled();
});

test('clipboard denial never reports success', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('Denied')) } });
    document.execCommand = () => false;
  });
  await page.goto(article);
  const wrapper = page.locator('.code-block-wrapper').first();
  await wrapper.getByRole('button', { name: 'Copy code to clipboard' }).click();
  await expect(wrapper.getByRole('status')).toContainText('Copy failed');
});

test('mobile menu and dark mode remain usable', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Toggle navigation' });
  if (await toggle.isVisible()) {
    await toggle.click();
    await expect(page.locator('#main-navbar')).toBeVisible();
  }
  await page.getByRole('button', { name: 'Toggle dark mode' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
});


test('diagram copy keeps source after SVG rendering', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async text => { window.copiedForTest = text; }
    }});
  });
  await page.goto(article);
  const pre = page.locator('pre:has(code.language-mermaid)');
  await expect(pre).toHaveCount(1);
  await pre.evaluate(el => el.id = 'diagram-copy-test');
  const wrapper = page.locator('#diagram-copy-test').locator('..');
  await pre.evaluate(el => { el.innerHTML = '<svg><text>Rendered diagram</text></svg>'; });
  await wrapper.getByRole('button', { name: 'Copy code to clipboard' }).click();
  await expect(wrapper.getByRole('status')).toHaveText('Copied!');
  expect(await page.evaluate(() => window.copiedForTest)).toContain('flowchart');
});
