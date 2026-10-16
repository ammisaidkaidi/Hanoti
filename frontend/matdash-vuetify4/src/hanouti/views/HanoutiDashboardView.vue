<script setup>
/**
 * Tableau de bord — key figures, stock alerts, balances and cash.
 *
 * Every number is computed by api.js from the data the adapter returns. With
 * the mock adapter that means sample data; with the HTTP adapter the same code
 * produces real figures, so nothing here changes when the backend lands.
 */
import { computed, onMounted, ref, watch } from "vue";
import { dashboardSnapshot } from "../api.js";
import { money, numberFormatter } from "../fields.js";
import { columnLabel } from "../labels.js";

const props = defineProps({
  screen: { type: Object, required: true },
  title: { type: String, default: "" },
});

const snapshot = ref(null);
const loading = ref(true);
const error = ref(null);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    snapshot.value = await dashboardSnapshot();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(() => props.screen, load);

const focus = computed(() => props.screen?.focus ?? null);

const tiles = computed(() => {
  const data = snapshot.value;
  if (!data) return [];
  return [
    {
      key: "sales",
      label: "Commandes clients",
      value: numberFormatter.format(data.salesOrders),
      hint: "Commandes enregistrées dans erp.sales_orders",
      icon: "invoice",
      color: "primary",
      to: "/ventes/commandes-clients",
    },
    {
      key: "purchases",
      label: "Commandes fournisseurs",
      value: numberFormatter.format(data.purchaseOrders),
      hint: "Commandes enregistrées dans erp.purchase_orders",
      icon: "truck",
      color: "secondary",
      to: "/achats/commandes-fournisseurs",
    },
    {
      key: "products",
      label: "Articles",
      value: numberFormatter.format(data.products),
      hint: "Lignes de erp.products",
      icon: "package",
      color: "success",
      to: "/produits/catalogue/articles",
    },
    {
      key: "alertes",
      label: "Alertes de stock",
      value: numberFormatter.format(data.lowStock.length),
      hint: "Articles au niveau ou sous le seuil de réapprovisionnement",
      icon: "bell",
      color: data.lowStock.length > 0 ? "error" : "success",
      to: "/produits/stock/niveaux-de-stock",
    },
  ];
});

const payments = computed(() => snapshot.value?.paymentsTotal ?? 0);

const stockRows = computed(() =>
  (snapshot.value?.lowStock ?? []).slice(0, 8).map((product) => ({
    id: product.id,
    name: product.name ?? product.sku ?? "—",
    sku: product.sku ?? "—",
    stock: product.stock ?? product.quantity ?? 0,
    reorder: product.reorderLevel ?? product.reorder_level ?? 0,
  })),
);

const orderRows = computed(() =>
  (snapshot.value?.recentOrders ?? []).map((order) => ({
    id: order.id,
    number: order.orderNumber ?? order.order_number ?? "—",
    status: order.status ?? "—",
    date: order.orderedAt ?? order.ordered_at ?? order.createdAt ?? "",
  })),
);

const movementRows = computed(() =>
  (snapshot.value?.recentMovements ?? []).map((movement) => ({
    id: movement.id,
    kind: movement.kind ?? "—",
    delta: movement.quantityDelta ?? movement.quantity_delta ?? 0,
    date: movement.occurredAt ?? movement.occurred_at ?? "",
  })),
);

const dateFormat = new Intl.DateTimeFormat("fr-DZ", { dateStyle: "medium" });
function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormat.format(date);
}
</script>

<template>
  <div>
    <header class="hu-head">
      <div>
        <h1>{{ title || "Tableau de bord" }}</h1>
        <p class="hu-sub">
          Vue d'ensemble calculée à partir des tables déclarées : ventes, achats, articles et
          mouvements de stock.
        </p>
      </div>
      <v-btn variant="tonal" size="small" :loading="loading" @click="load">
        <Icon name="refresh" size="16" class="mr-1" />Actualiser
      </v-btn>
    </header>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>

    <v-row dense class="mb-2">
      <v-col v-for="tile in tiles" :key="tile.key" cols="12" sm="6" lg="3">
        <v-card class="hu-tile" :ripple="false">
          <div class="hu-tile-top">
            <v-avatar :color="tile.color" variant="tonal" rounded="lg" size="38">
              <Icon :name="tile.icon" size="18" />
            </v-avatar>
            <span class="hu-tile-label">{{ tile.label }}</span>
          </div>
          <p class="hu-tile-value">{{ loading && !snapshot ? "…" : tile.value }}</p>
          <p class="hu-tile-hint">{{ tile.hint }}</p>
          <router-link class="hu-tile-link" :to="tile.to">Ouvrir</router-link>
        </v-card>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="12" lg="6">
        <v-card class="pa-4 hu-card">
          <h2 class="hu-card-title">Alertes de stock</h2>
          <p class="hu-card-sub">
            Articles dont le stock atteint le seuil <code>reorder_level</code>.
          </p>
          <v-table v-if="stockRows.length" density="compact" class="hu-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Référence</th>
                <th class="text-end">Stock</th>
                <th class="text-end">Seuil</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in stockRows" :key="row.id">
                <td>{{ row.name }}</td>
                <td class="hu-muted">{{ row.sku }}</td>
                <td class="text-end">{{ numberFormatter.format(row.stock) }}</td>
                <td class="text-end">{{ numberFormatter.format(row.reorder) }}</td>
              </tr>
            </tbody>
          </v-table>
          <p v-else class="hu-empty">
            Aucune alerte : soit les seuils ne sont pas renseignés, soit le stock est suffisant.
          </p>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card class="pa-4 hu-card">
          <h2 class="hu-card-title">Dernières commandes clients</h2>
          <p class="hu-card-sub">Table <code>erp.sales_orders</code>, les plus récentes.</p>
          <v-table v-if="orderRows.length" density="compact" class="hu-table">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in orderRows" :key="row.id">
                <td>{{ row.number }}</td>
                <td>{{ row.status }}</td>
                <td class="hu-muted">{{ formatDate(row.date) }}</td>
              </tr>
            </tbody>
          </v-table>
          <p v-else class="hu-empty">Aucune commande enregistrée.</p>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card class="pa-4 hu-card">
          <h2 class="hu-card-title">Mouvements de stock récents</h2>
          <p class="hu-card-sub">
            Table <code>erp.stock_movements</code>. Le niveau de stock se déduit de
            <code>quantity_delta</code>.
          </p>
          <v-table v-if="movementRows.length" density="compact" class="hu-table">
            <thead>
              <tr>
                <th>Type</th>
                <th class="text-end">Variation</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in movementRows" :key="row.id">
                <td>{{ row.kind }}</td>
                <td class="text-end">{{ numberFormatter.format(row.delta) }}</td>
                <td class="hu-muted">{{ formatDate(row.date) }}</td>
              </tr>
            </tbody>
          </v-table>
          <p v-else class="hu-empty">Aucun mouvement enregistré.</p>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card class="pa-4 hu-card">
          <h2 class="hu-card-title">Créances, dettes et caisse</h2>
          <p class="hu-card-sub">
            Calculé à partir de <code>erp.payments</code> et des lignes de commande.
          </p>
          <dl class="hu-facts">
            <div>
              <dt>Paiements enregistrés</dt>
              <dd>{{ numberFormatter.format(snapshot?.payments ?? 0) }}</dd>
            </div>
            <div>
              <dt>Montant des paiements</dt>
              <dd>{{ money(payments) }}</dd>
            </div>
            <div>
              <dt>Commandes clients</dt>
              <dd>{{ numberFormatter.format(snapshot?.salesOrders ?? 0) }}</dd>
            </div>
            <div>
              <dt>Commandes fournisseurs</dt>
              <dd>{{ numberFormatter.format(snapshot?.purchaseOrders ?? 0) }}</dd>
            </div>
          </dl>
          <v-btn variant="text" size="small" class="mt-2" to="/comptabilite/paiements">
            Voir les paiements
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.hu-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}
.hu-head h1 {
  font-size: 22px;
  font-weight: 700;
}
.hu-sub {
  color: rgb(var(--v-theme-muted));
  font-size: 13px;
  max-width: 70ch;
}
.hu-tile {
  padding: 16px;
  height: 100%;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
.hu-tile-top {
  display: flex;
  align-items: center;
  gap: 10px;
}
.hu-tile-label {
  font-size: 13px;
  font-weight: 600;
  color: rgb(var(--v-theme-muted));
}
.hu-tile-value {
  font-size: 28px;
  font-weight: 700;
  margin-top: 10px;
}
.hu-tile-hint {
  font-size: 12px;
  color: rgb(var(--v-theme-muted));
  min-height: 32px;
}
.hu-tile-link {
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}
.hu-card-title {
  font-size: 15px;
  font-weight: 700;
}
.hu-card-sub {
  font-size: 12px;
  color: rgb(var(--v-theme-muted));
  margin-bottom: 10px;
}
.hu-card code,
.hu-sub code {
  background: rgba(var(--v-theme-on-surface), 0.06);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 11px;
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
  padding: 12px 0;
}
.hu-facts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 20px;
}
.hu-facts dt {
  font-size: 12px;
  color: rgb(var(--v-theme-muted));
}
.hu-facts dd {
  font-size: 16px;
  font-weight: 600;
}
</style>
