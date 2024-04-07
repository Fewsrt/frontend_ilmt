import { createApp } from "vue";
import App from "./App.vue";
import router from "./router"; // Import Vue Router instance
import "@mdi/font/css/materialdesignicons.css";

// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import store from "./store"; // Import Vuex store from store/index.js

const vuetify = createVuetify({
  components,
  directives,
});

createApp(App)
  .use(store) // Use Vuex store
  .use(router) // Use Vue Router
  .use(vuetify)
  .mount("#app");
