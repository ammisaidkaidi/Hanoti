<script setup>
/**
 * Schéma de la base — the declaration browser.
 *
 * Shows every table and column exactly as the SQL declares them, with the
 * migration each table came from. It exists so the UI can be checked against
 * the source of truth: if a column is missing here it is not in the database,
 * and no screen can show it.
 *
 * Sensitive columns are listed but marked, and their values never render.
 */
import { computed, ref } from "vue";
import { entities, entitiesOfSchema, generatedAt, manifestFiles, schemaCounts } from "../generated/schema.js";
import { schemaDescriptions, schemaLabels, tableLabel, columnLabel } from "../labels.js";

const query = ref("");
const schemaFilter = ref("all");
const openTables = ref(new Set());

const schemaKeys = computed(() => Object.keys(schemaCounts));

const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase();
  const matches = (entity) => {
    if (schemaFilter.value !== "all" && entity.schema !== schemaFilter.value) return false;
    if (needle === "") return true;
    if (entity.key.toLowerCase().includes(needle)) return true;
    if (tableLabel(entity.key).toLowerCase().includes(needle)) return true;
    return entity.columns.some(
      (column) =>
        column.name.toLowerCase().includes(needle) ||
        columnLabel(column.name).toLowerCase().includes(needle),
    );
  };
  return entities.filter(matches);
});

function toggle(key) {
  const next = new Set(openTables.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  openTables.value = next;
}

function typeLabel(column) {
  if (column.array) return `${column.type}[]`;
  if (column.type === 'varchar' && column.length) return `varchar(${column.length})`;
  if (column.type === 'numeric' && column.precision) return `numeric(${column.precision},${column.scale ?? 0})`;
  if (column.type === 'vector') return `vector(${column.length ?? 4096})`;
  return column.type;
}

const totalColumns = computed(() => entities.reduce((total, entity) => total + entity.columns.length, 0));
</script>

<template>
  <div>
    <header class="hu-head">
      <div>
        <h1>Schéma de la base</h1>
        <p class="hu-sub">
          {{ entities.length }} tables et {{ totalColumns }} colonnes, telles que déclarées dans
          <code>hanoti/data/migrations/hanouti/</code>. Métadonnées générées le
          {{ new Date(generatedAt).toLocaleString("fr-DZ") }}.
        </p>
      </div>
      <v-btn variant="tonal" size="small" to="/tableau-de-bord/ventes">
        <Icon name="back" size="16" class="mr-1" />Tableau de bord
      </v-btn>
    </header>

    <v-row dense class="mb-3">
      <v-col v-for="schema in schemaKeys" :key="schema" cols="12" sm="6" lg="3">
        <v-card
          class="pa-3 hu-schema-card"
          :class="{ 'hu-schema-active': schemaFilter === schema }"
          @click="schemaFilter = schemaFilter === schema ? 'all' : schema"
        >
          <p class="hu-schema-name">{{ schemaLabels[schema] ?? schema }}</p>
          <p class="hu-schema-count">{{ schemaCounts[schema] }} tables</p>
          <p class="hu-schema-sub">{{ schemaDescriptions[schema] }}</p>
        </v-card>
      </v-col>
    </v-row>

    <div class="hu-controls">
      <v-text-field
        v-model="query"
        label="Rechercher une table ou une colonne"
        density="compact"
        clearable
        hide-details
        class="hu-search"
      />
      <v-chip
        v-if="schemaFilter !== 'all'"
        closable
        size="small"
        variant="tonal"
        @click:close="schemaFilter = 'all'"
      >
        Filtre : {{ schemaLabels[schemaFilter] ?? schemaFilter }}
      </v-chip>
      <span class="hu-muted hu-count">{{ filtered.length }} table(s)</span>
    </div>

    <v-card class="hu-card">
      <v-expansion-panels v-model="openTables" multiple variant="accordion">
        <v-expansion-panel v-for="entity in filtered" :key="entity.key" :value="entity.key">
          <v-expansion-panel-title>
            <div class="hu-table-title">
              <strong>{{ tableLabel(entity.key) }}</strong>
              <code>{{ entity.key }}</code>
              <span class="hu-muted">{{ entity.columns.length }} colonnes</span>
              <v-chip v-if="entity.hasSensitiveColumns" size="x-small" color="warning" variant="tonal">
                colonnes sensibles masquées
              </v-chip>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-table density="compact" class="hu-table">
              <thead>
                <tr>
                  <th>Colonne</th>
                  <th>Libellé</th>
                  <th>Type</th>
                  <th>Contraintes</th>
                  <th>Valeur par défaut</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="column in entity.columns" :key="column.name">
                  <td>
                    <code>{{ column.name }}</code>
                    <v-chip v-if="column.sensitive" size="x-small" color="error" variant="tonal" class="ml-2">
                      masquée
                    </v-chip>
                  </td>
                  <td>{{ columnLabel(column.name) }}</td>
                  <td class="hu-muted">{{ typeLabel(column) }}</td>
                  <td class="hu-muted">
                    <span v-if="column.primary">clé primaire</span>
                    <span v-else-if="!column.nullable">non nul</span>
                    <span v-else>nul autorisé</span>
                  </td>
                  <td class="hu-muted"><code>{{ column.default ?? "—" }}</code></td>
                </tr>
              </tbody>
            </v-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <p v-if="filtered.length === 0" class="hu-empty">Aucune table ne correspond à la recherche.</p>
    </v-card>

    <v-card class="pa-4 hu-card mt-4">
      <h2 class="hu-card-title">Migrations couvertes</h2>
      <p class="hu-card-sub">
        L'ordre d'application est l'ordre des noms de fichiers ; chaque fichier est appliqué
        verbatim par <code>backend/db</code>.
      </p>
      <ol class="hu-migrations">
        <li v-for="file in manifestFiles" :key="file"><code>{{ file }}</code></li>
      </ol>
    </v-card>
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
.hu-head code,
.hu-sub code,
.hu-card code,
.hu-table code {
  background: rgba(var(--v-theme-on-surface), 0.06);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 11px;
}
.hu-schema-card {
  cursor: pointer;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  height: 100%;
}
.hu-schema-active {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.06);
}
.hu-schema-name {
  font-size: 14px;
  font-weight: 700;
}
.hu-schema-count {
  font-size: 20px;
  font-weight: 700;
}
.hu-schema-sub {
  font-size: 12px;
  color: rgb(var(--v-theme-muted));
}
.hu-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.hu-search {
  max-width: 380px;
}
.hu-count {
  font-size: 12px;
}
.hu-table-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}
.hu-table th {
  font-size: 12px !important;
  color: rgb(var(--v-theme-muted)) !important;
}
.hu-muted {
  color: rgb(var(--v-theme-muted));
}
.hu-empty {
  padding: 16px;
  font-size: 13px;
  color: rgb(var(--v-theme-muted));
}
.hu-card-title {
  font-size: 14px;
  font-weight: 700;
}
.hu-card-sub {
  font-size: 12px;
  color: rgb(var(--v-theme-muted));
  margin-bottom: 8px;
}
.hu-migrations {
  columns: 2;
  font-size: 12px;
  padding-left: 18px;
}
</style>
