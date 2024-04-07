<template>
    <v-row>
      <v-col cols="12">
        <v-col class="text-left">
          <h2>Calculation Results</h2>
        </v-col>
        <v-select
          v-model="selectedTableName"
          :items="filteredTableNames"
          label="Select Table Name"
          outlined
          dense
          multiple
          variant="outlined"
        ></v-select>
      </v-col>
    </v-row>
      <v-col
        v-for="(result, index) in calculationResults"
        :key="index"
        cols="12"
      >
        <v-card>
          <v-card-title>
            <div class="d-flex align-center justify-space-between">
              <span>{{ result.component_name }}</span>
              <v-btn icon @click="deleteData(result.id)">
                <v-icon color="error">mdi-delete</v-icon>
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text>
            <div>Table Name: {{ result.tablename }}</div>
            <div v-if="result.pvu_min !== null">
              Minimum License PVU: {{ result.pvu_min }}
            </div>
            <div v-if="result.pvu_max !== null">
              Maximum License PVU: {{ result.pvu_max }}
            </div>
            <div v-if="result.license_vpc !== null">
              License VPC: {{ result.license_vpc }}
            </div>
            <div v-if="result.lpar_license !== null">
              LPAR License: {{ result.lpar_license }}
            </div>
            <div v-if="result.non_lpar_license !== null">
              Non LPAR License: {{ result.non_lpar_license }}
            </div>
            <div v-if="result.calculation_date !== null">
              Date: {{ result.calculation_date }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    <v-snackbar
      v-model="snackbar.show"
      :timeout="snackbar.timeout"
      :color="snackbar.color"
    >
      {{ snackbar.message }}
    </v-snackbar>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex"; // Import mapState from Vuex

export default {
  name: "CalculationResults",
  data() {
    return {
      selectedTableName: [],
      tableNames: [],
      calculationResults: [],
      snackbar: {
        // Add snackbar object
        message: "",
        color: "",
        show: false,
      },
    };
  },
  created() {
    this.fetchTableNames();
  },
  computed: {
    ...mapState(["username"]), // Include username from Vuex state
    filteredTableNames() {
      return this.tableNames
        .filter(
          (tableName) =>
            tableName.includes("develop") || tableName.includes("production")
        )
        .sort();
    },
  },
  watch: {
    selectedTableName: {
      handler: "fetchCalculationResults",
      deep: true,
    },
  },
  methods: {
    fetchTableNames() {
      axios
        .get(`${process.env.SERVER_NAME}/api/table-names`, {
          params: {
            username: this.username, // Include username in the request
          },
        })
        .then((response) => {
          this.tableNames = response.data;
        })
        .catch(() => {
          this.showSnackbar("Error fetching table names", "error");
        });
    },
    fetchCalculationResults() {
      axios
        .post(
          `${process.env.SERVER_NAME}/api/get-calculation-results`,
          {
            tableNames: this.selectedTableName,
          },
          {
            params: {
              username: this.username, // Include username in the request URL
            },
          }
        )
        .then((response) => {
          this.calculationResults = response.data;
        })
        .catch(() => {
          this.showSnackbar("Error fetching calculation results", "error");
        });
    },
    async deleteData(id) {
      try {
        // Send a DELETE request to your backend API endpoint to delete data with the specified ID
        await axios.delete(
          `${process.env.SERVER_NAME}/api/calculation-results/${id}`,
          {
            params: {
              username: this.username, // Include username in the request
            },
          }
        );

        // Update the UI or show a confirmation message after successful deletion
        this.showSnackbar("Data deleted successfully", "success");

        // Refresh the calculation results after deletion
        this.fetchCalculationResults();
      } catch (error) {
        console.error("Error deleting data:", error);
        // Optionally, show an error message to the user
        this.showSnackbar("Error deleting data", "error");
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
