<template>
  <v-container>
    <v-col class="text-left">
      <h2>Add License Mapping</h2>
    </v-col>
    <v-form @submit.prevent="createData">
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="productName"
            label="Product Name"
            variant="outlined"
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="licenseName"
            label="License Name"
            variant="outlined"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-col class="text-right">
        <v-btn type="submit" color="primary">Submit</v-btn>
      </v-col>
    </v-form>
  </v-container>

  <v-container>
    <h2>License Mapping</h2>
    <v-data-table :headers="headers" :items="mappedTableData">
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon @click="editItem(item)">mdi-pencil</v-icon>
        <v-icon @click="deleteItem(item)">mdi-delete</v-icon>
      </template>
      <template v-slot:no-data>
        <v-btn color="primary" @click="initialize">Reset</v-btn>
      </template>
    </v-data-table>
  </v-container>

  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title>{{ formTitle }}</v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="editedItem.productName"
                label="Product Name"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="editedItem.licenseName"
                label="License Name"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="editedItem.datacollection"
                label="Data Collection"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn color="blue darken-1" variant="text" @click="close"
          >Cancel</v-btn
        >
        <v-btn color="blue darken-1" variant="text" @click="save">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialogDelete" max-width="500px">
    <v-card>
      <v-card-title class="text-h5"
        >Are you sure you want to delete this item?</v-card-title
      >
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="closeDelete"
          >Cancel</v-btn
        >
        <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm"
          >OK</v-btn
        >
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
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
import { mapState } from "vuex";

export default {
  name: "LicenseMapping",
  data() {
    return {
      productName: "",
      licenseName: "",
      datacollection: "",
      quantity: "",
      headers: [
        // { title: "ID", text: "ID", value: "id" },
        { title: "Product Name", text: "Product Name", value: "product_name" },
        { title: "License Name", text: "License Name", value: "license_name" },
        {
          title: "Purchase",
          text: "Purchase",
          value: "softwareLicenseOrApplianceQuantity",
        },
        {
          title: "Active",
          text: "Active Subscription Quantity",
          value: "activeSubscriptionQuantity",
        },
        {
          title: "Data Calculator",
          text: "Data Collection",
          value: "data_collection",
        },
        {
          title: "Actions",
          text: "Actions",
          value: "actions",
          sortable: false,
        },
      ],
      mappedTableData: [],
      dialog: false,
      dialogDelete: false,
      editedItem: {
        id: null,
        productName: "",
        licenseName: "",
        datacollection: "",
      },
      editedIndex: -1,
      snackbar: {
        show: false,
        message: "",
        color: "",
      },
      props: {
        username: String,
      },
    };
  },
  computed: {
    ...mapState(["username"]),
    formTitle() {
      return this.editedIndex === -1 ? "Edit Item" : "Edit Item";
    },
  },
  mounted() {
    this.fetchAllData();
  },
  methods: {
    async fetchAllData() {
      try {
        const tableData = await this.fetchTableData();
        const passportAdvantageData = await this.fetchPassportAdvantageData();
        this.mapData(tableData, passportAdvantageData);
      } catch (error) {
        this.showSnackbar("Error fetching data:", "error");
      }
    },
    mapData(tableData, passportAdvantageData) {
      this.mappedTableData = tableData.map((item) => {
        const matchingItem = passportAdvantageData.find(
          (passportItem) =>
            passportItem["Current Product"] === item.license_name
        );
        if (matchingItem) {
          item.activeSubscriptionQuantity =
            matchingItem["Active Subscription & Support Quantity"];
          item.softwareLicenseOrApplianceQuantity =
            matchingItem["Software License or Appliance Quantity"]; // Add this line
        } else {
          item.activeSubscriptionQuantity = null;
          item.softwareLicenseOrApplianceQuantity = null; // Add this line
        }
        return item;
      });
    },

    async createData() {
      try {
        await axios.post(
          `${process.env.SERVER_NAME}/api/add-license-mapping`,
          {
            productName: this.productName,
            licenseName: this.licenseName,
          },
          {
            params: {
              username: this.username,
            },
          }
        );
        this.productName = "";
        this.licenseName = "";
        this.fetchAllData();
      } catch (error) {
        this.showSnackbar("Error creating data:", "error");
      }
    },

    async fetchTableData() {
      try {
        const response = await axios.get(
          `${process.env.SERVER_NAME}/api/table-data-license`,
          {
            params: {
              username: this.username, // Include username in the request
            },
          }
        );
        const sortedData = response.data.sort((a, b) => a.id - b.id);
        return sortedData;
      } catch (error) {
        throw new Error("Error fetching table data.");
      }
    },
    async fetchPassportAdvantageData() {
      try {
        const response = await axios.get(
          `${process.env.SERVER_NAME}/api/table-names`,
          {
            params: {
              username: this.username, // Include the username as a query parameter
            },
          }
        );
        const tableList = response.data;
        const passportTables = tableList.filter((tableName) =>
          /^passport_\d+_\d+$/i.test(tableName)
        );

        if (passportTables.length === 0) {
          throw new Error("No valid passport tables found.");
        }

        // Sort the passportTables based on the month and year in the table name
        passportTables.sort((a, b) => {
          const matchA = a.match(/passport_(\d+)_(\d+)/i);
          const matchB = b.match(/passport_(\d+)_(\d+)/i);

          const [, monthA, yearA] = matchA;
          const [, monthB, yearB] = matchB;
          const dateA = new Date(Number(yearA), Number(monthA) - 1);
          const dateB = new Date(Number(yearB), Number(monthB) - 1);
          return dateA - dateB;
        });
        const newestTable = passportTables[passportTables.length - 1];
        const responseNewest = await axios.get(
          `${process.env.SERVER_NAME}/api/table-data/${newestTable}`,
          {
            params: {
              username: this.username, // Include the username as a query parameter
            },
          }
        );
        return responseNewest.data;
      } catch (error) {
        throw new Error(
          `Error fetching Passport Advantage data: ${error.message}`
        );
      }
    },

    editItem(item) {
      this.editedItem.id = item.id;
      this.editedItem.productName = item.product_name;
      this.editedItem.licenseName = item.license_name;
      this.editedItem.datacollection = item.data_collection;
      this.dialog = true;
    },
    deleteItem(item) {
      this.editedIndex = this.mappedTableData.indexOf(item);
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      axios
        .delete(
          `${process.env.SERVER_NAME}/api/delete-data/${
            this.mappedTableData[this.editedIndex].id
          }`,
          {
            params: {
              username: this.username,
            },
          }
        )
        .then(() => {
          this.fetchAllData();
          this.closeDelete();
        })
        .catch(() => {
          this.showSnackbar("Error deleting data:", "error");
        });
    },

    close() {
      this.dialog = false;
      this.editedItem = {
        id: null,
        productName: "",
        licenseName: "",
        datacollection: "",
      };
      this.editedIndex = -1;
    },
    closeDelete() {
      this.dialogDelete = false;
      this.editedIndex = -1;
    },
    save() {
      axios
        .put(
          `${process.env.SERVER_NAME}/api/update-data/${this.editedItem.id}`,
          {
            productName: this.editedItem.productName,
            licenseName: this.editedItem.licenseName,
            datacollection: this.editedItem.datacollection,
          },
          {
            params: {
              username: this.username,
            },
          }
        )
        .then(() => {
          this.fetchAllData();
          this.close();
        })
        .catch(() => {
          this.showSnackbar("Error updating data:", "error");
        });
    },

    async initialize() {
      try {
        await axios.post(
          `${process.env.SERVER_NAME}/api/reset-table`,
          {},
          {
            params: {
              username: this.username,
            },
          }
        );
        this.fetchAllData();
        this.showSnackbar("Table reset successfully", "success");
      } catch (error) {
        this.showSnackbar("Error resetting table:", "error");
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
