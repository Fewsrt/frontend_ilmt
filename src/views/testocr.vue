<template>
    <div>
      <input type="file" @change="handleFileChange" />
      <v-text-field v-model="ibmAgreementNumber" label="IBM Agreement Number"></v-text-field>
      <v-text-field v-model="ibmSiteNumber" label="IBM Site Number"></v-text-field>
      <v-text-field v-model="ibmCustomerNumber" label="IBM Customer Number"></v-text-field>
      <v-text-field v-model="ibmOrderRefNumber" label="IBM Order Reference Number"></v-text-field>
      <v-text-field v-model="ibmOrderRefDate" label="IBM Order Reference Date"></v-text-field>
    </div>
  </template>
  
  <script>
  import * as PDFJS from 'pdfjs-dist';
  import Tesseract from 'tesseract.js';
  import pdfjsWorker from "../../node_modules/pdfjs-dist/build/pdf.worker.mjs";
  
  PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  
  export default {
    name: "TestOcr",
    data() {
      return {
        selectedFile: null,
        ibmAgreementNumber: "",
        ibmSiteNumber: "",
        ibmCustomerNumber: "",
        ibmOrderRefNumber: "",
        ibmOrderRefDate: ""
      };
    },
    methods: {
      async handleFileChange(event) {
        try {
          const file = event.target.files[0];
          if (!file) {
            throw new Error("No file selected");
          }
    
          // Read the file as ArrayBuffer
          const fileReader = new FileReader();
          fileReader.onload = async () => {
            try {
              const loadingTask = PDFJS.getDocument({ data: fileReader.result });
              const pdf = await loadingTask.promise;
    
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
              await page.render({ canvasContext: context, viewport: viewport }).promise;
    
              // Convert canvas to image
              const image = new Image();
              image.src = canvas.toDataURL();
    
              // Perform OCR on the image
              Tesseract.recognize(
                image,
                "eng", // language
                // { logger: (m) => console.log(m) } // logger function
              ).then(({ data: { text } }) => {
                console.log(text)
                // Preprocess the OCR'd text to rearrange the letters
                const rearrangedValues = this.rearrangeText(text);
                
                // Autofill input fields with rearranged values
                this.ibmAgreementNumber = rearrangedValues["IBM Agreement Number"];
                this.ibmSiteNumber = rearrangedValues["IBM Site Number"];
                this.ibmCustomerNumber = rearrangedValues["IBM Customer Number"];
                this.ibmOrderRefNumber = rearrangedValues["IBM Order Reference Number"];
                this.ibmOrderRefDate = rearrangedValues["IBM Order Reference Date"];
              });
            } catch (error) {
              console.error("Error loading PDF:", error);
              alert("Error loading PDF: " + error.message);
            }
          };
          fileReader.readAsArrayBuffer(file);
        } catch (error) {
          console.error("Error handling file change:", error);
          alert("Error handling file change: " + error.message);
        }
      },
      performOCR() {
        // Empty method since OCR is handled in handleFileChange
      },
      rearrangeText(text) {
        // Define a mapping of expected keys to their actual variations
        const keyMappings = {
          "IBM Agreement Number": /IBM\s*Agremeat\s*Number:\s*(\w+)/i,
          "IBM Site Number": /BM\s*Site\s*Number:\s*(\w+)/i,
          "IBM Customer Number": /BM\s*Customer\s*Number:\s*(\w+)/i,
          "IBM Order Reference Number": /BM\s*Order\s*Refsnce\s*Number:\s*(\w+)/i,
          "IBM Order Reference Date": /BM\s*Order\s*Refs?c?nce\s*Dat:\s*(\d{2}-\w{3}-\d{4})/i
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
      }
    }
  };
  </script>
  