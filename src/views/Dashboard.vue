<!-- Dashboard.vue -->

<template>
  <div>
    <h1>Welcome to Your Dashboard</h1>
    <p>Your username: {{ username }}</p>
    <p>Data from your database:</p>
    <ul>
      <li v-for="item in data" :key="item.id">{{ item.username }}</li>
    </ul>
    <v-btn @click="logout">Logout</v-btn>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "DashBoard",
  data() {
    return {
      username: "",
      data: [],
    };
  },
  mounted() {
    // Fetch data for the dashboard
    this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        // Fetch data for the current user's dashboard
        const response = await axios.get(
          `${process.env.SERVER_NAME}/dashboard/${this.$route.params.username}`
        );
        this.username = this.$route.params.username;
        this.data = response.data;
      } catch (error) {
        console.error("Error fetching data for dashboard:", error);
        // Handle error
      }
    },
    async logout() {
      try {
        // Perform logout logic
        await axios.post(`${process.env.SERVER_NAME}/logout`);
        // Redirect to the home page or any other desired route
        this.$router.push("/");
      } catch (error) {
        console.error("Error logging out:", error);
        // Handle error
      }
    },
  },
};
</script>
