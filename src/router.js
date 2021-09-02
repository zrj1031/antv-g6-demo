import VueRouter from "vue-router";
import TreeCanvas from "./components/TreeCanvas.vue";
import TreeSvg from "./components/TreeSvg.vue";

const routes = [
  { path: "/canvas", component: TreeCanvas },
  { path: "/svg", component: TreeSvg },
];

const router = new VueRouter({
  routes,
});

export default router;
