import { createRouter, createWebHashHistory } from "vue-router";
import store from "../store"; // Import the Vuex store directly
import Login from "../views/login.vue";
import HomeView from "../views/HomeView.vue";
import CreateLicenseMapping from "../views/CreateLicenseMapping.vue";
import Calculator from "../views/Calculator.vue";
import uploadpdfVue from "../views/UploadPdf.vue";
import uploadCsv from "../views/UploadCsv.vue";
import FindTableData from "../views/FindTableData.vue";

const routes = [
  {
    path: "/",
    name: "Login",
    component: Login,
    meta: { requiresAuth: false }, // Set requiresAuth to false for the login route
  },
  {
    path: "/home",
    name: "home",
    component: HomeView,
    meta: { requiresAuth: true }, // Add requiresAuth to true for other routes
  },
  {
    path: "/licensemapping",
    name: "licensemapping",
    component: CreateLicenseMapping,
    meta: { requiresAuth: true },
  },
  {
    path: "/calculator",
    name: "calculator",
    component: Calculator,
    meta: { requiresAuth: true },
  },
  {
    path: "/uploadpdf",
    name: "uploadpdf",
    component: uploadpdfVue,
    meta: { requiresAuth: true },
  },
  {
    path: "/uploadcsv",
    name: "uploadcsv",
    component: uploadCsv,
    meta: { requiresAuth: true },
  },
  {
    path: "/findtabledata",
    name: "findtabledata",
    component: FindTableData,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.getUsername; // Access the store directly
  if (to.meta.requiresAuth && !isAuthenticated) {
    // If the route requires authentication and the user is not authenticated,
    // redirect to the login page
    next("/");
  } else {
    next(); // Proceed to the requested route
  }
});

export default router;
