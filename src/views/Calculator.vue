<script setup>
import calresults from "../components/ReportData.vue";
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="6">
        <v-col class="text-left">
          <h2>Calculation Data</h2>
        </v-col>
        <v-row>
          <v-col cols="12">
            <v-select
              v-model="selectedTable"
              :items="filteredTableNames"
              label="Select Table"
              outlined
              dense
              variant="outlined"
            ></v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-select
              v-model="selectedComponentNames"
              :items="componentNamesList"
              label="Component Name"
              outlined
              dense
              multiple
              variant="outlined"
            ></v-select>
          </v-col>
        </v-row>
        <!-- Add a button to trigger the calculation -->
        <v-row>
          <v-col cols="12" class="text-center">
            <v-btn @click="calculateData" color="primary">Calculate</v-btn>
          </v-col>
        </v-row>
        <!-- Show the card boxes with calculation results if calculationResults is not null -->
        <v-row
          v-if="calculationResults !== null && calculationResults.length > 0"
        >
          <v-col
            v-for="(result, index) in calculationResults"
            :key="index"
            cols="12"
          >
            <v-card>
              <v-card-title
                >Calculator: {{ result.componentName }}</v-card-title
              >
              <v-card-text>
                <div>Component Name: {{ result.componentName }}</div>
                <div>Product Metric: {{ result.productmetric }}</div>
                <!-- Only render the div if pvuMin is present -->
                <div v-if="result.pvuMin !== undefined">
                  Minimum License PVU: {{ result.pvuMin }}
                </div>
                <!-- Only render the div if pvuMax is present -->
                <div v-if="result.pvuMax !== undefined">
                  Maximum License PVU: {{ result.pvuMax }}
                </div>
                <!-- Only render the div if LicenseVPC is present -->
                <div v-if="result.LicenseVPC !== undefined">
                  License VPC: {{ result.LicenseVPC }}
                </div>
                <div v-if="result.LPARLicense !== undefined">
                  LPAR License: {{ result.LPARLicense }}
                </div>
                <div v-if="result.NonLPARLicense !== undefined">
                  Non LPAR License: {{ result.NonLPARLicense }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row v-if="showSaveButton" class="text-center">
          <v-col cols="12">
            <v-btn @click="cancel" class="mr-2" color="warning">Cancel</v-btn>
            <v-btn @click="saveData" :disabled="dataSaved" color="primary"
              >Save</v-btn
            >
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="6">
        <calresults></calresults>
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
import axios from "axios";
import { mapState } from "vuex";

export default {
  name: "TableSelector",
  data() {
    return {
      tableNames: [],
      selectedTable: null,
      tableData: [],
      tableHeaders: [],
      isLoading: false,
      selectedColumns: [], // Array to hold selected column names
      search: "",
      selectedItems: [], // Array to hold selected row data
      calculationResults: null, // Store the calculation results for each component
      componentNamesList: [], // List of component names for multi-select
      selectedComponentNames: [], // Selected component names from multi-select
      showSaveButton: false,
      snackbar: {
        show: false,
        message: "",
        color: "",
      },
      dataSaved: false,
    };
  },
  computed: {
    ...mapState(["username"]),
    filteredHeaders() {
      // Filter tableHeaders based on selectedColumns
      return this.tableHeaders.filter((header) =>
        this.selectedColumns.includes(header.value)
      );
    },
    filteredData() {
      // Filter tableData to include only selectedColumns
      return this.tableData.map((row) => {
        const filteredRow = {};
        this.selectedColumns.forEach((column) => {
          filteredRow[column] = row[column];
        });
        return filteredRow;
      });
    },
    filteredTableNames() {
      // Filter tableNames based on conditions
      return this.tableNames
        .filter(
          (tableName) =>
            tableName.includes("develop") || tableName.includes("production")
        )
        .sort();
    },
  },
  watch: {
    selectedTable(newValue) {
      if (newValue) {
        this.fetchTableData(newValue);
      }
    },
  },
  mounted() {
    this.fetchTableNames();
  },
  methods: {
    showSnackbar(message, color) {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
    fetchTableNames() {
      // Inside your fetchTableNames method and any other method where you make Axios requests
      axios
        .get(`${process.env.SERVER_NAME}/api/table-names`, {
          params: {
            username: this.username, // Include username in the request parameters
          },
        })
        .then((response) => {
          this.tableNames = response.data;
        })
        .catch(() => {
          this.showSnackbar("Error fetching table names:", "error");
        });
    },
    fetchTableData(tableName) {
      this.isLoading = true;
      axios
        .get(`${process.env.SERVER_NAME}/api/table-data/${tableName}`, {
          params: {
            username: this.username, // Include username in the request parameters
          },
        })
        .then((response) => {
          this.tableData = response.data;
          this.tableHeaders = Object.keys(response.data[0]).map((key) => ({
            title: key,
            text: key,
            value: key,
          }));
          // Initialize selectedColumns with all column names initially
          this.selectedColumns = this.tableHeaders.map(
            (header) => header.value
          );

          // Populate the componentNamesList for the multi-select
          this.componentNamesList = [
            // ...new Set(response.data.map((row) => row["Component Name"])),
            "IBM Security Directory Server - Server",
            "IBM DB2 Enterprise Server Edition PVU Option",
            "IBM MQ Advanced",
            "WebSphere Application Server Network Deployment",
          ].sort((a, b) => a.localeCompare(b));
        })
        .catch(() => {
          this.showSnackbar(
            `Error fetching table data for ${tableName}:`,
            "error"
          );
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    selectAll() {
      // Set selectedColumns to include all column values
      this.selectedColumns = this.tableHeaders.map((header) => header.value);
    },
    unselectAll() {
      // Set selectedColumns to an empty array
      this.selectedColumns = [];
    },
    calculateData() {
      // Clear previous results
      this.calculationResults = [];
      this.dataSaved = false;

      // Iterate over each selected component name and perform the calculation
      this.selectedComponentNames.forEach((componentName) => {
        // Find rows where Component Name matches the current component name
        const relevantRows = this.tableData.filter(
          (row) => row["Component Name"] === componentName.trim()
        );

        if (relevantRows.length > 0) {
          let totalVPC = 0;
          // Check if the component name is "IBM Security Directory Server - Server"
          if (
            componentName.trim() === "IBM Security Directory Server - Server"
          ) {
            // Calculate the total PVU for this component by summing all PVU values
            let totalPVUMin = 0;
            let totalPVUMax = 0;

            relevantRows.forEach((row) => {
              const pvuPerCore = parseInt(row["PVU per Core"]);
              const serverCores = parseInt(row["Server Cores"]);
              const virtualSharedPoolCores = parseInt(
                row["Virtual Shared Pool Cores"]
              );

              // Calculate PVU based on Virtual Shared Pool Cores
              const pvuVSPC = virtualSharedPoolCores * pvuPerCore;
              const pvuSC = serverCores * pvuPerCore;

              // Add PVU to total PVU
              totalPVUMin += pvuVSPC;
              totalPVUMax += pvuSC;
            });

            // Store the calculation results for this component
            this.calculationResults.push({
              componentName: componentName.trim(),
              pvuMax: totalPVUMax,
              pvuMin: totalPVUMin,
              productmetric: relevantRows[0]["Product Metric"], // Add product metric
            });
          } else if (
            componentName.trim() ===
            "IBM DB2 Enterprise Server Edition PVU Option"
          ) {
            // For other components, calculate PVU as before
            // Calculate the total PVU for each unique value of Server Cores
            let totalPVUMin = 0;
            let totalPVUMax = 0;

            // Create a map to store unique combinations of Server Cores and Virtual Shared Pool Cores
            const uniqueCombinations = new Map();

            // Iterate over relevantRows to populate uniqueCombinations
            relevantRows.forEach((row) => {
              const serverCores = row["Server Cores"];
              const virtualSharedPoolCores = row["Virtual Shared Pool Cores"];

              // Combine Server Cores and Virtual Shared Pool Cores to create a unique key
              const key = `${serverCores}_${virtualSharedPoolCores}`;

              // Add the row to uniqueCombinations if it doesn't exist
              if (!uniqueCombinations.has(key)) {
                uniqueCombinations.set(key, row);
              }
            });

            // Iterate over uniqueCombinations to calculate total PVU
            uniqueCombinations.forEach((row) => {
              const virtualSharedPoolCores = parseInt(
                row["Virtual Shared Pool Cores"]
              );
              const pvuPerCore = parseInt(row["PVU per Core"]);

              // Calculate PVU based on Virtual Shared Pool Cores
              const pvu = virtualSharedPoolCores * pvuPerCore;

              // Add PVU to totalPVU
              totalPVUMin += pvu;
            });

            uniqueCombinations.forEach((row) => {
              const serverCores = parseInt(row["Server Cores"]);
              const pvuPerCore = parseInt(row["PVU per Core"]);

              // Calculate PVU based on Server Cores
              const pvu = serverCores * pvuPerCore;

              // Add PVU to totalPVU
              totalPVUMax += pvu;
            });

            // Store the calculation results for the current component
            this.calculationResults.push({
              componentName: relevantRows[0]["Component Name"],
              pvuMax: totalPVUMax,
              pvuMin: totalPVUMin,
              productmetric: relevantRows[0]["Product Metric"], // Add product metric
            });
          } else if (componentName.trim() === "IBM MQ Advanced") {
            relevantRows.forEach((row) => {
              let pvuPerCore = 0;

              // Check conditions for IBM MQ Advanced
              if (
                row["Product Name"] ===
                "IBM MQ Advanced High Availability Replica"
              ) {
                pvuPerCore = row["Logical Processors"] * 0.1;
              } else if (row["Product Name"] === "IBM MQ Advanced") {
                pvuPerCore = row["Logical Processors"] * 0.5;
              }

              if (
                row["Product Name"] ===
                "IBM MQ Advanced High Availability Replica for Non-Production"
              ) {
                pvuPerCore = row["Logical Processors"] * 0.05;
              } else if (
                row["Product Name"] ===
                "IBM MQ Advanced for Non-Production Environment"
              ) {
                pvuPerCore = row["Logical Processors"] * 0.25;
              }
              // Add PVU to totalPVU
              totalVPC += pvuPerCore;
            });

            // Round up the totalPVU
            totalVPC = Math.ceil(totalVPC);

            // Store the calculation results for this component
            this.calculationResults.push({
              componentName: componentName.trim(),
              LicenseVPC: totalVPC,
              productmetric: relevantRows[0]["Product Metric"], // Add product metric
            });
          } else if (
            componentName.trim() ===
            "WebSphere Application Server Network Deployment"
          ) {
            let foundRow; // Variable to store the row that meets the condition
            const uniqueConditions = new Set(); // Set to keep track of unique conditions
            let NonLPARLicense = 0; // Variable to store the Non-LPAR license
            let LPARLicense = 0; // Variable to store the LPAR license

            // Iterate over relevant rows to find the row that meets the condition
            relevantRows.forEach((row) => {
              const key = `${row["Server Serial Number"]}_${row["Server Cores"]}`;
              if (!uniqueConditions.has(key)) {
                foundRow = row;
                uniqueConditions.add(key);
              }

              let LPAREntitlement = row["LPAR Entitlement"];
              if (LPAREntitlement === "") {
                // Summing row["Logical Processors"] if "LPAR Entitlement" is empty
                NonLPARLicense += parseInt(row["Logical Processors"]) || 0;
              } else {
                // Check if PVU per Core is 120, if so, add to LPARLicense
                if (parseInt(row["PVU per Core"]) === 120) {
                  LPARLicense +=
                    parseInt(row["Virtual Shared Pool Cores"]) || 0;
                } else {
                  // If PVU per Core is not 120, consider Virtual Shared Pool Cores as LPAR License
                  LPARLicense = parseInt(row["Virtual Shared Pool Cores"]) || 0;
                }
              }
            });

            this.calculationResults.push({
              componentName: foundRow["Component Name"],
              productmetric: foundRow["Product Metric"],
              LPARLicense: LPARLicense,
              NonLPARLicense: NonLPARLicense,
            });
          }
          this.showSaveButton = true;
        }
      });
    },

    saveData() {
      this.dataSaved = true;
      if (this.calculationResults && this.calculationResults.length > 0) {
        const dataToStore = this.calculationResults.map((result) => ({
          tablename: this.selectedTable,
          componentName: result.componentName.trim(),
          productmetric: result.productmetric.trim(),
          pvuMin: result.pvuMin,
          pvuMax: result.pvuMax,
          LicenseVPC: result.LicenseVPC,
          LPARLicense: result.LPARLicense,
          NonLPARLicense: result.NonLPARLicense,
          date: this.formatDate(new Date()),
        }));
        axios
          .post(`${process.env.SERVER_NAME}/api/store-results`, dataToStore, {
            params: {
              username: this.username,
            },
          })
          .then(() => {
            this.showSnackbar("Results stored successfully", "success");
          })
          .catch((error) => {
            console.error("Error storing results:", error);
          });
      } else {
        this.showSnackbar("No calculation results to save", "warning");
      }
    },
    cancel() {
      // Reset selectedTable and selectedComponentNames to null
      this.selectedTable = null;
      this.selectedComponentNames = [];
      this.calculationResults = null;
      this.showSaveButton = false;
    },
    formatDate(date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${month}-${day}-${year} ${hours}:${minutes}`;
    },
  },
};
</script>
