<script setup>
/**
 * Planned screen — for navigation entries whose tables are not declared yet.
 *
 * The sidebar mirrors the full ERP the project aims at, but the SQL declarations
 * only cover part of it. Rather than showing a half-working page, this screen
 * states what the entry needs and links to the schema browser, so the gap is
 * visible and reviewable instead of hidden.
 */
import { computed } from "vue";
import { entities } from "../generated/schema.js";
import { entitiesByKey } from "../generated/schema.js";
import { tableLabel } from "../labels.js";

const props = defineProps({
  screen: { type: Object, required: true },
  title: { type: String, default: "" },
});

/** The needs list mixes declared tables and things that are not declared. */
const needs = computed(() => props.screen.needs ?? []);

function declared(key) {
  return entitiesByKey[key];
}

const related = computed(() =>
  entities.filter((entity) =>
    (props.screen.needs ?? []).includes(entity.key),
  ),
);
</script>

<template>
  <div>
    <header class="hu-head">
      <h1>{{ title || "Écran à venir" }}</h1>
      <p class="hu-sub">
        Cet écran figure au plan fonctionnel, mais les tables nécessaires ne sont pas encore
        déclarées dans les migrations SQL.
      </p>
    </header>

    <v-row dense>
      <v-col cols="12" md="7">
        <v-card class="pa-4 hu-card">
          <h2 class="hu-card-title">Ce qu'il faudrait pour le construire</h2>
          <ul class="hu-needs">
            <li v-for="need in needs" :key="need">
              <template v-if="declared(need)">
                <code>{{ need }}</code> — déclarée
                <span class="hu-muted">({{ tableLabel(need) }})</span>
              </template>
              <template v-else>
                {{ need }}
              </template>
            </li>
          </ul>

          <div v-if="related.length" class="mt-3">
            <p class="hu-card-sub">Tables déclarées rattachées :</p>
            <v-chip
              v-for="entity in related"
              :key="entity.key"
              size="small"
              variant="tonal"
              class="mr-2 mb-2"
            >
              {{ entity.key }}
            </v-chip>
          </div>

          <v-alert type="info" variant="tonal" density="compact" class="mt-4">
            Rien n'est simulé ici : une fois la migration écrite, l'écran devient une vue
            générée comme les autres, sans code supplémentaire.
          </v-alert>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card class="pa-4 hu-card">
          <h2 class="hu-card-title">Où l'ajouter</h2>
          <ol class="hu-steps">
            <li>
              Écrire la table dans
              <code>hanoti/data/migrations/hanouti/</code> — nouvelles migrations uniquement,
              jamais de modification d'une migration déjà appliquée.
            </li>
            <li>Appliquer avec <code>backend/db</code> : <code>npm run migrate</code>.</li>
            <li>
              Regénérer les métadonnées : <code>npm run schema:generate</code>.
            </li>
            <li>Rattacher l'entrée du menu à la nouvelle table dans <code>src/hanouti/navigation.js</code>.</li>
          </ol>
          <v-btn variant="tonal" size="small" class="mt-2" to="/parametres/schema-base">
            Ouvrir le schéma de la base
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.hu-head h1 {
  font-size: 21px;
  font-weight: 700;
}
.hu-sub {
  font-size: 13px;
  color: rgb(var(--v-theme-muted));
  max-width: 80ch;
}
.hu-card-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 8px;
}
.hu-card-sub {
  font-size: 12px;
  color: rgb(var(--v-theme-muted));
}
.hu-needs {
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.9;
}
.hu-steps {
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.8;
}
.hu-steps code,
.hu-needs code {
  background: rgba(var(--v-theme-on-surface), 0.06);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 11px;
}
.hu-muted {
  color: rgb(var(--v-theme-muted));
}
</style>
