<template>
  <div>
    <v-container>
      <v-col class="text-left">
        <h2>Report</h2>
      </v-col>
      <v-row>
        <v-col>
          <v-select
            v-model="selectedMonthCurr"
            :items="monthOptions"
            label="Select a Month"
            variant="outlined"
          ></v-select>
        </v-col>
        <v-col>
          <v-select
            v-model="selectedYearCurr"
            :items="yearOptions"
            label="Select a Year"
            variant="outlined"
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="text-right">
          <v-btn
            v-if="!dataSaved"
            :disabled="loading"
            @click="saveData"
            append-icon="mdi-content-save"
            text
            variant="outlined"
          >
            Save Data
          </v-btn>

          <v-btn v-if="dataSaved" color="primary" @click="exportAllDataToExcel">
            Export to Excel
          </v-btn>
        </v-col>
        <v-col>
          <v-btn
            :disabled="loading"
            append-icon="mdi-refresh"
            text="Refresh"
            variant="outlined"
            @click="onClick"
          ></v-btn>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-data-table
            :items="mappedTableData"
            :headers="tableHeaders"
            :loading="loading"
          >
            <template v-slot:[`item.status`]="{ item }">
              <v-chip :color="getColor(item.status)" dark>{{
                item.status
              }}</v-chip>
            </template>
            <template v-slot:loading>
              <v-skeleton-loader type="table-row@10"></v-skeleton-loader
            ></template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>

    <v-snackbar
      v-model="snackbar.show"
      :timeout="snackbar.timeout"
      :color="snackbar.color"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { exportToExcel } from "@/utils/excelExport";
import {
  fetchTableData,
  fetchTableNames,
  saveDataToPostgreSQL,
} from "@/services/api";
import { dataProcessor } from "@/utils/dataProcessor";

export default {
  data() {
    return {
      loading: false,
      mappingLicenseData: [],
      passportAdvantageData: [],
      calculationResultsData: [],
      productionData: [],
      developData: [],
      pdfsData: [],
      wasprdData: [],
      wasdevData: [],
      securitydirectoryprdData: [],
      securitydirectorydevData: [],
      mqprdData: [],
      mqdevData: [],
      db2prdData: [],
      db2devData: [],
      isLoading: false,
      selectedMonthCurr: null, // New property for selected Month
      monthOptions: Array.from({ length: 12 }, (_, i) => i + 1), // Array to hold Months from 1 to 12
      selectedYearCurr: null, // New property for selected year
      yearOptions: Array.from(
        { length: 7 }, // Number of years to include: previous 3 years + current year + next 3 years
        (_, i) => new Date().getFullYear() - 3 + i
      ),
      snackbar: {
        show: false,
        message: "",
        color: "",
      },
      mappedTableData: [],
      tableHeaders: [
        // Define headers for v-data-table
        { title: "Product Name", text: "Product Name", value: "product_name" },
        { title: "License Name", text: "License Name", value: "license_name" },
        {
          title: "Order Reference Number",
          text: "Order Reference Number",
          value: "order_reference_number",
        },
        {
          title: "Purchase License",
          text: "Purchase License",
          value: "purchase_license",
        },
        {
          title: "Active Subscription",
          text: "Active Subscription & Support Quantity",
          value: "active_subscription_quantity",
        },
        {
          title: "Data Calculator",
          text: "Data Collection",
          value: "data_collection",
        },
        {
          title: "Production",
          text: "Production",
          value: "production",
        },
        {
          title: "Develop",
          text: "Develop",
          value: "develop",
        },
        {
          title: "Status",
          text: "Status",
          key: "status",
        },
      ],
      dataSaved: false,
      expanded: [],
    };
  },
  mounted() {
    this.fetchMappingLicenseData();
    this.fetchPassportAdvantageData();
    this.fetchCalculationResultsData();
    this.fetchpdfsData();
  },
  computed: {
    ...mapState(["username"]),
  },
  created() {
    // Initialize selectedYear and selectedMonth with the current year and month
    const currentDate = new Date();
    this.selectedYearCurr = currentDate.getFullYear();
    this.selectedMonthCurr = currentDate.getMonth(); // Adding 1 to match with human-readable months (January is 1)
  },
  watch: {
    selectedMonthCurr(newMonth, oldMonth) {
      if (newMonth !== oldMonth && this.selectedYearCurr) {
        this.matchDataCurr();
        this.dataSaved = false;
      }
    },
    selectedYearCurr(newYear, oldYear) {
      if (newYear !== oldYear && this.selectedMonthCurr) {
        this.matchDataCurr();
        this.dataSaved = false;
      }
    },
  },
  methods: {
    async onClick() {
      this.loading = true;
      this.matchDataCurr();
      this.fetchCalculationResultsData();
      await this.fetchMappingLicenseData();
      setTimeout(() => {
        this.loading = false;
      }, 2000);
    },
    getColor(status) {
      return status === "Covered" ? "green" : "red";
    },
    async fetchMappingLicenseData() {
      const tableName = "mappinglicense";
      this.isLoading = true;
      try {
        this.mappingLicenseData = await fetchTableData(
          "mappinglicense",
          this.username
        );
        this.mappingLicenseData.sort();
        this.matchDataCurr();
      } catch (error) {
        this.showSnackbar(
          `Error fetching table data for ${tableName}: ${error.message}`,
          "error"
        );
      } finally {
        this.isLoading = false;
      }
    },
    async fetchCalculationResultsData() {
      const tableName = "calculation_results";
      this.isLoading = true;
      try {
        this.calculationResultsData = await fetchTableData(
          "calculation_results",
          this.username
        );
        this.calculationResultsData.sort();
        this.matchDataCurr();
      } catch (error) {
        this.showSnackbar(
          `Error fetching table data for ${tableName}: ${error.message}`,
          "error"
        );
      } finally {
        this.isLoading = false;
      }
    },
    async fetchpdfsData() {
      const tableName = "pdflink";
      this.isLoading = true;
      try {
        this.pdfsData = await fetchTableData("pdflink", this.username);
        this.pdfsData.sort();
        this.matchDataCurr();
        console.log(this.pdfsData);
      } catch (error) {
        this.showSnackbar(
          `Error fetching table data for ${tableName}: ${error.message}`,
          "error"
        );
      } finally {
        this.isLoading = false;
      }
    },
    async fetchPassportAdvantageData() {
      this.isLoading = true;
      try {
        const tableList = await fetchTableNames(this.username);

        const passportTables = tableList.filter((tableName) =>
          /^passport_\d+_\d+$/i.test(tableName)
        );

        if (passportTables.length === 0) {
          throw new Error("No valid passport tables found.");
        }

        passportTables.sort((a, b) => {
          const [, monthA, yearA] = a.match(/passport_(\d+)_(\d+)/i);
          const [, monthB, yearB] = b.match(/passport_(\d+)_(\d+)/i);
          const dateA = new Date(Number(yearA), Number(monthA) - 1);
          const dateB = new Date(Number(yearB), Number(monthB) - 1);
          return dateA - dateB;
        });

        const newestTable = passportTables[passportTables.length - 1];

        this.passportAdvantageData = await fetchTableData(
          newestTable,
          this.username
        );
        this.passportAdvantageData.sort();
        this.matchDataCurr();
      } catch (error) {
        this.showSnackbar(error.message, "error");
      } finally {
        this.isLoading = false;
      }
    },

    async fetchProductionData() {
      const tableName = `production_${this.selectedMonthCurr}_${this.selectedYearCurr}`;
      this.isLoading = true;

      try {
        const rawData = await fetchTableData(tableName, this.username);
        const wasprdrawData = rawData.filter(item => item["Component Name"] === "WebSphere Application Server Network Deployment");
        const securitydirectoryprdrawData = rawData.filter(item => item["Component Name"] === "IBM Security Directory Server - Server");
        const mqprdrawData = rawData.filter(item => item["Component Name"] === "IBM MQ Advanced");
        const db2prdrawData = rawData.filter(item => item["Component Name"] === "IBM DB2 Enterprise Server Edition PVU Option");
        this.productionData = dataProcessor(rawData);
        this.wasprdData = dataProcessor(wasprdrawData);
        this.securitydirectoryprdData = dataProcessor(securitydirectoryprdrawData);
        this.mqprdData = dataProcessor(mqprdrawData);
        this.db2prdData = dataProcessor(db2prdrawData);
        this.matchDataCurr(); // Assuming you want to process the fetched data
      } catch (error) {
        this.showSnackbar(
          `Error fetching production data for ${tableName}: ${error.message}`,
          "error"
        );
      } finally {
        this.isLoading = false;
      }
    },

    async fetchDevelopData() {
      const tableName = `develop_${this.selectedMonthCurr}_${this.selectedYearCurr}`;
      this.isLoading = true;

      try {
        const rawData = await fetchTableData(tableName, this.username);
        const wasdevrawData = rawData.filter(item => item["Component Name"] === "WebSphere Application Server Network Deployment");
        const securitydirectorydevrawData = rawData.filter(item => item["Component Name"] === "IBM Security Directory Server - Server");
        const mqdevrawData = rawData.filter(item => item["Component Name"] === "IBM MQ Advanced");
        const db2devrawData = rawData.filter(item => item["Component Name"] === "IBM DB2 Enterprise Server Edition PVU Option");
        this.developData = dataProcessor(rawData);
        this.wasdevData = dataProcessor(wasdevrawData);
        this.securitydirectorydevData = dataProcessor(securitydirectorydevrawData);
        this.mqdevData = dataProcessor(mqdevrawData);
        this.db2devData = dataProcessor(db2devrawData);
        this.matchDataCurr(); // Assuming you want to process the fetched data
      } catch (error) {
        this.showSnackbar(
          `Error fetching develop data for ${tableName}: ${error.message}`,
          "error"
        );
      } finally {
        this.isLoading = false;
      }
    },

    matchDataCurr() {
      this.mappedTableData = [];

      const pvuSums = new Map();
      const lparSums = new Map();
      const nonLparSums = new Map();
      const licenseVpcSums = new Map();

      // Iterate through each item in calculationResultsData
      this.calculationResultsData.forEach((resultItem) => {
        // Extract the table name from the resultItem
        const tableName = resultItem["tablename"];

        // Extract month and year from the table name
        const [, month, year] = tableName.match(/(\d+)_(\d+)/i);

        // Check if the month and year match the selected month and year
        if (
          parseInt(month) === this.selectedMonthCurr &&
          parseInt(year) === this.selectedYearCurr
        ) {
          // The rest of your code goes here...
          const componentName = resultItem["component_name"];
          const pvuMin = parseInt(resultItem["pvu_min"]) || 0; // Parse pvu_min to ensure it's a number
          const lparLicense = parseInt(resultItem["lpar_license"]) || 0; // Parse lpar_license to ensure it's a number
          const nonLparLicense = parseInt(resultItem["non_lpar_license"]) || 0; // Parse non_lpar_license to ensure it's a number
          const licenseVpc = parseInt(resultItem["license_vpc"]) || 0; // Parse license_vpc to ensure it's a number

          // Update pvu_min sum
          if (pvuSums.has(componentName)) {
            pvuSums.set(componentName, pvuSums.get(componentName) + pvuMin);
          } else {
            pvuSums.set(componentName, pvuMin);
          }

          // Update lpar_license sum
          if (lparSums.has(componentName)) {
            lparSums.set(
              componentName,
              lparSums.get(componentName) + lparLicense
            );
          } else {
            lparSums.set(componentName, lparLicense);
          }

          // Update non_lpar_license sum
          if (nonLparSums.has(componentName)) {
            nonLparSums.set(
              componentName,
              nonLparSums.get(componentName) + nonLparLicense
            );
          } else {
            nonLparSums.set(componentName, nonLparLicense);
          }

          // Update license_vpc sum
          if (licenseVpcSums.has(componentName)) {
            licenseVpcSums.set(
              componentName,
              licenseVpcSums.get(componentName) + licenseVpc
            );
          } else {
            licenseVpcSums.set(componentName, licenseVpc);
          }
        }
      });

      const processedComponentNames = new Set();
      this.mappingLicenseData.forEach((mappingItem) => {
        // Iterate through each item in calculationResultsData
        const foundProductionData = this.calculationResultsData.find(
          (resultItem) =>
            resultItem.tablename.includes(
              `production_${this.selectedMonthCurr}_${this.selectedYearCurr}`
            ) && resultItem.component_name === mappingItem.product_name
        );

        const foundDevelopData = this.calculationResultsData.find(
          (resultItem) =>
            resultItem.tablename.includes(
              `develop_${this.selectedMonthCurr}_${this.selectedYearCurr}`
            ) && resultItem.component_name === mappingItem.product_name
        );

        this.calculationResultsData.forEach((resultItem) => {
          // Extract the table name from the resultItem
          const tableName = resultItem["tablename"];

          // Check if the tablename includes 'production' or 'develop'
          if (
            tableName.includes("production") ||
            tableName.includes("develop")
          ) {
            // Extract month and year from the table name
            const [, month, year] = tableName.match(/(\d+)_(\d+)/i);

            // Check if the month and year match the selected month and year
            if (
              parseInt(month) === this.selectedMonthCurr &&
              parseInt(year) === this.selectedYearCurr
            ) {
              // Find matching item in passportAdvantageData based on license_name
              const matchingPassportItem = this.passportAdvantageData.find(
                (passportItem) => {
                  return (
                    passportItem["Current Product"] === mappingItem.license_name
                  );
                }
              );

              const matchingPdfsItem = this.pdfsData.find((pdfsItem) => {
                return (
                  pdfsItem["selected_license"] === mappingItem.license_name
                );
              });

              // Find matching item in calculationResultsData based on component_name
              if (
                resultItem["component_name"] === mappingItem.product_name ||
                mappingItem.product_name
              ) {
                // Check if the component name has already been processed
                if (!processedComponentNames.has(mappingItem.product_name)) {
                  // Add the component name to the set of processed names
                  processedComponentNames.add(mappingItem.product_name);

                  let pvuMinProduction = 0;
                  let pvuMinDevelop = 0;
                  let licenseVpcProduction = 0;
                  let licenseVpcDevelop = 0;
                  let lparLicenseProduction = 0;
                  let lparLicenseDevelop = 0;
                  let nonLparLicenseProduction = 0;
                  let nonLparLicenseDevelop = 0;

                  // If there is production data, assign it to corresponding variables
                  if (foundProductionData) {
                    pvuMinProduction =
                      parseInt(foundProductionData.pvu_min) || 0;
                    licenseVpcProduction =
                      parseInt(foundProductionData.license_vpc) || 0;
                    lparLicenseProduction =
                      parseInt(foundProductionData.lpar_license) || 0;
                    nonLparLicenseProduction =
                      parseInt(foundProductionData.non_lpar_license) || 0;
                  }

                  // If there is develop data, assign it to corresponding variables
                  if (foundDevelopData) {
                    pvuMinDevelop = parseInt(foundDevelopData.pvu_min) || 0;
                    licenseVpcDevelop =
                      parseInt(foundDevelopData.license_vpc) || 0;
                    lparLicenseDevelop =
                      parseInt(foundDevelopData.lpar_license) || 0;
                    nonLparLicenseDevelop =
                      parseInt(foundDevelopData.non_lpar_license) || 0;
                  }

                  if (matchingPassportItem) {
                    const componentName = mappingItem.product_name;
                    const pvuMinSum = pvuSums.get(componentName) || 0;
                    const lparSum = lparSums.get(componentName) || 0;
                    const nonLparSum = nonLparSums.get(componentName) || 0;
                    const totalLicense = lparSum + nonLparSum;
                    const licenseVpcSum =
                      licenseVpcSums.get(componentName) || 0;
                    const webproduction =
                      lparLicenseProduction + nonLparLicenseProduction;
                    const webdevelop =
                      lparLicenseDevelop + nonLparLicenseDevelop;

                    // Define the production and develop values
                    const production = {};
                    if (pvuMinProduction !== 0)
                      production.pvu_min_production = pvuMinProduction;
                    if (licenseVpcProduction !== 0)
                      production.license_vpc_production = licenseVpcProduction;
                    if (webproduction !== 0)
                      production.websphere_production = webproduction;

                    const develop = {};
                    if (pvuMinDevelop !== 0)
                      develop.pvu_min_develop = pvuMinDevelop;
                    if (licenseVpcDevelop !== 0)
                      develop.license_vpc_develop = licenseVpcDevelop;
                    if (webdevelop !== 0)
                      develop.websphere_develop = webdevelop;

                    let activeSubscription =
                      matchingPassportItem[
                        "Active Subscription & Support Quantity"
                      ];
                    activeSubscription = activeSubscription.replace(/,/g, "");
                    activeSubscription = parseInt(activeSubscription) || 0;

                    const status =
                      activeSubscription >= mappingItem.data_collection
                        ? "Covered"
                        : "Over";

                    // Add new entry
                    this.mappedTableData.push({
                      product_name: mappingItem.product_name,
                      license_name: mappingItem.license_name,
                      license_quantity: matchingPassportItem
                        ? matchingPassportItem[
                            "Software License or Appliance Quantity"
                          ]
                        : null,
                      order_reference_number: matchingPdfsItem
                        ? matchingPdfsItem["ibm_order_ref_number"]
                        : null,
                      purchase_license: matchingPdfsItem
                        ? matchingPdfsItem["quantity"]
                        : null,
                      active_subscription_quantity: matchingPassportItem
                        ? matchingPassportItem[
                            "Active Subscription & Support Quantity"
                          ]
                        : null,
                      "Current Product": matchingPassportItem
                        ? matchingPassportItem["Current Product"]
                        : null,
                      data_collection:
                        parseInt(mappingItem.data_collection) || 0,
                      production:
                        Object.keys(production).length === 0
                          ? 0 // If no values, assign an empty object
                          : Object.values(production)[0], // Extract only the value
                      develop:
                        Object.keys(develop).length === 0
                          ? 0 // If no values, assign an empty object
                          : Object.values(develop)[0],
                      pvu_min: pvuMinSum || 0,
                      license_vpc: licenseVpcSum || 0,
                      status: status,
                      calculation_date: resultItem["calculation_date"],
                      Total_License: totalLicense,
                    });
                  }
                }
              }
            }
          }
        });
      });
      // Sort the mappedTableData array by product_name in increasing order
      this.mappedTableData.sort((a, b) => {
        // Convert both product_name values to lowercase for case-insensitive comparison
        const productNameA = a.product_name.toLowerCase();
        const productNameB = b.product_name.toLowerCase();

        // Compare the product_name values
        if (productNameA < productNameB) {
          return -1;
        } else if (productNameA > productNameB) {
          return 1;
        } else {
          return 0;
        }
      });
    },

    async saveData() {
      this.dataSaved = false;
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        for (const data of this.mappedTableData) {
          const { product_name, Total_License, pvu_min, license_vpc } = data;

          if (Total_License !== 0 || pvu_min !== 0 || license_vpc !== 0) {
            const response = await saveDataToPostgreSQL(
              this.username,
              product_name,
              Total_License,
              pvu_min,
              license_vpc
            );
            this.showSnackbar(
              response.message,
              response.success ? "success" : "error"
            );
          } else {
            this.showSnackbar(
              "Data not saved because it contains zero values.",
              "error"
            );
          }
        }

        this.dataSaved = true;
      } catch (error) {
        console.error("Error occurred:", error);
        this.dataSaved = false;
      }
    },
    showSnackbar(message, color) {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    async exportAllDataToExcel() {
      try {
        // Fetch production data
        await this.fetchProductionData();
        await this.fetchDevelopData();

        const month = this.selectedMonthCurr.toString().padStart(2, "0");
        const year = this.selectedYearCurr;
        const fileName = `Summary_${month}_${year}.xlsx`;

        // Export both main data and production data to Excel
        exportToExcel(
          this.mappedTableData,
          this.wasprdData,
          this.wasdevData,
          this.securitydirectoryprdData,
          this.securitydirectorydevData,
          this.mqprdData,
          this.mqdevData,
          this.db2prdData,
          this.db2devData,
          this.productionData,
          this.developData,
          fileName
        );
      } catch (error) {
        console.error("Error exporting data to Excel:", error);
        this.showSnackbar("Error exporting data to Excel", "error");
      }
    },
  },
};
</script>
