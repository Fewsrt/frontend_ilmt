<template>
  <v-app>
    <v-app-bar app color="primary" prominent v-if="showNavigation">
      <template v-if="showNavigation">
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      </template>
      <v-toolbar-title
        >IBM License Metric For Customer: {{ this.username }}</v-toolbar-title
      >
      <v-spacer></v-spacer>
      <template v-if="showNavigation">
        <v-btn variant="text" icon="mdi-magnify" :to="'/findtabledata'"></v-btn>
        <v-btn text @click="logout">Exit</v-btn>
      </template>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" location="left" temporary>
      <v-list>
        <v-list-item :to="`/home`">
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>
        <v-list-item :to="`/licensemapping`">
          <v-list-item-title>License</v-list-item-title>
        </v-list-item>
        <v-list-item :to="`/calculator`">
          <v-list-item-title>Calculator</v-list-item-title>
        </v-list-item>
        <v-list-item :to="`/uploadpdf`">
          <v-list-item-title>Upload PDF</v-list-item-title>
        </v-list-item>
        <v-list-item :to="`/uploadcsv`">
          <v-list-item-title>Upload CSV</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-main>
    <v-footer app>
      <span class="mr-2 ml-auto"
        >&copy; {{ new Date().getFullYear() }} —
        <strong>Datapro Computer System v0.5</strong></span
      >
    </v-footer>
  </v-app>
</template>

<script>
import axios from "./axiosInstance";
import { mapState, mapActions } from "vuex";

export default {
  name: "App",
  data() {
    return {
      drawer: false,
      showNavigation: true,
    };
  },
  computed: {
    ...mapState(["username"]),
  },
  watch: {
    $route() {
      this.updateNavigationVisibility();
    },
  },
  methods: {
    updateNavigationVisibility() {
      this.showNavigation = this.$route.path !== "/";
    },
    async logout() {
      try {
        await axios.post(`/logout`);
        this.$router.push("/");
        this.clearUsername(); // Call the clearUsername action from Vuex store
      } catch (error) {
        console.error("Error logging out:", error);
      }
    },
    ...mapActions(["clearUsername"]), // Map the clearUsername action
  },
  created() {
    this.updateNavigationVisibility();
  },
};
</script>
