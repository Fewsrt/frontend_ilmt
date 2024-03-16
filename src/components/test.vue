<template>
  <div>
    <v-container>
      <h2>Add License Mapping</h2>
      <v-form @submit.prevent="createData">
        <v-text-field v-model="productName" label="Product Name"></v-text-field>
        <v-text-field v-model="licenseName" label="License Name"></v-text-field>
        <v-btn type="submit" color="primary">Submit</v-btn>
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
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AddDataTable",
  data() {
    return {
      productName: "",
      licenseName: "",
      quantity: "",
      headers: [
        { title: "ID", text: "ID", value: "id" },
        { title: "Product Name", text: "Product Name", value: "product_name" },
        { title: "License Name", text: "License Name", value: "license_name" },
        {
          title: "Active Subscription Quantity",
          text: "Active Subscription Quantity",
          value: "activeSubscriptionQuantity",
        },
        {
          title: "Actions",
          text: "Actions",
          value: "actions",
          sortable: false,
        },
      ],
      tableData: [],
      mappedTableData: [],
      dialog: false,
      dialogDelete: false,
      editedItem: {
        id: null,
        productName: "",
        licenseName: "",
      },
      editedIndex: -1,
    };
  },
  computed: {
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
          (passportItem) => passportItem.license_name === item.license_name
        );
        if (matchingItem) {
          item.activeSubscriptionQuantity =
            matchingItem["Active Subscription & Support Quantity"];
        } else {
          item.activeSubscriptionQuantity = null;
        }
        return item;
      });
    },
    async createData() {
      try {
        await axios.post(`${process.env.SERVER_NAME}/api/add-license-mapping`, {
          productName: this.productName,
          licenseName: this.licenseName,
        });
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
          `${process.env.SERVER_NAME}/api/table-data-license`
        );
        return response.data;
      } catch (error) {
        throw new Error("Error fetching table data.");
      }
    },
    async fetchPassportAdvantageData() {
      try {
        const tableName = "passportadvantageviewentitlementinventory01262024";
        const response = await axios.get(
          `${process.env.SERVER_NAME}/api/table-data/${tableName}`
        );
        return response.data;
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
      this.dialog = true;
    },
    deleteItem(item) {
      this.editedIndex = this.tableData.indexOf(item);
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      axios
        .delete(
          `${process.env.SERVER_NAME}/api/delete-data/${
            this.tableData[this.editedIndex].id
          }`
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
      this.editedItem = { id: null, productName: "", licenseName: "" };
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
        await axios.post(`${process.env.SERVER_NAME}/api/reset-table`);
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

<style>
/* Add your custom styles here */
</style>
