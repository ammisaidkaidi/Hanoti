import { createRouter, createWebHistory } from "vue-router";
import { batch01Loaders } from "./batch01";
import { batch02Loaders } from "./batch02";
import { batch03Loaders } from "./batch03";
import { batch04Loaders } from "./batch04";
import { batch05Loaders } from "./batch05";
import { routeCatalog } from "../../data/navigation";
import { entries, homePath } from "../../hanouti/navigation.js";
import HanoutiScreen from "../../hanouti/views/HanoutiScreen.vue";

const implementations = {
  ...batch01Loaders,
  ...batch02Loaders,
  ...batch03Loaders,
  ...batch04Loaders,
  ...batch05Loaders,
  "/dashboards/dashboard1": () => import("../snipets/Dashboardpage.vue"),
  "/pages/account-settings": () => import("../snipets/AccountSettingspage.vue"),
  "/pages/route-directory": () => import("../snipets/RouteDirectorypage.vue"),
};

/**
 * Hanouti screens: one route per navigation entry, carrying the resolved screen
 * definition so a single component renders entity tables, computed views and
 * planned screens alike. Generated from src/hanouti/navigation.js, which maps
 * each ERP sidebar entry to the tables behind it.
 */
const hanoutiRoutes = entries
  // Entries marked "template" are the starter's own demo pages: routeCatalog
  // owns those paths, and a route here would shadow them.
  .filter((entry) => entry.screen.kind !== "template")
  .map((entry) => ({
  path: entry.path,
  name: `hanouti-${entry.path.slice(1).replaceAll("/", "-")}`,
  component: HanoutiScreen,
  props: { screen: entry.screen, title: entry.title },
  meta: { title: entry.title, category: entry.group, section: entry.section, icon: entry.icon },
}));

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: homePath },
    ...hanoutiRoutes,
    ...routeCatalog.map((page) => ({
      path: page.routePath,
      name: page.path.slice(1).replaceAll("/", "-"),
      component:
        implementations[page.path] || (() => import("../snipets/QueuedPagepage.vue")),
      meta: { ...page },
    })),
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../snipets/NotFoundpage.vue"),
      meta: { title: "Page not found", category: "Others" },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.path === from.path) return false;
    if (to.hash) return { el: to.hash, top: 90, behavior: "smooth" };
    return { top: 0 };
  },
});

router.afterEach((to) => {
  document.title = `${to.meta.title || "Tableau de bord"} · Hanouti`;
});
