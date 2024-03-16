<template>
  <v-container>
    <v-row>
      <v-col cols="6">
        <h4>Develop CSV</h4>
        <v-data-table
          :headers="headers"
          :items="tableNamesDevelop"
          item-key="id"
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon color="error" @click="deleteTable(item)">mdi-delete</v-icon>
          </template>
        </v-data-table>
      </v-col>

      <v-col cols="6">
        <h4>Production CSV</h4>
        <v-data-table
          :headers="headers"
          :items="tableNamesProduction"
          item-key="id"
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon color="error" @click="deleteTable(item)">mdi-delete</v-icon>
          </template>
        </v-data-table>
      </v-col>

      <v-col cols="6">
        <h4>Passport CSV</h4>
        <v-data-table
          :headers="headers"
          :items="tableNamesPassport"
          item-key="id"
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon color="error" @click="deleteTable(item)">mdi-delete</v-icon>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "TableList",
  data() {
    return {
      tableNamesDevelop: [],
      tableNamesProduction: [],
      tableNamesPassport: [],
      snackbar: {
        show: false,
        message: "",
        timeout: 3000,
        color: "success", // default color
      },
      headers: [
        {
          title: "CSV Name",
          text: "Table Name",
          value: "tableName",
          width: "80%",
        },
        {
          title: "Actions",
          text: "Actions",
          value: "actions",
          width: "10%",
          sortable: false,
        },
      ],
    };
  },
  methods: {
    fetchTableNames() {
      axios
        .get(`${process.env.SERVER_NAME}/api/table-names`)
        .then((response) => {
          // Extract table names from the response and sort them alphabetically
          const allTableNames = response.data.sort();

          // Categorize table names based on keywords
          this.tableNamesDevelop = allTableNames
            .filter((tableName) => tableName.includes("develop"))
            .map((tableName, index) => ({
              id: index,
              tableName: tableName,
            }));
          this.tableNamesProduction = allTableNames
            .filter((tableName) => tableName.includes("production"))
            .map((tableName, index) => ({
              id: index,
              tableName: tableName,
            }));
          this.tableNamesPassport = allTableNames
            .filter((tableName) => tableName.includes("passport"))
            .map((tableName, index) => ({
              id: index,
              tableName: tableName,
            }));
        })
        .catch(() => {
          this.showSnackbar("Error fetching table names:", "error");
        });
    },

    deleteTable(item) {
      const tableName = item.tableName;
      axios
        .delete(`${process.env.SERVER_NAME}/api/delete-table/${tableName}`)
        .then(() => {
          this.showSnackbar("Table deleted successfully", "success");
          // Refresh the table names list
          this.fetchTableNames();
        })
        .catch(() => {
          this.showSnackbar("Error deleting table", "error");
        });
    },

    showSnackbar(message, color) {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
  created() {
    // Fetch table names when the component is created
    this.fetchTableNames();
  },
};
</script>
