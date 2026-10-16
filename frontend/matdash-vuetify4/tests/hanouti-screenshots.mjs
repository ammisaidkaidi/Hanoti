#!/usr/bin/env node
/**
 * Capture screenshots of the hanouti screens and report what the sidebar shows.
 *
 * Used to review the interface visually and to confirm the ERP navigation
 * really points at the generated routes rather than the template's demo pages.
 *
 * Usage: node tests/hanouti-screenshots.mjs [baseUrl] [outputDir]
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:5173";
const outputDir = process.argv[3] ?? "tests/screenshots";
mkdirSync(outputDir, { recursive: true });

const shots = [
  { name: "01-tableau-de-bord", path: "/tableau-de-bord/ventes" },
  { name: "02-articles", path: "/produits/catalogue/articles" },
  { name: "03-commande-clients", path: "/ventes/commandes-clients" },
  { name: "04-niveaux-de-stock", path: "/produits/stock/niveaux-de-stock" },
  { name: "05-schema-base", path: "/parametres/schema-base" },
  { name: "06-ecran-planifie", path: "/ventes/devis" },
  { name: "07-utilisateurs-roles", path: "/parametres/utilisateurs-et-roles" },
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1500, height: 950 } });
const page = await context.newPage();

const consoleErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(error.message));

for (const shot of shots) {
  await page.goto(`${baseUrl}${shot.path}`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outputDir, `${shot.name}.png`), fullPage: false });
}

/** What the sidebar actually links to. */
await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
const nav = await page.evaluate(() => {
  const anchors = [...document.querySelectorAll("a[href]")];
  return anchors
    .map((anchor) => ({
      href: anchor.getAttribute("href"),
      text: (anchor.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40),
    }))
    .filter((entry) => entry.href.startsWith("/") && entry.href !== "/");
});

const unique = [...new Map(nav.map((entry) => [entry.href, entry])).values()];

await browser.close();

process.stdout.write(`screenshots: ${shots.length} written to ${outputDir}\n\n`);
process.stdout.write(`navigation links found: ${unique.length}\n`);
for (const entry of unique.slice(0, 60)) {
  process.stdout.write(`  ${entry.href.padEnd(46)} ${entry.text}\n`);
}

if (consoleErrors.length > 0) {
  process.stdout.write(`\nconsole errors: ${consoleErrors.length}\n`);
  for (const error of [...new Set(consoleErrors)].slice(0, 10)) process.stdout.write(`  ${error}\n`);
} else {
  process.stdout.write("\nno console errors\n");
}
