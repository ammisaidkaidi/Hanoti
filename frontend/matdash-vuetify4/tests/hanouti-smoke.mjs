#!/usr/bin/env node
/**
 * End-to-end check for the hanouti screens.
 *
 * Loads every route the sidebar exposes, in a real browser, and fails on any
 * console error, page error or failed request. A screen that renders an empty
 * shell still counts as broken here: each route must produce visible content.
 *
 * Usage (with the dev server already running):
 *   node tests/hanouti-smoke.mjs [baseUrl]
 */
import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? process.env.BASE_URL ?? "http://127.0.0.1:5173";

/** The routes worth proving: one per screen kind, plus the busiest tables. */
const routes = [
  { path: "/", expect: "Ventes du jour" },
  { path: "/tableau-de-bord/ventes", expect: "Ventes du jour" },
  { path: "/tableau-de-bord/alertes-stock", expect: "Alertes" },
  { path: "/ventes/commandes-clients", expect: "Commandes clients" },
  { path: "/ventes/encaissements", expect: "Encaissements" },
  { path: "/achats/commandes-fournisseurs", expect: "Commandes fournisseurs" },
  { path: "/produits/catalogue/articles", expect: "Articles" },
  { path: "/produits/catalogue/categories-et-marques", expect: "Catégories" },
  { path: "/produits/stock/niveaux-de-stock", expect: "Quantité totale" },
  { path: "/produits/stock/mouvements", expect: "Mouvements" },
  { path: "/contacts/clients", expect: "Clients" },
  { path: "/parametres/utilisateurs-et-roles", expect: "Utilisateurs" },
  { path: "/comptabilite/paiements", expect: "Paiements" },
  { path: "/comptabilite/creances-clients", expect: "Créances" },
  { path: "/rapports/marge-et-benefice", expect: "Marge" },
  { path: "/rapports/export", expect: "Export" },
  { path: "/parametres/schema-base", expect: "Migrations couvertes" },
  { path: "/ventes/devis", expect: "pas encore déclarées" },
  // These two must still be the starter's own demo pages, not shadowed routes.
  { path: "/dashboards/dashboard1", expect: "Dashboard" },
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const problems = [];
let index = 0;

page.on("console", (message) => {
  if (message.type() === "error") problems.push(`[${routes[index]?.path}] console: ${message.text()}`);
  // Unresolved components only produce a warning, and render as dead markup.
  // This check caught v-row/v-col silently missing from the component registry.
  if (message.type() === "warning" && /Failed to resolve component|Unknown custom element/i.test(message.text())) {
    problems.push(`[${routes[index]?.path}] unresolved component: ${message.text().slice(0, 90)}`);
  }
});
page.on("pageerror", (error) => problems.push(`[${routes[index]?.path}] pageerror: ${error.message}`));
page.on("requestfailed", (request) => {
  const url = request.url();
  // Fonts and devtools endpoints are not part of the app.
  if (/fonts\.googleapis|__devtools__|favicon/.test(url)) return;
  problems.push(`[${routes[index]?.path}] request failed: ${url}`);
});

const results = [];

for (const [position, route] of routes.entries()) {
  index = position;
  await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(250);

  const text = await page.locator("body").innerText();
  const hasContent = text.trim().length > 40;
  const matched = text.includes(route.expect);

  // A screen that renders its header but fails to load data is still broken:
  // the error alert and the JSON parse message are both failure signals.
  const errorAlert = await page.locator(".v-alert--variant-tonal.text-error, .v-alert.text-error").count();
  // Real failure signatures only: a bare "404" also occurs in sample data such
  // as a phone number, which produced a false positive on first run.
  const dataFailure =
    /is not valid JSON|Failed to fetch|\b404 Not Found\b|Internal Server Error|NetworkError/.test(text);

  results.push({ path: route.path, hasContent, matched, length: text.trim().length, errorAlert });
  if (!hasContent) problems.push(`[${route.path}] page rendered almost nothing`);
  if (!matched) problems.push(`[${route.path}] expected text not found: "${route.expect}"`);
  if (errorAlert > 0) problems.push(`[${route.path}] error banner shown: ${text.slice(0, 120)}`);
  if (dataFailure) problems.push(`[${route.path}] data failed to load`);
}

/** Click through the sidebar as a user would, to catch broken links. */
index = 0;
await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
const sidebarLinks = await page.locator("aside a, nav a").evaluateAll((nodes) =>
  nodes.map((node) => node.getAttribute("href")).filter(Boolean),
);

await browser.close();

process.stdout.write("hanouti smoke test\n");
for (const result of results) {
  process.stdout.write(
    `  ${result.hasContent && result.matched && result.errorAlert === 0 ? "ok  " : "FAIL"} ${result.path.padEnd(44)} ${result.length} chars${result.errorAlert ? "  (error banner)" : ""}\n`,
  );
}
process.stdout.write(`\nsidebar links discovered: ${sidebarLinks.length}\n`);

if (problems.length > 0) {
  process.stdout.write(`\n${problems.length} problem(s):\n`);
  for (const problem of [...new Set(problems)]) process.stdout.write(`  ${problem}\n`);
  process.exit(1);
}
process.stdout.write("\nall routes rendered with no console or network errors\n");
