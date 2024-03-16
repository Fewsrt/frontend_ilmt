<template>
  <v-app>
    <v-app-bar app color="primary" prominent>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>IBM License Metric Tool</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn variant="text" icon="mdi-magnify" link to="/findtabledata"></v-btn>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" location="left" temporary>
      <v-list>
        <v-list-item link to="/">
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/licensemapping">
          <v-list-item-title>License</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/calculator">
          <v-list-item-title>Calculator</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/uploadpdf">
          <v-list-item-title>Upload PDF</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/uploadcsv">
          <v-list-item-title>Upload CSV</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/reportdata">
          <v-list-item-title>Report</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <!-- Add padding to content to prevent it from being behind the app bar -->
    <v-main>
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, watch } from "vue";

const drawer = ref(false);
const group = ref(null);

watch(group, () => {
  drawer.value = false;
});
</script>

<script>
export default {
  data: () => ({
    drawer: false,
    group: null,
  }),

  watch: {
    group() {
      this.drawer = false;
    },
  },
};
</script>
