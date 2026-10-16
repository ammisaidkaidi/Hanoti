<script setup>
/**
 * Computed screens.
 *
 * Some entries in the navigation have no table of their own: stock levels are
 * the sum of `erp.stock_movements.quantity_delta`, receivables come from order
 * lines minus payments, and the reports aggregate those. This view calculates
 * them from declared data — no new tables, no invented figures — and shows the
 * arithmetic it used, so the numbers can be checked.
 */
import { computed, onMounted, ref, watch } from "vue";
import { repo } from "../api.js";
import { entitiesByKey } from "../generated/schema.js";
import { money, numberFormatter } from "../fields.js";
import { tableLabel } from "../labels.js";

const props = defineProps({
  screen: { type: Object, required: true },
  title: { type: String, default: "" },
});

const view = computed(() => props.screen.view ?? "export");
const loading = ref(true);
const error = ref(null);
const data = ref({});
const query = ref("");

const dateFormat = new Intl.DateTimeFormat("fr-DZ", { dateStyle: "medium" });
function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormat.format(date);
}

const propOf = (key, column) =>
  entitiesByKey[key]?.columns.find((item) => item.name === column)?.property ?? column;

async function load() {
  loading.value = true;
  error.value = null;
  try {
    switch (view.value) {
      case "stock-levels":
      case "report-stock-value":
        await loadStock();
        break;
      case "receivables":
      case "payables":
      case "report-sales":
      case "report-purchases":
      case "report-margin":
      case "staff":
        await loadAggregates();
        break;
      case "export":
        data.value = { tables: Object.keys(entitiesByKey) };
        break;
      default:
        data.value = {};
    }
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    loading.value = false;
  }
}

/** Stock levels: per product, the sum of every movement delta. */
async function loadStock() {
  const [products, movements, warehouses] = await Promise.all([
    repo.list("erp.products"),
    repo.list("erp.stock_movements"),
    repo.list("erp.warehouses"),
  ]);

  const pProduct = propOf("erp.products", "id");
  const pName = propOf("erp.products", "name");
  const pSku = propOf("erp.products", "sku");
  const pReorder = propOf("erp.products", "reorder_level");
  const pSale = propOf("erp.products", "sale_price");
  const mProduct = propOf("erp.stock_movements", "product_id");
  const mDelta = propOf("erp.stock_movements", "quantity_delta");
  const mWarehouse = propOf("erp.stock_movements", "warehouse_id");
  const wId = propOf("erp.warehouses", "id");
  const wName = propOf("erp.warehouses", "name");

  const warehouseName = new Map(warehouses.map((row) => [row[wId], row[wName]]));
  const byProduct = new Map();
  for (const movement of movements) {
    const key = `${movement[mProduct]}|${movement[mWarehouse]}`;
    const entry = byProduct.get(key) ?? { product: movement[mProduct], warehouse: movement[mWarehouse], quantity: 0 };
    entry.quantity += Number(movement[mDelta]) || 0;
    byProduct.set(key, entry);
  }

  const productIndex = new Map(products.map((row) => [row[pProduct], row]));
  const rows = [...byProduct.values()].map((entry) => {
    const product = productIndex.get(entry.product) ?? {};
    const reorder = Number(product[pReorder]) || 0;
    return {
      id: `${entry.product}-${entry.warehouse}`,
      name: product[pName] ?? "—",
      sku: product[pSku] ?? "—",
      warehouse: warehouseName.get(entry.warehouse) ?? "—",
      quantity: entry.quantity,
      reorder,
      value: entry.quantity * (Number(product[pSale]) || 0),
      alert: reorder > 0 && entry.quantity <= reorder,
    };
  });

  const filtered = query.value
    ? rows.filter((row) =>
        `${row.name} ${row.sku} ${row.warehouse}`.toLowerCase().includes(query.value.toLowerCase()),
      )
    : rows;

  data.value = {
    rows: filtered.sort((left, right) => left.name.localeCompare(right.name, "fr")),
    totalValue: rows.reduce((total, row) => total + row.value, 0),
    totalQuantity: rows.reduce((total, row) => total + row.quantity, 0),
    alerts: rows.filter((row) => row.alert).length,
  };
}

/** Aggregates: order lines, payments, products and parties. */
async function loadAggregates() {
  const [orders, orderLines, purchaseOrders, purchaseLines, payments, products, customers, suppliers, users, memberships] =
    await Promise.all([
      repo.list("erp.sales_orders"),
      repo.list("erp.sales_order_items"),
      repo.list("erp.purchase_orders"),
      repo.list("erp.purchase_order_items"),
      repo.list("erp.payments"),
      repo.list("erp.products"),
      repo.list("erp.customers"),
      repo.list("erp.suppliers"),
      repo.list("auth.users"),
      repo.list("auth.party_memberships"),
    ]);

  const lineTotal = (row) => Number(row[propOf("erp.sales_order_items", "line_total")]) || 0;
  const purchaseLineTotal = (row) => Number(row[propOf("erp.purchase_order_items", "line_total")]) || 0;
  const paymentAmount = (row) => Number(row[propOf("erp.payments", "amount")]) || 0;
  const paymentDirection = (row) => String(row[propOf("erp.payments", "direction")] ?? "").toLowerCase();

  const salesTotal = orderLines.reduce((total, row) => total + lineTotal(row), 0);
  const purchaseTotal = purchaseLines.reduce((total, row) => total + purchaseLineTotal(row), 0);
  const incoming = payments.filter((row) => ["in", "incoming"].includes(paymentDirection(row)));
  const outgoing = payments.filter((row) => ["out", "outgoing"].includes(paymentDirection(row)));

  const byStatus = (rows, key) => {
    const property = propOf(key, "status");
    return rows.reduce((totals, row) => {
      const status = String(row[property] ?? "inconnu");
      totals[status] = (totals[status] ?? 0) + 1;
      return totals;
    }, {});
  };

  const byMonth = (rows, key, amountOf) => {
    const dateProperty = propOf(key, "ordered_at");
    const totals = new Map();
    for (const row of rows) {
      const value = row[dateProperty];
      if (!value) continue;
      const month = String(value).slice(0, 7);
      totals.set(month, (totals.get(month) ?? 0) + amountOf(row));
    }
    return [...totals.entries()].sort().map(([month, total]) => ({ month, total }));
  };

  // Margin: last purchase unit cost per product against its sale price.
  const salesUnitPrice = propOf("erp.sales_order_items", "unit_price");
  const purchaseUnitCost = propOf("erp.purchase_order_items", "unit_cost");
  const unitCost = new Map();
  for (const line of purchaseLines) {
    unitCost.set(line[propOf("erp.purchase_order_items", "product_id")], Number(line[purchaseUnitCost]) || 0);
  }
  const marginRows = products.map((product) => {
    const id = product[propOf("erp.products", "id")];
    const sale = Number(product[propOf("erp.products", "sale_price")]) || 0;
    const cost = unitCost.get(id) ?? null;
    return {
      id,
      name: product[propOf("erp.products", "name")] ?? "—",
      sku: product[propOf("erp.products", "sku")] ?? "—",
      sale,
      cost,
      margin: cost === null ? null : sale - cost,
      marginRate: cost === null || sale === 0 ? null : (sale - cost) / sale,
    };
  });

  data.value = {
    salesTotal,
    purchaseTotal,
    grossMargin: salesTotal - purchaseTotal,
    salesOrders: orders.length,
    purchaseOrders: purchaseOrders.length,
    salesByStatus: byStatus(orders, "erp.sales_orders"),
    purchaseByStatus: byStatus(purchaseOrders, "erp.purchase_orders"),
    salesByMonth: byMonth(orders, "erp.sales_orders", (row) => lineTotal(row)),
    purchaseByMonth: byMonth(purchaseOrders, "erp.purchase_orders", (row) => purchaseLineTotal(row)),
    receivables: {
      invoiced: salesTotal,
      received: incoming.reduce((total, row) => total + paymentAmount(row), 0),
    },
    payables: {
      invoiced: purchaseTotal,
      paid: outgoing.reduce((total, row) => total + paymentAmount(row), 0),
    },
    marginRows: marginRows.sort((left, right) => (right.margin ?? -Infinity) - (left.margin ?? -Infinity)),
    customers,
    suppliers,
    staff: users.map((user) => ({
      id: user[propOf("auth.users", "id")],
      name: user[propOf("auth.users", "display_name")] ?? user[propOf("auth.users", "email")] ?? "—",
      email: user[propOf("auth.users", "email")] ?? "—",
      status: user[propOf("auth.users", "status")] ?? "—",
      memberships: memberships.filter(
        (membership) => membership[propOf("auth.party_memberships", "user_id")] === user[propOf("auth.users", "id")],
      ).length,
    })),
    counts: {
      customers: customers.length,
      suppliers: suppliers.length,
      users: users.length,
      products: products.length,
      memberships: memberships.length,
    },
    salesUnitPriceProperty: salesUnitPrice,
  };
}

/** Client-side CSV export of any declared table. */
const exporting = ref(null);
async function exportCsv(key) {
  exporting.value = key;
  try {
    const rows = await repo.list(key);
    if (rows.length === 0) {
      exportCsvText(`${key.replace(".", "-")}.csv`, "");
      return;
    }
    const columns = Object.keys(rows[0]);
    const escape = (value) =>
      value === null || value === undefined
        ? ""
        : `"${String(typeof value === "object" ? JSON.stringify(value) : value).replace(/"/g, '""')}"`;
    const csv = [
      columns.join(","),
      ...rows.map((row) => columns.map((column) => escape(row[column])).join(",")),
    ].join("\n");
    exportCsvText(`${key.replace(".", "-")}.csv`, csv);
  } finally {
    exporting.value = null;
  }
}

function exportCsvText(filename, content) {
  const blob = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** The formula each computed screen uses, shown so numbers can be audited. */
const formula = computed(() => {
  switch (view.value) {
    case "stock-levels":
      return "Somme de erp.stock_movements.quantity_delta par article et dépôt.";
    case "receivables":
      return "Sum(erp.sales_order_items.line_total) − paiements entrants (erp.payments.direction).";
    case "payables":
      return "Sum(erp.purchase_order_items.line_total) − paiements sortants (erp.payments.direction).";
    case "report-sales":
      return "Totaux des lignes de vente, regroupés par statut de commande et par mois.";
    case "report-purchases":
      return "Totaux des lignes d'achat, regroupés par statut de commande et par mois.";
    case "report-margin":
      return "Marge = prix de vente (erp.products.sale_price) − dernier coût unitaire d'achat.";
    case "report-stock-value":
      return "Valeur = quantité en stock × prix de vente. Estimation, pas une valorisation comptable.";
    case "staff":
      return "Utilisateurs (auth.users) et nombre de rattachements (auth.party_memberships).";
    case "export":
      return "Export CSV des tables déclarées, calculé dans le navigateur.";
    default:
      return "";
  }
});

watch([view, query], load);
watch(view, () => (query.value = ""));
onMounted(load);
</script>

<template>
  <div>
    <header class="hu-head">
      <div>
        <h1>{{ title || "Écran calculé" }}</h1>
        <p class="hu-sub">{{ formula }}</p>
      </div>
      <v-btn variant="tonal" size="small" :loading="loading" @click="load">
        <Icon name="refresh" size="16" class="mr-1" />Recalculer
      </v-btn>
    </header>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>

    <!-- Stock levels -->
    <template v-if="view === 'stock-levels' || view === 'report-stock-value'">
      <v-row dense class="mb-2">
        <v-col cols="12" sm="4">
          <v-card class="pa-4 hu-kpi">
            <p class="hu-kpi-label">Quantité totale</p>
            <p class="hu-kpi-value">{{ numberFormatter.format(data.totalQuantity ?? 0) }}</p>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card class="pa-4 hu-kpi">
            <p class="hu-kpi-label">Valeur estimée</p>
            <p class="hu-kpi-value">{{ money(data.totalValue ?? 0) }}</p>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card class="pa-4 hu-kpi">
            <p class="hu-kpi-label">Sous le seuil</p>
            <p class="hu-kpi-value">{{ numberFormatter.format(data.alerts ?? 0) }}</p>
          </v-card>
        </v-col>
      </v-row>

      <v-text-field v-model="query" label="Filtrer par article, référence ou dépôt" density="compact" class="mb-3" />

      <v-card class="pa-2 hu-card">
        <v-table density="compact" class="hu-table">
          <thead>
            <tr>
              <th>Article</th>
              <th>Référence</th>
              <th>Dépôt</th>
              <th class="text-end">Quantité</th>
              <th class="text-end">Seuil</th>
              <th class="text-end">Valeur</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in data.rows ?? []" :key="row.id" :class="{ 'hu-alert-row': row.alert }">
              <td>{{ row.name }}</td>
              <td class="hu-muted">{{ row.sku }}</td>
              <td class="hu-muted">{{ row.warehouse }}</td>
              <td class="text-end">{{ numberFormatter.format(row.quantity) }}</td>
              <td class="text-end hu-muted">{{ row.reorder || "—" }}</td>
              <td class="text-end">{{ money(row.value) }}</td>
            </tr>
          </tbody>
        </v-table>
        <p v-if="(data.rows ?? []).length === 0" class="hu-empty">Aucun mouvement de stock enregistré.</p>
      </v-card>
    </template>

    <!-- Receivables / payables -->
    <template v-else-if="view === 'receivables' || view === 'payables'">
      <v-row dense>
        <v-col cols="12" sm="4">
          <v-card class="pa-4 hu-kpi">
            <p class="hu-kpi-label">Total facturé</p>
            <p class="hu-kpi-value">
              {{ money((view === "receivables" ? data.receivables : data.payables)?.invoiced ?? 0) }}
            </p>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card class="pa-4 hu-kpi">
            <p class="hu-kpi-label">{{ view === "receivables" ? "Encaissé" : "Payé" }}</p>
            <p class="hu-kpi-value">
              {{ money((view === "receivables" ? data.receivables : data.payables)?.received ?? (view === "receivables" ? 0 : data.payables?.paid ?? 0)) }}
            </p>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card class="pa-4 hu-kpi hu-kpi-strong">
            <p class="hu-kpi-label">Solde</p>
            <p class="hu-kpi-value">
              {{
                money(
                  ((view === "receivables" ? data.receivables?.invoiced : data.payables?.invoiced) ?? 0) -
                    ((view === "receivables" ? data.receivables?.received : data.payables?.paid) ?? 0),
                )
              }}
            </p>
          </v-card>
        </v-col>
      </v-row>
      <v-alert type="info" variant="tonal" density="compact" class="mt-3">
        Le solde dépend de la complétude des paiements enregistrés : cette vue ne remplace pas un
        lettrage comptable.
      </v-alert>
    </template>

    <!-- Staff -->
    <template v-else-if="view === 'staff'">
      <v-card class="pa-2 hu-card">
        <v-table density="compact" class="hu-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>E-mail</th>
              <th>Statut</th>
              <th class="text-end">Rattachements</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in data.staff ?? []" :key="row.id">
              <td>{{ row.name }}</td>
              <td class="hu-muted">{{ row.email }}</td>
              <td>{{ row.status }}</td>
              <td class="text-end">{{ row.counts ?? row.memberships }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </template>

    <!-- Reports -->
    <template v-else-if="view === 'report-margin'">
      <v-card class="pa-2 hu-card">
        <v-table density="compact" class="hu-table">
          <thead>
            <tr>
              <th>Article</th>
              <th>Référence</th>
              <th class="text-end">Prix de vente</th>
              <th class="text-end">Dernier coût d'achat</th>
              <th class="text-end">Marge</th>
              <th class="text-end">Taux</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in (data.marginRows ?? []).slice(0, 50)" :key="row.id">
              <td>{{ row.name }}</td>
              <td class="hu-muted">{{ row.sku }}</td>
              <td class="text-end">{{ money(row.sale) }}</td>
              <td class="text-end">{{ row.cost === null ? "—" : money(row.cost) }}</td>
              <td class="text-end">{{ row.margin === null ? "—" : money(row.margin) }}</td>
              <td class="text-end">{{ row.marginRate === null ? "—" : `${(row.marginRate * 100).toFixed(1)} %` }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </template>

    <template v-else-if="view === 'report-sales' || view === 'report-purchases'">
      <v-row dense>
        <v-col cols="12" sm="4">
          <v-card class="pa-4 hu-kpi">
            <p class="hu-kpi-label">Total lignes</p>
            <p class="hu-kpi-value">
              {{ money(view === "report-sales" ? data.salesTotal ?? 0 : data.purchaseTotal ?? 0) }}
            </p>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card class="pa-4 hu-kpi">
            <p class="hu-kpi-label">Commandes</p>
            <p class="hu-kpi-value">
              {{ numberFormatter.format(view === "report-sales" ? data.salesOrders ?? 0 : data.purchaseOrders ?? 0) }}
            </p>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card class="pa-4 hu-kpi">
            <p class="hu-kpi-label">Statuts</p>
            <p class="hu-kpi-value">{{ Object.keys(view === "report-sales" ? data.salesByStatus ?? {} : data.purchaseByStatus ?? {}).length }}</p>
          </v-card>
        </v-col>
      </v-row>

      <v-card class="pa-4 hu-card mt-3">
        <h2 class="hu-card-title">Par statut</h2>
        <ul class="hu-list">
          <li v-for="(count, status) in view === 'report-sales' ? data.salesByStatus : data.purchaseByStatus" :key="status">
            <span>{{ status }}</span><strong>{{ count }}</strong>
          </li>
        </ul>
      </v-card>

      <v-card class="pa-4 hu-card mt-3">
        <h2 class="hu-card-title">Par mois</h2>
        <ul class="hu-list">
          <li v-for="entry in view === 'report-sales' ? data.salesByMonth ?? [] : data.purchaseByMonth ?? []" :key="entry.month">
            <span>{{ entry.month }}</span><strong>{{ money(entry.total) }}</strong>
          </li>
        </ul>
        <p v-if="((view === 'report-sales' ? data.salesByMonth : data.purchaseByMonth) ?? []).length === 0" class="hu-empty">
          Pas assez de dates renseignées pour un regroupement mensuel.
        </p>
      </v-card>
    </template>

    <!-- Export -->
    <template v-else-if="view === 'export'">
      <v-alert type="info" variant="tonal" density="compact" class="mb-3">
        L'export lit les données via la couche d'accès actuelle : démonstration aujourd'hui, API
        demain. Aucun fichier n'est envoyé au serveur.
      </v-alert>
      <v-card class="pa-3 hu-card">
        <div class="hu-export-grid">
          <v-btn
            v-for="key in data.tables ?? []"
            :key="key"
            variant="tonal"
            size="small"
            :loading="exporting === key"
            @click="exportCsv(key)"
          >
            <Icon name="download" size="15" class="mr-1" />{{ tableLabel(key) }}
          </v-btn>
        </div>
      </v-card>
    </template>
  </div>
</template>

<style scoped>
.hu-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}
.hu-head h1 {
  font-size: 21px;
  font-weight: 700;
}
.hu-sub {
  font-size: 13px;
  color: rgb(var(--v-theme-muted));
  max-width: 80ch;
}
.hu-kpi {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
.hu-kpi-strong {
  background: rgba(var(--v-theme-primary), 0.06);
}
.hu-kpi-label {
  font-size: 12px;
  color: rgb(var(--v-theme-muted));
}
.hu-kpi-value {
  font-size: 22px;
  font-weight: 700;
}
.hu-card-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
}
.hu-table th {
  font-size: 12px !important;
  color: rgb(var(--v-theme-muted)) !important;
}
.hu-muted {
  color: rgb(var(--v-theme-muted));
}
.hu-empty {
  font-size: 13px;
  color: rgb(var(--v-theme-muted));
  padding: 12px;
}
.hu-alert-row {
  background: rgba(var(--v-theme-error), 0.06);
}
.hu-list {
  list-style: none;
  font-size: 13px;
}
.hu-list li {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.hu-export-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
