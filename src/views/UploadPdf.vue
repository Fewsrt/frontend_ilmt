<template>
  <v-container>
    <v-col class="text-left">
      <h2>Upload PDF</h2>
    </v-col>
    <v-row>
      <v-col cols="12" sm="6" md="4">
        <v-file-input
          ref="fileInput"
          label="Upload PDF"
          accept=".pdf"
          @change="handleFileUpload"
          variant="outlined"
        ></v-file-input>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="ibmAgreementNumber"
          label="IBM Agreement Number"
          variant="outlined"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="ibmSiteNumber"
          label="IBM Site Number"
          variant="outlined"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="ibmCustomerNumber"
          label="IBM Customer Number"
          variant="outlined"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="ibmOrderRefNumber"
          label="IBM Order Reference Number"
          variant="outlined"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-menu :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-text-field
              v-model="formattedibmOrderRefDate"
              label="IBM Order Reference Date"
              variant="outlined"
              v-bind="props"
            ></v-text-field>
          </template>
          <v-date-picker v-model="ibmOrderRefDate" @click.stop></v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="12">
        <v-row
          v-for="(selectedLicense, index) in selectedLicenses"
          :key="selectedLicense.id"
        >
          <v-col cols="4">
            <v-select
              v-model="selectedLicense.value"
              :items="tableData.map((item) => item['license_name'])"
              variant="outlined"
              :label="'Select License '"
            ></v-select>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="quantity[index]"
              variant="outlined"
              :label="'Quantity '"
            ></v-text-field>
          </v-col>
          <v-col cols="2">
            <v-menu :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="formattedStartDate[index]"
                  variant="outlined"
                  :label="'Start Date'"
                  v-bind="props"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="start_date[index]"
                @click.stop
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="2">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="formattedEndDate[index]"
                  variant="outlined"
                  :label="'End Date'"
                  v-bind="props"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="end_date[index]"
                @click.stop
              ></v-date-picker>
            </v-menu>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="text-center">
            <v-btn color="primary" @click="addColumn" class="mr-2"
              >Add License</v-btn
            >
            <v-btn color="error" @click="deleteLicense(index)">delete</v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-col cols="12" class="text-right mt-5">
      <v-btn
        @click="autoFillFields"
        color="primary"
        class="mr-2"
        :disabled="!file"
        >Auto Fill</v-btn
      >
      <v-btn @click="uploadFile" color="primary">Upload</v-btn>
    </v-col>
    <v-data-table :headers="headers" :items="pdfFiles" item-key="id">
      <template v-slot:[`item.actions`]="{ item, index }">
        <v-icon
          color="error"
          @click="deleteFile(item.id)"
          v-if="isFirstOccurrence('filename', item.filename, index)"
          >mdi-delete</v-icon
        >
      </template>
      <template v-slot:[`item.open`]="{ item, index }">
        <v-icon
          color="primary"
          @click="openURL(item.downloadlink)"
          v-if="isFirstOccurrence('filename', item.filename, index)"
          >mdi-open-in-new</v-icon
        >
      </template>
      <template v-slot:[`item.filename`]="{ item, index }">
        {{
          isFirstOccurrence("filename", item.filename, index)
            ? item.filename
            : ""
        }}
      </template>
      <template v-slot:[`item.ibm_site_number`]="{ item, index }">
        {{
          isFirstOccurrence("ibm_site_number", item.ibm_site_number, index)
            ? item.ibm_site_number
            : ""
        }}
      </template>
      <template v-slot:[`item.ibm_agreement_number`]="{ item, index }">
        {{
          isFirstOccurrence(
            "ibm_agreement_number",
            item.ibm_agreement_number,
            index
          )
            ? item.ibm_agreement_number
            : ""
        }}
      </template>
      <template v-slot:[`item.ibm_customer_number`]="{ item, index }">
        {{
          isFirstOccurrence(
            "ibm_customer_number",
            item.ibm_customer_number,
            index
          )
            ? item.ibm_customer_number
            : ""
        }}
      </template>

      <!-- Template for IBM Order Reference Number -->
      <template v-slot:[`item.ibm_order_ref_number`]="{ item, index }">
        {{
          isFirstOccurrence(
            "ibm_order_ref_number",
            item.ibm_order_ref_number,
            index
          )
            ? item.ibm_order_ref_number
            : ""
        }}
      </template>

      <!-- Template for IBM Order Reference Date -->
      <template v-slot:[`item.ibm_order_ref_date`]="{ item, index }">
        {{
          isFirstOccurrence(
            "ibm_order_ref_date",
            item.ibm_order_ref_date,
            index
          )
            ? item.ibm_order_ref_date
            : ""
        }}
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
import { mapState } from "vuex";

PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default {
  name: "UploadPdfFile",
  data() {
    const currentDate = new Date();
    return {
      selectedFile: null,
      file: null,
      ibmAgreementNumber: "",
      ibmSiteNumber: "",
      ibmCustomerNumber: "",
      ibmOrderRefNumber: "",
      ibmOrderRefDate: currentDate,
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
          value: "selected_license",
        },
        {
          title: "Quantity",
          text: "Quantity",
          value: "quantity",
        },
        {
          title: "Start Date",
          text: "Start Date",
          value: "start_date",
        },
        {
          title: "End Date",
          text: "End Date",
          value: "end_date",
        },
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
      selectedLicenses: [{ id: Date.now(), value: "" }],
      quantity: [""],
      start_date: [currentDate, currentDate],
      end_date: [currentDate, currentDate],
      menu: false,
      previousFilename: null,
    };
  },
  computed: {
    ...mapState(["username"]),
    formattedStartDate() {
      return this.start_date.map((date) => {
        if (!date) return ""; // Return empty string if date is not defined
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, "0");
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const year = d.getFullYear().toString();
        return `${day}-${month}-${year}`;
      });
    },
    formattedEndDate() {
      return this.end_date.map((date) => {
        if (!date) return ""; // Return empty string if date is not defined
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, "0");
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const year = d.getFullYear().toString();
        return `${day}-${month}-${year}`;
      });
    },
    formattedibmOrderRefDate() {
      if (!this.ibmOrderRefDate) return ""; // Return empty string if date is not defined
      const d = new Date(this.ibmOrderRefDate);
      const day = d.getDate().toString().padStart(2, "0");
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const month = monthNames[d.getMonth()];
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    },
  },
  methods: {
    formatDate(date) {
      if (!date) return ""; // Return empty string if date is not defined
      const d = new Date(date);
      const day = d.getDate().toString().padStart(2, "0");
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    },
    isFirstOccurrence(key, value, index) {
      for (let i = 0; i < index; i++) {
        if (this.pdfFiles[i][key] === value) {
          return false; // Not the first occurrence
        }
      }
      return true; // First occurrence
    },
    addColumn() {
      // Add an empty column to selectedLicenses array
      this.selectedLicenses.push({ id: Date.now(), value: "" });

      // Add corresponding empty items to other arrays
      this.quantity.push("");
      this.start_date.push(new Date());
      this.end_date.push(new Date());
    },

    deleteLicense() {
      // Check if there are items in the arrays to delete
      if (this.selectedLicenses.length > 0 && this.quantity.length > 0) {
        // Delete the last item from both arrays
        this.selectedLicenses.pop();
        this.quantity.pop();
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
        this.tableData = response.data;
      } catch (error) {
        throw new Error("Error fetching table data.");
      }
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
      formData.append("ibmOrderRefDate", this.formattedibmOrderRefDate);
      this.selectedLicenses.forEach((license, index) => {
        formData.append(`selectedLicenses[${index}]`, license.value);
        formData.append(`quantity[${index}]`, this.quantity[index]);
        formData.append(`start_date[${index}]`, this.formattedStartDate[index]);
        formData.append(`end_date[${index}]`, this.formattedEndDate[index]);
      });

      axios
        .post(`${process.env.SERVER_NAME}/api/upload-pdf`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          params: {
            username: this.username, // Include username in the request
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
          // Clear selectedLicenses and quantity
          this.selectedLicenses = [{ id: Date.now(), value: "" }];
          this.quantity = [""];
          // Refresh the PDF files list
          this.fetchPDFFiles();
        })
        .catch(() => {
          this.showSnackbar("Error uploading file", "error");
        });
    },
    deleteFile(id) {
      // Get the file name of the file being deleted
      const fileNameToDelete = this.pdfFiles.find(
        (file) => file.id === id
      ).filename;

      axios
        .delete(`${process.env.SERVER_NAME}/api/delete-pdf/${id}`, {
          params: {
            username: this.username, // Include username in the request
          },
        })
        .then(() => {
          this.showSnackbar("File deleted successfully", "success");
          // Remove all files with the same name as the deleted file
          this.pdfFiles = this.pdfFiles.filter(
            (file) => file.filename !== fileNameToDelete
          );
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
        .get(`${process.env.SERVER_NAME}/api/get-pdf-files`, {
          params: {
            username: this.username, // Include username in the request
          },
        })
        .then((response) => {
          // Sort the response data by increasing order based on a specific property (e.g., filename)
          this.pdfFiles = response.data.sort((a, b) => {
            // Assuming you want to sort by filename, adjust the property accordingly
            return a.filename.localeCompare(b.filename);
          });
        })
        .catch(() => {
          this.showSnackbar("Error fetching PDF files", "error");
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
            const formattedDate = rearrangedValues["IBM Order Reference Date"];
            const [day, month, year] = formattedDate.split("-");
            this.ibmOrderRefDate = new Date(`${month} ${day}, ${year}`);
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
