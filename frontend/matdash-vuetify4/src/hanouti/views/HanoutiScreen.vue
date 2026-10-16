<script setup>
/**
 * Renders whichever screen a navigation entry resolves to.
 *
 * The route carries the resolved definition (from src/hanouti/navigation.js),
 * so one component covers every entry: entity screens, computed screens,
 * planned screens and the dashboard.
 */
import { computed } from "vue";
import HanoutiDashboardView from "./HanoutiDashboardView.vue";
import SchemaBrowserView from "./SchemaBrowserView.vue";
import EntityView from "./EntityView.vue";
import DerivedView from "./DerivedView.vue";
import PlannedView from "./PlannedView.vue";
import { dataSource } from "../api.js";

const props = defineProps({
  screen: { type: Object, required: true },
  title: { type: String, default: "" },
});

const kind = computed(() => props.screen?.kind ?? "planned");
const mockNotice = computed(() =>
  dataSource === "mock"
    ? "Données de démonstration : le backend n'est pas encore connecté."
    : null,
);
</script>

<template>
  <div class="hu-screen">
    <v-alert
      v-if="mockNotice"
      type="info"
      variant="tonal"
      density="compact"
      class="mb-4 hu-mock-notice"
    >
      {{ mockNotice }}
    </v-alert>

    <SchemaBrowserView v-if="kind === 'schema'" />
    <HanoutiDashboardView v-else-if="kind === 'dashboard'" :screen="screen" :title="title" />
    <EntityView v-else-if="kind === 'entity'" :screen="screen" :title="title" />
    <DerivedView v-else-if="kind === 'derived'" :screen="screen" :title="title" />
    <PlannedView v-else :screen="screen" :title="title" />
  </div>
</template>

<style scoped>
.hu-screen {
  padding: 4px 0 32px;
}
</style>
