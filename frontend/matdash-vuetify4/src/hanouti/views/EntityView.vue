<script setup>
/**
 * Entity screen — a list with create / edit / delete, generated from the
 * database declaration of one or more tables.
 *
 * Columns, form inputs, validation and formatting all come from the generated
 * schema, so adding a column to the SQL migration and re-running
 * `npm run schema:generate` is enough to make it appear here.
 */
import { computed, onMounted, ref, watch } from "vue";
import CrudTable from "../../com/CrudTable/Crudtable.vue";
import { entitiesByKey } from "../generated/schema.js";
import { repo } from "../api.js";
import { columnsFor, formatValue, isFormEditable, listColumnsFor } from "../fields.js";
import { columnLabel, tableLabel } from "../labels.js";

const props = defineProps({
  screen: { type: Object, required: true },
  title: { type: String, default: "" },
});

/** One tab per table; single-entity screens have exactly one. */
const tabs = computed(() => {
  if (props.screen.tabs?.length) return props.screen.tabs;
  return [{ entity: props.screen.entity, label: tableLabel(props.screen.entity) }];
});
const activeTab = ref(0);
const current = computed(() => tabs.value[activeTab.value] ?? tabs.value[0]);

const rows = ref([]);
const loading = ref(true);
const error = ref(null);
const entityMeta = ref(null);

/** CrudField[] for the active table: keys are camelCase row properties. */
const fields = computed(() => {
  const meta = entityMeta.value;
  if (!meta) return [];
  const listNames = listColumnsFor(meta);
  return meta.columns
    .filter(isFormEditable)
    .map((column) => ({
      key: column.property ?? column.name,
      label: column.label,
      header: column.label,
      type: column.type,
      column,
      showInTable: listNames.includes(column.name),
    }));
});

/** Property -> column metadata, for formatting cells. */
const columnsByProperty = computed(() => {
  const map = new Map();
  for (const column of entityMeta.value?.columns ?? []) {
    map.set(column.property ?? column.name, column);
  }
  return map;
});

function cellText(row, field) {
  const column = columnsByProperty.value.get(field.key);
  return formatValue(row[field.key], column ?? { type: field.type });
}

async function load() {
  const key = current.value?.entity;
  if (!key) return;
  loading.value = true;
  error.value = null;
  try {
    const meta = entitiesByKey[key];
    entityMeta.value = meta
      ? {
          ...meta,
          columns: meta.columns.map((column) => ({
            ...column,
            label: labelFor(column.name),
          })),
        }
      : null;

    let data = await repo.list(key);
    const filter = props.screen.filter;
    if (filter) {
      data = data.filter((row) =>
        Object.entries(filter).some(([name, values]) =>
          values.includes(String(row[toProperty(meta, name)] ?? "").toLowerCase()),
        ),
      );
    }
    rows.value = data;
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    loading.value = false;
  }
}

function toProperty(meta, columnName) {
  return meta?.columns.find((column) => column.name === columnName)?.property ?? columnName;
}

function labelFor(name) {
  return columnLabel(name);
}

watch(current, load);
onMounted(load);

async function onCreate(record) {
  await repo.create(current.value.entity, record);
  await load();
}
async function onUpdate(record) {
  await repo.update(current.value.entity, record);
  await load();
}
async function onDelete(record) {
  const meta = entityMeta.value;
  await repo.remove(current.value.entity, record[meta?.primaryKey ?? "id"]);
  await load();
}

const labels = computed(() => ({
  add: "Nouvel enregistrement",
  newTitle: `Nouveau — ${current.value?.label ?? ""}`,
  editTitle: `Modifier — ${current.value?.label ?? ""}`,
  search: "Rechercher",
  empty: "Aucun enregistrement. Ajoutez-en un ou modifiez la recherche.",
  actions: "Actions",
  save: "Enregistrer",
  cancel: "Annuler",
  closeEditor: "Fermer l'éditeur",
  editAria: (name) => `Modifier ${name}`,
  deleteAria: (name) => `Supprimer ${name}`,
  deleteTitle: (name) => `Supprimer ${name} ?`,
  deleteMessage: "Cette action est définitive.",
  deleted: "Enregistrement supprimé.",
  saved: "Enregistré.",
}));

const warning = computed(() => {
  const meta = entityMeta.value;
  const notes = [];
  if (meta?.hasSensitiveColumns)
    notes.push(
      "Colonnes sensibles (mot de passe, jetons) exclues de l'affichage et du formulaire.",
    );
  if (props.screen.note) notes.push(props.screen.note);
  return notes.length ? notes.join(" ") : null;
});
</script>

<template>
  <div>
    <header class="hu-head">
      <div>
        <h1>{{ title || current?.label }}</h1>
        <p class="hu-sub">
          Table <code>{{ current?.entity }}</code> — définie dans les migrations SQL de hanouti.
        </p>
      </div>
      <v-btn variant="tonal" size="small" :loading="loading" @click="load">
        <Icon name="refresh" size="16" class="mr-1" />Actualiser
      </v-btn>
    </header>

    <v-tabs v-if="tabs.length > 1" v-model="activeTab" density="compact" class="mb-3">
      <v-tab v-for="(tab, index) in tabs" :key="tab.entity" :value="index">
        {{ tab.label }}
      </v-tab>
    </v-tabs>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>

    <v-skeleton-loader v-if="loading && !entityMeta" type="table" />

    <CrudTable
      v-else-if="entityMeta"
      v-model="rows"
      :fields="fields"
      :title="current.label"
      :entity="current.label"
      :entity-plural="current.label"
      :item-key="entityMeta.primaryKey"
      :item-label="entityMeta.labelColumn"
      :labels="labels"
      :warning="warning"
      :page-size="10"
      @create="onCreate"
      @update="onUpdate"
      @delete="onDelete"
    >
      <template v-for="field in fields.filter((f) => f.showInTable)" :key="field.key" #[`cell.${field.key}`]="{ item }">
        <span :class="{ 'hu-muted': !item[field.key] }">{{ cellText(item, field) }}</span>
      </template>
    </CrudTable>
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
}
.hu-sub code {
  background: rgba(var(--v-theme-on-surface), 0.06);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 11px;
}
.hu-muted {
  color: rgb(var(--v-theme-muted));
}
</style>
