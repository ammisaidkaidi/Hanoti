/**
 * The application navigation, and what each entry actually renders.
 *
 * The French ERP sidebar already exists in the template
 * (builtin/assets/AppSitemap.V2.json); each item carries the path it was meant
 * to have (`path1`) and a placeholder demo route (`path`). This module promotes
 * `path1` to the real route and states, per entry, which of three things it
 * shows:
 *
 *   entity   — a screen generated from one or more declared tables;
 *   derived  — a screen computed from declared data (no table of its own);
 *   planned  — a screen whose tables are not declared yet: it says so, and names
 *              what it would need, instead of faking a working page.
 *
 * Nothing here invents data. An entry is `entity` only when a table exists.
 */
import sitemap from '../../builtin/assets/AppSitemap.V2.json';
import { entitiesByKey } from './generated/schema.js';

const aliases = {
  '/tableau-de-bord/ventes': { kind: 'dashboard', title: 'Ventes du jour, semaine et mois' },
  '/tableau-de-bord/alertes-stock': { kind: 'dashboard', focus: 'alerts', title: 'Alertes de stock' },
  '/tableau-de-bord/creances-et-dettes': { kind: 'dashboard', focus: 'balances', title: 'Créances et dettes' },
  '/tableau-de-bord/solde-de-caisse': { kind: 'dashboard', focus: 'cash', title: 'Solde de caisse' },

  // Ventes — only the pieces the schema actually declares.
  '/ventes/commandes-clients': { kind: 'entity', entity: 'erp.sales_orders' },
  '/ventes/factures-de-vente': {
    kind: 'entity',
    entity: 'erp.sales_orders',
    view: 'invoices',
    title: 'Factures de vente',
    note: 'Les totaux sont calculés à partir des lignes de commande.',
  },
  '/ventes/encaissements': {
    kind: 'entity',
    entity: 'erp.payments',
    filter: { direction: ['in', 'incoming'] },
    title: 'Encaissements clients',
  },

  // Achats
  '/achats/commandes-fournisseurs': { kind: 'entity', entity: 'erp.purchase_orders' },
  '/achats/factures-achat': { kind: 'entity', entity: 'erp.purchase_orders', view: 'invoices' },
  '/achats/paiements-fournisseurs': {
    kind: 'entity',
    entity: 'erp.payments',
    filter: { direction: ['out', 'outgoing'] },
    title: 'Paiements fournisseurs',
  },

  // Produits
  '/produits/catalogue/articles': { kind: 'entity', entity: 'erp.products' },
  '/produits/catalogue/categories-et-marques': {
    kind: 'entity',
    tabs: [
      { entity: 'erp.categories', label: 'Catégories' },
      { entity: 'erp.brands', label: 'Marques' },
    ],
  },
  '/produits/catalogue/prix-et-tarifs': {
    kind: 'entity',
    entity: 'erp.products',
    view: 'prices',
    title: 'Prix et tarifs',
  },
  '/produits/stock/niveaux-de-stock': { kind: 'derived', view: 'stock-levels' },
  '/produits/stock/mouvements': { kind: 'entity', entity: 'erp.stock_movements' },
  '/produits/stock/depots-et-emplacements': { kind: 'entity', entity: 'erp.warehouses' },

  // Contacts
  '/contacts/clients': { kind: 'entity', entity: 'erp.customers' },
  '/contacts/fournisseurs': { kind: 'entity', entity: 'erp.suppliers' },
  '/contacts/agents': { kind: 'derived', view: 'staff', title: 'Agents' },
  '/contacts/employes': { kind: 'entity', entity: 'auth.users', title: 'Employés' },
  '/contacts/autres': {
    kind: 'entity',
    entity: 'erp.customers',
    view: 'parties',
    title: 'Autres tiers',
    note: 'Tiers dont le type n’est ni client ni fournisseur.',
  },

  // Comptabilité — the schema has payments only.
  '/comptabilite/paiements': { kind: 'entity', entity: 'erp.payments' },
  '/comptabilite/creances-clients': { kind: 'derived', view: 'receivables', title: 'Créances clients' },
  '/comptabilite/dettes-fournisseurs': { kind: 'derived', view: 'payables', title: 'Dettes fournisseurs' },
  '/comptabilite/tva-et-taxes': {
    kind: 'entity',
    entity: 'settings.setting_definitions',
    filter: { category: ['tax', 'vat'] },
    title: 'TVA et taxes',
  },

  // Rapports — computed from declared data.
  '/rapports/ventes': { kind: 'derived', view: 'report-sales', title: 'Rapport des ventes' },
  '/rapports/achats': { kind: 'derived', view: 'report-purchases', title: 'Rapport des achats' },
  '/rapports/marge-et-benefice': { kind: 'derived', view: 'report-margin', title: 'Marge et bénéfice' },
  '/rapports/valeur-du-stock': { kind: 'derived', view: 'report-stock-value', title: 'Valeur du stock' },
  '/rapports/export': { kind: 'derived', view: 'export', title: 'Export des données' },

  // Paramètres
  '/parametres/utilisateurs-et-roles': {
    kind: 'entity',
    tabs: [
      { entity: 'auth.users', label: 'Utilisateurs' },
      { entity: 'auth.roles', label: 'Rôles' },
      { entity: 'auth.permissions', label: 'Permissions' },
      { entity: 'auth.role_permissions', label: 'Permissions des rôles' },
      { entity: 'auth.user_roles', label: 'Rôles attribués' },
    ],
    title: 'Utilisateurs et rôles',
  },
  '/parametres/devises-et-taxes': {
    kind: 'entity',
    entity: 'settings.setting_definitions',
    filter: { category: ['currency', 'tax', 'vat'] },
    title: 'Devises et taxes',
  },
  '/parametres/numerotation-des-documents': {
    kind: 'entity',
    entity: 'settings.settings',
    title: 'Numérotation des documents',
  },
  '/parametres/langue': {
    kind: 'entity',
    entity: 'app.user_preferences',
    title: 'Langue et préférences',
  },
  '/parametres/societe-et-structure': { kind: 'planned', needs: ['settings.setting_definitions'], title: 'Société' },
  '/parametres/sauvegarde-et-restauration': {
    kind: 'planned',
    title: 'Sauvegarde et restauration',
    note: 'Le module de sauvegarde vit dans hanoti/data/BACKUPS.md ; il sera exposé ici.',
  },
};

/** Items with no tables declared yet, with what they would need. */
const plannedByPath = {
  '/ventes/point-de-vente': ['erp.sales_orders', 'erp.payments', 'sessions de caisse'],
  '/ventes/devis': ['table de devis (non déclarée)'],
  '/ventes/bons-de-livraison': ['table de livraisons (non déclarée)'],
  '/ventes/retours-et-avoirs-clients': ['tables retours/avoirs (non déclarées)'],
  '/achats/demandes-de-prix': ['table de demandes de prix (non déclarée)'],
  '/achats/bons-de-reception': ['table de réceptions (non déclarée)'],
  '/achats/retours-fournisseurs': ['table de retours fournisseurs (non déclarée)'],
  '/produits/catalogue/unites': ['table des unités (unit_code existe comme colonne)'],
  '/produits/stock/inventaire': ['tables d’inventaire (non déclarées)'],
  '/produits/stock/lots-et-peremption': ['tables de lots (non déclarées)'],
  '/comptabilite/caisse': ['tables de caisse (non déclarées)'],
  '/comptabilite/banque': ['tables bancaires (non déclarées)'],
  '/comptabilite/depenses-et-charges': ['tables de dépenses (non déclarées)'],
  '/comptabilite/journal-et-plan-comptable': ['plan comptable (non déclaré)'],
  '/comptabilite/bilan-et-resultats': ['plan comptable (non déclaré)'],
  '/parametres/modeles-impression': ['modèles d’impression (non déclarés)'],
};

/** Resolve one sitemap item to its screen definition. */
export function screenFor(path1) {
  const alias = aliases[path1];
  if (alias) return alias;

  if (path1 in plannedByPath)
    return { kind: 'planned', needs: plannedByPath[path1] };

  // Schema browser is offered from the sitemap's export entry plus its own route.
  if (path1 === '/rapports/export') return { kind: 'derived', view: 'export' };

  return { kind: 'planned', needs: ['table non déclarée'] };
}

/** Extra entries that are not part of the ERP sitemap. */
const systemGroup = [
  {
    title: "SYSTÈME",
    items: [
      { name: "Schéma de la base", icon: "table", path: "/parametres/schema-base", screen: { kind: "schema" } },
      { name: "Modèles d'interface", icon: "grid", path: "/dashboards/dashboard1", screen: { kind: "template" } },
      { name: "Répertoire des routes", icon: "list", path: "/pages/route-directory", screen: { kind: "template" } },
    ],
  },
];

/**
 * Sidebar groups, same shape the shell expects, with `path` rewritten to the
 * real route so every entry navigates somewhere that exists.
 */
export const groups = Object.fromEntries(
  Object.entries(sitemap).map(([group, sections]) => [
    group,
    sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        path: item.path1 ?? item.path,
        screen: screenFor(item.path1 ?? item.path),
        children: item.children?.map((child) => ({
          ...child,
          path: child.path1 ?? child.path,
          screen: screenFor(child.path1 ?? child.path),
        })),
      })),
    })),
  ]),
);

/** Every navigable entry, flattened, for the route table and the search box. */
/** Every navigable entry, flattened, for the route table and the search box. */
const erpEntries = Object.entries(groups).flatMap(([group, sections]) =>
  sections.flatMap((section) =>
    section.items.flatMap((item) => [
      {
        group,
        section: section.title,
        name: item.name,
        title: item.title ?? item.name,
        icon: item.icon,
        path: item.path,
        screen: item.screen,
      },
      ...(item.children ?? []).map((child) => ({
        group,
        section: section.title,
        name: child.name,
        title: child.title ?? child.name,
        icon: child.icon,
        path: child.path,
        screen: child.screen,
      })),
    ]),
  ),
);

/** ERP entries plus the system group, which has no ERP screen definition. */
export const entries = [
  ...erpEntries,
  ...systemGroup[0].items.map((item) => ({
    group: "Système",
    section: systemGroup[0].title,
    name: item.name,
    title: item.name,
    icon: item.icon,
    path: item.path,
    screen: item.screen,
  })),
];

/** Groups including the system section, for the sidebar. */
export const sidebarGroups = { ...groups, Système: systemGroup };

/** The default landing screen. */
export const homePath = '/tableau-de-bord/ventes';

/** Counts used by the dashboard and the schema browser. */
export function screenStats() {
  const byKind = entries.reduce((totals, entry) => {
    totals[entry.screen.kind] = (totals[entry.screen.kind] ?? 0) + 1;
    return totals;
  }, {});
  return { screens: entries.length, byKind, tables: Object.keys(entitiesByKey).length };
}
