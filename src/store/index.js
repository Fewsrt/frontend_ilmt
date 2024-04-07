// store/index.js

import { createStore } from "vuex";

export default createStore({
  state: {
    username: localStorage.getItem("username") || "", // Initialize with the value from local storage
  },
  mutations: {
    setUsername(state, username) {
      state.username = username; // Mutation to set the username
      localStorage.setItem("username", username); // Update local storage
    },
  },
  actions: {
    // Action to update the username
    updateUsername({ commit }, username) {
      commit("setUsername", username); // Commit the mutation to set the username
    },
  },
  getters: {
    // Getter to access the username
    getUsername(state) {
      return state.username;
    },
  },
  modules: {},
});
