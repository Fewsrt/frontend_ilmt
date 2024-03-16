<script setup>
import adddata from "../components/adddata.vue";
</script>

<template>
  <v-container>
    <!-- <v-row>
      <v-col cols="12">
        <h2>Create Column Name</h2>
      </v-col>
    </v-row>
    <v-row v-for="(column, index) in columns" :key="index">
      <v-col cols="12">
        <v-text-field
          v-model="columns[index]"
          :label="'Column ' + (index + 1)"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-btn color="primary" @click="addColumn">Add Column</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <h2>Create Table Name</h2>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-text-field v-model="tableName" label="Table Name"></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-btn color="primary" @click="createTableName">Create</v-btn>
      </v-col>
    </v-row>
    <v-row v-if="responseMessage">
      <v-col cols="12">
        <v-alert :type="responseType">{{ responseMessage }}</v-alert>
      </v-col>
    </v-row> -->
  </v-container>
  <adddata />
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      columns: [""], // Initially one empty column
      tableName: "",
      responseMessage: "",
      responseType: "",
    };
  },
  methods: {
    addColumn() {
      this.columns.push(""); // Add an empty column
    },
    createTableName() {
      // You may want to validate column names here
      axios
        .post(`${process.env.SERVER_NAME}/api/create-table`, {
          tableName: this.tableName,
          columns: this.columns,
        })
        .then((response) => {
          this.responseMessage = response.data.message;
          this.responseType = "success";
          this.tableName = ""; // Clear input after successful creation
          this.columns = [""]; // Clear columns after successful creation
        })
        .catch((error) => {
          this.responseMessage = error.response.data.error;
          this.responseType = "error";
        });
    },
  },
};
</script>
