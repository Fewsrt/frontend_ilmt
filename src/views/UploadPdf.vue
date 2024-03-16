<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="6" md="4">
        <v-file-input
          ref="fileInput"
          label="Upload PDF"
          accept=".pdf"
          @change="handleFileUpload"
        ></v-file-input>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="ibmAgreementNumber"
          label="IBM Agreement Number"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="ibmSiteNumber"
          label="IBM Site Number"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="ibmCustomerNumber"
          label="IBM Customer Number"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="ibmOrderRefNumber"
          label="IBM Order Reference Number"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="ibmOrderRefDate"
          label="IBM Order Reference Date"
        ></v-text-field>
      </v-col>
      <v-col cols="12">
        <v-select
          v-model="selectedLicenses"
          :items="tableData.map((item) => item['license_name'])"
          label="Select Licenses"
          multiple
        ></v-select>
      </v-col>
    </v-row>
    <v-col cols="12" class="text-right mt-5">
      <v-btn @click="autoFillFields" class="mr-2">Auto Fill</v-btn>
      <v-btn @click="uploadFile" color="primary">Upload</v-btn>
    </v-col>

    <v-data-table :headers="headers" :items="pdfFiles" item-key="id">
      <template v-slot:[`item.selected_licenses`]="{ item }">
        <span v-html="addLineBreaks(item.selected_licenses)"></span>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon color="error" @click="deleteFile(item.id)">mdi-delete</v-icon>
      </template>
      <template v-slot:[`item.open`]="{ item }">
        <v-icon color="primary" @click="openURL(item.downloadlink)"
          >mdi-open-in-new</v-icon
        >
      </template>
    </v-data-table>

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
import * as PDFJS from "pdfjs-dist";
import Tesseract from "tesseract.js";
import pdfjsWorker from "../../node_modules/pdfjs-dist/build/pdf.worker.mjs";

PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default {
  name: "UploadPdfFile",
  data() {
    return {
      selectedFile: null,
      file: null,
      ibmAgreementNumber: "",
      ibmSiteNumber: "",
      ibmCustomerNumber: "",
      ibmOrderRefNumber: "",
      ibmOrderRefDate: "",
      pdfFiles: [],
      snackbar: {
        show: false,
        message: "",
        timeout: 3000,
        color: "success", // default color
      },
      headers: [
        { title: "File Name", text: "File Name", value: "filename" },
        {
          title: "IBM Agreement Number",
          text: "IBM Agreement Number",
          value: "ibm_agreement_number",
        },
        {
          title: "IBM Site Number",
          text: "IBM Site Number",
          value: "ibm_site_number",
        },
        {
          title: "IBM Customer Number",
          text: "IBM Customer Number",
          value: "ibm_customer_number",
        },
        {
          title: "IBM Order Reference Number",
          text: "IBM Order Reference Number",
          value: "ibm_order_ref_number",
        },
        {
          title: "IBM Order Reference Date",
          text: "IBM Order Reference Date",
          value: "ibm_order_ref_date",
        },
        {
          title: "License",
          text: "License",
          value: "selected_licenses",
        },
        { title: "Date", text: "Date", value: "date" },
        {
          title: "Actions",
          text: "Actions",
          value: "actions",
          sortable: false,
        },
        {
          title: "Open File",
          text: "Open",
          value: "open",
          sortable: false,
        },
      ],
      tableData: [], // New variable to hold table data
      selectedLicenses: [],
    };
  },
  methods: {
    async fetchTableData() {
      try {
        const response = await axios.get(
          `${process.env.SERVER_NAME}/api/table-data-license`
        );
        this.tableData = response.data;
      } catch (error) {
        throw new Error("Error fetching table data.");
      }
    },
    addLineBreaks(licenses) {
      // Remove curly braces and quotes from the text, split by comma, and join the elements with a comma and a new line character
      const formattedLicenses = licenses.replace(/["{}]/g, "").split(",");
      return formattedLicenses.join("<br>");
    },
    handleFileUpload(event) {
      this.file = event.target.files[0];
      this.fetchTableData();
    },
    uploadFile() {
      if (!this.file) {
        this.showSnackbar("No file selected", "error");
        return;
      }

      const formData = new FormData();
      formData.append("file", this.file);
      formData.append("ibmAgreementNumber", this.ibmAgreementNumber);
      formData.append("ibmSiteNumber", this.ibmSiteNumber);
      formData.append("ibmCustomerNumber", this.ibmCustomerNumber);
      formData.append("ibmOrderRefNumber", this.ibmOrderRefNumber);
      formData.append("ibmOrderRefDate", this.ibmOrderRefDate);
      formData.append(
        "selectedLicenses",
        JSON.stringify(this.selectedLicenses)
      );

      axios
        .post(`${process.env.SERVER_NAME}/api/upload-pdf`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(() => {
          this.showSnackbar("File uploaded successfully", "success");
          // Clear file input after successful upload
          this.$refs.fileInput.reset();
          this.file = null; // Reset file data
          this.ibmAgreementNumber = "";
          this.ibmSiteNumber = "";
          this.ibmCustomerNumber = "";
          this.ibmOrderRefNumber = "";
          this.ibmOrderRefDate = "";
          // Clear selectedLicenses
          this.selectedLicenses = [];
          // Refresh the PDF files list
          this.fetchPDFFiles();
        })
        .catch(() => {
          this.showSnackbar("Error uploading file", "error");
        });
    },
    deleteFile(id) {
      axios
        .delete(`${process.env.SERVER_NAME}/api/delete-pdf/${id}`)
        .then(() => {
          this.showSnackbar("File deleted successfully", "success");
          // Refresh the PDF files list
          this.fetchPDFFiles();
        })
        .catch(() => {
          this.showSnackbar("Error deleting file", "error");
        });
    },
    openURL(url) {
      window.open(url, "_blank");
    },
    showSnackbar(message, color) {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
    fetchPDFFiles() {
      axios
        .get(`${process.env.SERVER_NAME}/api/get-pdf-files`)
        .then((response) => {
          this.pdfFiles = response.data;
          // console.log(this.pdfFiles);
        })
        .catch(() => {
          this.showSnackbar("Error deleting file", "error");
        });
    },
    rearrangeText(text) {
      // Define a mapping of expected keys to their actual variations
      const keyMappings = {
        "IBM Agreement Number": /IBM\s*Agremeat\s*Number:\s*(\w+)/i,
        "IBM Site Number": /BM\s*Site\s*Number:\s*(\w+)/i,
        "IBM Customer Number": /BM\s*Customer\s*Number:\s*(\w+)/i,
        "IBM Order Reference Number": /BM\s*Order\s*Refsnce\s*Number:\s*(\w+)/i,
        "IBM Order Reference Date":
          /BM\s*Order\s*Refs?c?nce\s*Dat:\s*(\d{2}-\w{3}-\d{4})/i,
      };

      // Initialize an object to store rearranged values
      const rearrangedValues = {};

      // Iterate over each key and its corresponding regular expression pattern
      for (const [key, pattern] of Object.entries(keyMappings)) {
        // Try to match the pattern in the text
        const match = text.match(pattern);
        if (match) {
          // If a match is found, extract the value and store it in the rearrangedValues object
          rearrangedValues[key] = match[1];
        } else {
          // If no match is found, indicate that the value is not found
          rearrangedValues[key] = "";
        }
      }

      // Return the rearrangedValues object
      return rearrangedValues;
    },
    autoFillFields() {
      const fileReader = new FileReader();
      fileReader.onload = async () => {
        try {
          const loadingTask = PDFJS.getDocument({ data: fileReader.result });
          const pdf = await loadingTask.promise;
          this.showSnackbar("Autofill Processing...", "warning");

          // Ensure the PDF has at least one page
          if (pdf.numPages < 1) {
            throw new Error("The PDF file does not contain any pages.");
          }

          // Render the first page as a canvas
          const page = await pdf.getPage(1); // Assuming we want to render the first page
          const viewport = page.getViewport({ scale: 1.0 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport: viewport })
            .promise;

          // Convert canvas to image
          const image = new Image();
          image.src = canvas.toDataURL();

          // Perform OCR on the image
          Tesseract.recognize(
            image,
            "eng" // language
            // { logger: (m) => console.log(m) } // logger function
          ).then(({ data: { text } }) => {
            // console.log(text);
            // Preprocess the OCR'd text to rearrange the letters
            const rearrangedValues = this.rearrangeText(text);

            // Autofill input fields with rearranged values
            this.ibmAgreementNumber = rearrangedValues["IBM Agreement Number"];
            this.ibmSiteNumber = rearrangedValues["IBM Site Number"];
            this.ibmCustomerNumber = rearrangedValues["IBM Customer Number"];
            this.ibmOrderRefNumber =
              rearrangedValues["IBM Order Reference Number"];
            this.ibmOrderRefDate = rearrangedValues["IBM Order Reference Date"];
          });
        } catch (error) {
          console.error("Error loading PDF:", error);
          alert("Error loading PDF: " + error.message);
        }
      };
      fileReader.readAsArrayBuffer(this.file);
    },
  },
  created() {
    // Fetch PDF files when the component is created
    this.fetchPDFFiles();
  },
};
</script>

<style>
.spacer {
  width: 50px;
}
.green {
  color: green;
}

.red {
  color: red;
}
</style>
