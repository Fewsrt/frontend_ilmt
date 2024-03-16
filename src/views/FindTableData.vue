<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-select
          v-model="selectedTable"
          :items="tableNames"
          label="Select Table"
          outlined
          dense
        ></v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="d-flex align-center">
        <v-select
          v-model="selectedColumns"
          :items="tableHeaders"
          label="Select Columns"
          outlined
          dense
          multiple
          item-text="text"
          item-value="value"
        ></v-select>
        <div class="spacer"></div>
        <v-btn
          @click="toggleSelection"
          text
          small
          :class="{ green: !selectAll, red: selectAll }"
        >
          {{ selectAll ? "Unselect All" : "Select All" }}
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="isLoading">
      <v-col cols="12">
        <v-progress-linear indeterminate color="primary"></v-progress-linear>
      </v-col>
    </v-row>
    <v-row v-else-if="tableData.length > 0">
      <v-col cols="12">
        <v-data-table
          :headers="filteredHeaders"
          :items="filteredData"
          item-key="id"
          :rows-per-page-items="[10, 25, 50]"
          :search="search"
        >
          <template v-slot:top>
            <v-text-field
              v-model="search"
              clearable
              append-icon="mdi-magnify"
              label="Search"
              variant="outlined"
            ></v-text-field>
          </template>
          <template v-slot:[`item.component`]="{ item }">
            <v-checkbox
              v-model="selectedItems"
              :value="item"
              color="primary"
            ></v-checkbox>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="12">
        <v-alert color="info"
          >No data available for the selected table.</v-alert
        >
      </v-col>
    </v-row>
  </div>
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
      tableNames: [],
      selectedTable: null,
      tableData: [],
      tableHeaders: [],
      isLoading: false,
      selectedColumns: [], // Array to hold selected column names
      search: "",
      selectedItems: [], // Array to hold selected row data
    };
  },
  computed: {
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
  },
  watch: {
    selectedTable(newValue) {
      if (newValue) {
        this.fetchTableData(newValue);
        // Reset selectAll state when a new table is selected
        this.selectAll = true;
      }
    },
  },

  mounted() {
    this.fetchTableNames(); // Fetch table names when the component is mounted
  },
  methods: {
    showSnackbar(message, color) {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
    fetchTableNames() {
      axios
        .get(`${process.env.SERVER_NAME}/api/table-names`)
        .then((response) => {
          this.tableNames = response.data;
        })
        .catch(() => {
          this.showSnackbar("Error fetching table names", "error");
        });
    },
    fetchTableData(tableName) {
      this.isLoading = true;
      axios
        .get(`${process.env.SERVER_NAME}/api/table-data/${tableName}`)
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
    toggleSelection() {
      if (this.selectAll) {
        // If all options are currently selected, unselect all
        this.selectedColumns = [];
      } else {
        // If not all options are selected, select all
        this.selectedColumns = this.tableHeaders.map((header) => header.value);
      }
      this.selectAll = !this.selectAll; // Toggle the selectAll state
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
