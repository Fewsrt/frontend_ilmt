<template>
  <v-container>
    <v-row justify="center">
      <img
        class="mx-auto my-6"
        max-width="228"
        alt="Vue logo"
        src="../assets/dcs-logo.png"
      />
    </v-row>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card
          class="mx-auto pa-12 pb-8"
          elevation="8"
          max-width="448"
          rounded="lg"
        >
          <v-row justify="end">
            <v-col cols="auto">
              <v-icon
                class="mdi mdi-pencil white--text"
                @click="openPopup"
              ></v-icon>
            </v-col>
          </v-row>

          <div class="text-subtitle-1 text-medium-emphasis">
            {{ isLogin ? "Choose Customer" : "Create Customer" }}
          </div>

          <!-- Sign-in form -->
          <v-form v-if="isLogin" @submit.prevent="login()">
            <v-select
              placeholder="Customer Name"
              v-model="username"
              :items="usernames"
              :label="usernameLabel"
              variant="outlined"
              :rules="[() => !!username || 'Customer Name is required']"
            ></v-select>

            <v-card-actions>
              <v-btn
                type="submit"
                class="mb-8"
                color="blue"
                size="large"
                variant="tonal"
                block
                :disabled="!username"
              >
                Start
              </v-btn>
            </v-card-actions>
          </v-form>

          <!-- Sign-up form -->
          <v-form v-else @submit.prevent="signup()">
            <v-text-field
              placeholder="Customer Name"
              v-model="username"
              :label="usernameLabel"
              variant="outlined"
              :rules="[
                () => !!username || 'Customer Name is required',
                (v) =>
                  /^[a-z]+$/.test(v) ||
                  'Username must contain only lowercase letters',
              ]"
              required
            ></v-text-field>

            <v-card-actions>
              <v-btn
                type="submit"
                class="mb-8"
                color="blue"
                size="large"
                variant="tonal"
                block
                :disabled="containsCapital(username)"
              >
                Create
              </v-btn>
            </v-card-actions>
          </v-form>
          <!-- Toggle between sign-in and sign-up -->
          <v-card-text class="text-center">
            <p>
              {{
                isLogin
                  ? "Don't have an Customer?"
                  : "Already have an Customer?"
              }}
              <a href="#" @click="toggleForm">{{
                isLogin ? "Create Customer" : "Choose Customer"
              }}</a>
            </p>
          </v-card-text>
        </v-card>
        <v-dialog v-model="popupVisible" max-width="400">
          <v-card class="rounded-card">
            <v-card-title>Customers</v-card-title>
            <v-card-text>
              <v-list v-if="usernames.length > 0">
                <!-- Check if usernames array is not empty -->
                <v-list-item
                  v-for="(username, index) in usernames"
                  :key="index"
                >
                  <v-list-item-title>{{ username }}</v-list-item-title>
                  <template v-slot:append>
                    <v-icon @click="confirmDelete(username)">mdi-delete</v-icon>
                  </template>
                </v-list-item>
              </v-list>
              <div v-else class="no-data-message">No Data Available</div>
              <!-- Show "No Data" message if usernames array is empty -->
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
    <v-snackbar
      v-model="snackbar.show"
      :timeout="snackbar.timeout"
      :color="snackbar.color"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from "../axiosInstance";
import { mapActions } from "vuex"; // Import mapActions to use Vuex actions

export default {
  name: "LoginPage",
  data() {
    return {
      username: "",
      isLogin: true,
      usernames: [],
      popupVisible: false,
      confirmationText: "",
      usernameLabel: "",
      snackbar: {
        show: false,
        message: "",
        color: "",
      },
    };
  },
  mounted() {
    if (this.isLogin) {
      this.fetchUsernames();
    }
  },
  methods: {
    // Use mapActions to map Vuex actions to component methods
    ...mapActions(["updateUsername"]), // Add updateUsername action
    containsCapital(username) {
        // Check if username is null or contains capital letters
        return username === "" || /[A-Z]/.test(username);
    },
    openPopup() {
      this.popupVisible = true;
    },
    closePopup() {
      this.popupVisible = false;
    },

    async login() {
      try {
        await axios.post(`/api/login`, {
          username: this.username,
        });
        this.updateUsername(this.username); // Dispatch action to update username
        this.$router.push("/home");
      } catch (error) {
        console.error("Error logging in:", error);
        // Handle error
      }
    },
    async signup() {
      try {
        await axios.post(`/api/signup`, {
          username: this.username,
        });
        this.updateUsername(this.username); // Dispatch action to update username
        this.$router.push("/uploadcsv");
      } catch (error) {
        console.error("Error signing up:", error);
        // Handle error
      }
    },
    async fetchUsernames() {
      try {
        const response = await axios.get(`/api/usernames`);
        this.usernames = response.data;
      } catch (error) {
        console.error("Error fetching usernames:", error);
        // Handle error
      }
    },
    confirmDelete(username) {
      const confirmation = prompt("Type 'Confirm' to delete this username:");
      if (confirmation === "Confirm") {
        this.deleteUsername(username);
      } else {
        // Do nothing or provide feedback to the user
      }
    },
    async deleteUsername(username) {
      try {
        const response = await axios.delete(`/api/usernames/${username}`);
        await this.fetchUsernames();
        this.popupVisible = false;
        this.showSnackbar(response.data.message, "success");
        // If you need to update the usernames array or refetch the usernames list, you can do it here
      } catch (error) {
        this.showSnackbar("Error deleting username:", "error");
        // Handle error
      }
    },
    toggleForm() {
      this.isLogin = !this.isLogin;
      if (!this.isLogin) {
        this.username = ""; // Reset username field
      }
    },
    showSnackbar(message, color) {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
};
</script>

<style>
.rounded-card {
  border-radius: 10px; /* Adjust the value as needed */
}

.no-data-message {
  display: flex; /* Use flexbox layout */
  justify-content: center; /* Center horizontally */
  align-items: center; /* Center vertically */
  height: 100%; /* Ensure full height of parent container */
  padding: 20px; /* Add padding to create space around the message */
}
</style>
