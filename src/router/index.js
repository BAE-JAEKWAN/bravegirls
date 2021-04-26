import Vue from "vue";
import VueRouter from "vue-router";
import HelloBraveGirls from '@/components/HelloBraveGirls'

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "HelloBraveGirls",
    component: HelloBraveGirls,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
