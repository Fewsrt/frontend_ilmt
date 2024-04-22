import { createStore } from "vuex";

export default createStore({
  state: {
    username: localStorage.getItem("username") || "",
  },
  mutations: {
    setUsername(state, username) {
      state.username = username;
      localStorage.setItem("username", username);
    },
    clearUsername(state) {
      state.username = "";
      localStorage.removeItem("username");
    },
  },
  actions: {
    updateUsername({ commit }, username) {
      commit("setUsername", username);
    },
    logout({ commit }) {
      commit("clearUsername"); // Call the clearUsername mutation when logging out
    },
    clearUsername({ commit }) {
      // Define the clearUsername action
      commit("clearUsername");
    },
  },
  getters: {
    getUsername(state) {
      return state.username;
    },
  },
});
