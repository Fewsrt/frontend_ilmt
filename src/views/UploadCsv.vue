<script setup>
import alltabledata from "../components/GetAllTable.vue";
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="4">
        <v-select
          v-model="environment"
          :items="environmentOptions"
          label="Environment"
        ></v-select>
      </v-col>

      <v-col cols="4">
        <v-select
          v-model="selectedMonth"
          :items="monthOptions"
          label="Select a Month"
        ></v-select>
      </v-col>

      <v-col cols="4">
        <v-select
          v-model="selectedYear"
          :items="yearOptions"
          label="Select a year"
        ></v-select>
      </v-col>
    </v-row>

    <v-file-input
      ref="fileInput"
      label="Upload CSV"
      accept=".csv"
      @change="handleFileUpload"
    ></v-file-input>

    <v-col class="text-right">
      <v-btn @click="checkAndUploadFile">Upload</v-btn>
    </v-col>

    <v-snackbar
      v-model="snackbar.show"
      :timeout="snackbar.timeout"
      :color="snackbar.color"
    >
      {{ snackbar.message }}
    </v-snackbar>
    <alltabledata></alltabledata>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      file: null,
      snackbar: {
        show: false,
        message: "",
        timeout: 3000,
        color: "success", // default color
      },
      environment: null,
      environmentOptions: ["develop", "production", "passport"], // Options for environment selector
      tableNames: [],
      selectedTable: null,
      tableData: [],
      tableHeaders: [],
      isLoading: false,
      selectedColumns: [], // Array to hold selected column names
      search: "",
      selectedItems: [], // Array to hold selected row data
      selectedMonth: null, // New property for selected Month
      monthOptions: Array.from({ length: 12 }, (_, i) => i + 1), // Array to hold Months from 1 to 12
      selectedYear: null, // New property for selected year
      yearOptions: Array.from(
        { length: 7 }, // Number of years to include: previous 3 years + current year + next 3 years
        (_, i) => new Date().getFullYear() - 3 + i
      ),
    };
  },
  created() {
    // Initialize selectedYear and selectedMonth with the current year and month
    const currentDate = new Date();
    this.selectedYear = currentDate.getFullYear();
    this.selectedMonth = currentDate.getMonth() + 1; // Adding 1 to match with human-readable months (January is 1)
  },
  methods: {
    handleFileUpload(event) {
      this.file = event.target.files[0];
    },
    generateTableName() {
      if (!this.environment || !this.selectedMonth || !this.selectedYear) {
        return null;
      }
      return `${this.environment}_${this.selectedMonth}_${this.selectedYear}`;
    },
    checkFilenameWithBackend() {
      const tableName = this.generateTableName();
      if (!tableName) {
        // Handle case where one of the options is not selected
        this.showSnackbar(
          "Please select environment, month, and year",
          "error"
        );
        return;
      }

      axios
        .get(`${process.env.SERVER_NAME}/api/check-filename/${tableName}`)
        .then((response) => {
          if (response.data.exists) {
            this.showSnackbar(
              "Filename matches an existing table name. Please rename the file.",
              "error"
            );
          } else {
            // Proceed with file upload
            this.uploadFile();
          }
        })
        .catch(() => {
          this.showSnackbar("Error checking filename", "error");
        });
    },
    uploadFile() {
      if (!this.file) {
        this.showSnackbar("No file selected", "error");
        return;
      }

      if (!this.environment || !this.selectedMonth || !this.selectedYear) {
        this.showSnackbar(
          "Please select environment, month, and year",
          "error"
        );
        return;
      }

      const formData = new FormData();
      formData.append("file", this.file);
      formData.append("environment", this.environment); // Append selected environment
      formData.append("selectedMonth", this.selectedMonth); // Append selected month
      formData.append("selectedYear", this.selectedYear); // Append selected year

      axios
        .post(`${process.env.SERVER_NAME}/api/upload-csv`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(() => {
          this.showSnackbar("File uploaded successfully", "success");
          // Clear file input after successful upload
          this.$refs.fileInput.reset();
          this.file = null; // Reset file data
        })
        .catch(() => {
          this.showSnackbar("Error uploading file", "error");
        });
    },
    checkAndUploadFile() {
      this.checkFilenameWithBackend();
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
.spacer {
  width: 20px;
}

.green {
  color: green;
}

.red {
  color: red;
}
</style>
