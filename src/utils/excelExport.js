import * as XLSX from 'xlsx';

/**
 * Export data to an Excel file with multiple sheets.
 * @param {Array} data - Array of main data objects.
 * @param {Array} productionData - Array of production data objects.
 * @param {Array} developData - Array of development data objects.
 * @param {string} fileName - The name of the Excel file to be saved.
 */
export function exportToExcel(data, wasprdData, wasdevData, securitydirectoryprdData, securitydirectorydevData, mqprdData, mqdevData, db2prdData, db2devData, productionData, developData, fileName) {
  try {
    // Helper function to map data
    const mapData = item => ({
      "ID": item.id,
      "Publisher Name": item.publisher_name,
      "Component Name": item.component_name,
      "Component Version": item.component_version,
      "Component Detailed Version": item.component_detailed_version,
      "End of Support": item.end_of_support,
      "Component Creation": item.component_creation,
      "Component Modification": item.component_modification,
      "Component Definition Source": item.component_definition_source,
      "Instance Tags": item.instance_tags,
      "Component Tags": item.component_tags,
      "Suppressed": item.suppressed,
      "Shared": item.shared,
      "Always Not Charged": item.always_not_charged,
      "Product Name": item.product_name,
      "Product Version": item.product_version,
      "Product Metric": item.product_metric,
      "Cloud Pak or FlexPoint Bundle": item.cloud_pak_or_flexpoint_bundle,
      "Entitled": item.entitled,
      "Charged": item.charged,
      "Bundling Option from IBM Catalog": item.bundling_option_from_ibm_catalog,
      "One to One": item.one_to_one,
      "Confirmed": item.confirmed,
      "Excluded": item.excluded,
      "Comment": item.comment,
      "Bundling Tag Used": item.bundling_tag_used,
      "Imported Part Numbers": item.imported_part_numbers,
      "Computer Name": item.computer_name,
      "Data Source Name": item.data_source_name,
      "Computer First Seen": item.computer_first_seen,
      "Computer Last Seen": item.computer_last_seen,
      "Computer Deletion Date": item.computer_deletion_date,
      "Operating System": item.operating_system,
      "DNS Name": item.dns_name,
      "IP Address": item.ip_address,
      "Internal Computer ID": item.internal_computer_id,
      "Data Source Computer ID": item.data_source_computer_id,
      "Status": item.status,
      "Computer Type": item.computer_type,
      "Partition Cores": item.partition_cores,
      "Server ID": item.server_id,
      "Server Serial Number": item.server_serial_number,
      "Server Vendor": item.server_vendor,
      "Server Model": item.server_model,
      "Server Type": item.server_type,
      "Server Cores": item.server_cores,
      "Processor Brand String": item.processor_brand_string,
      "Vendor Brand Type Model": item.vendor_brand_type_model,
      "System Model": item.system_model,
      "PVU per Core": item.pvu_per_core,
      "Changed PVU Value": item.changed_pvu_value,
      "Default PVU Value": item.default_pvu_value,
      "LPAR Entitlement": item.lpar_entitlement,
      "Is Capped": item.is_capped,
      "Shared Mode": item.shared_mode,
      "Partition Virtual Processors": item.partition_virtual_processors,
      "Server Active Sockets": item.server_active_sockets,
      "Virtual Shared Pool Cores": item.virtual_shared_pool_cores,
      "Physical Shared Pool Cores": item.physical_shared_pool_cores,
      "Cluster Name": item.cluster_name,
      "Cluster Cores": item.cluster_cores,
      "Shared Pool ID": item.shared_pool_id,
      "Logical Processors": item.logical_processors,
      "Delayed Data Upload": item.delayed_data_upload,
      "Missing Software Scan": item.missing_software_scan,
      "Outdated Capacity Scan": item.outdated_capacity_scan,
      "Old Scanner Version": item.old_scanner_version,
      "Outdated BigFix Agent Version": item.outdated_bigfix_agent_version,
      "Has Low Disk Space": item.has_low_disk_space,
      "Is Out of Sync": item.is_out_of_sync,
      "Has Missing Prerequisites": item.has_missing_prerequisites,
      "Agent Version": item.agent_version,
      "Scanner Version": item.scanner_version,
      "Catalog Scan Successful": item.catalog_scan_successful,
      "Software Tags Scan Successful": item.software_tags_scan_successful,
      "Catalog Version": item.catalog_version,
      "Last Scan Attempt": item.last_scan_attempt,
      "Scanning Shared Disks": item.scanning_shared_disks,
      "Mounted Shared Disks": item.mounted_shared_disks,
      "Catalog Scan Not Uploaded": item.catalog_scan_not_uploaded,
      "Last Successful Capacity Scan": item.last_successful_capacity_scan,
      "From Software Template": item.from_software_template,
      "Installation Path": item.installation_path,
      "Discovery Start": item.discovery_start,
      "Discovery End": item.discovery_end,
      "Present": item.present,
      "Details": item.details,
    });

    const was_mq_db2Data = item => ({
      "Component Name": item.component_name,
      "Component Version": item.component_version,
      "Product Name": item.product_name,
      "Product Metric": item.product_metric,
      "Cloud Pak or FlexPoint Bundle": item.cloud_pak_or_flexpoint_bundle,
      "Charged": item.charged,
      "Confirmed": item.confirmed,
      "Excluded": item.excluded,
      "Comment": item.comment,
      "Imported Part Numbers": item.imported_part_numbers,
      "Computer Name": item.computer_name,
      "Computer Last Seen": item.computer_last_seen,
      "Server Serial Number": item.server_serial_number,
      "Server Cores": item.server_cores,
      "PVU per Core": item.pvu_per_core,
      "LPAR Entitlement": item.lpar_entitlement,
      "Partition Virtual Processors": item.partition_virtual_processors,
      "Virtual Shared Pool Cores": item.virtual_shared_pool_cores,
      "Shared Pool ID": item.shared_pool_id,
      "Logical Processors": item.logical_processors,
    });

    const securityData = item => ({
      "Component Name": item.component_name,
      "Component Version": item.component_version,
      "Product Name": item.product_name,
      "Product Metric": item.product_metric,
      "Cloud Pak or FlexPoint Bundle": item.cloud_pak_or_flexpoint_bundle,
      "Charged": item.charged,
      "Confirmed": item.confirmed,
      "Excluded": item.excluded,
      "Comment": item.comment,
      "Imported Part Numbers": item.imported_part_numbers,
      "Computer Name": item.computer_name,
      "Computer Last Seen": item.computer_last_seen,
      "Server Serial Number": item.server_serial_number,
      "Server Cores": item.server_cores,
      "PVU per Core": item.pvu_per_core,
      "LPAR Entitlement": item.lpar_entitlement,
      "Partition Virtual Processors": item.partition_virtual_processors,
      "Virtual Shared Pool Cores": item.virtual_shared_pool_cores,
      "Logical Processors": item.logical_processors,
    });

    // Prepare data for export
    const dataToExport = data.map(item => ({
      "Product Name": item.product_name,
      "License Name": item.license_name,
      "Software License or Appliance Quantity": item.license_quantity,
      "Active Subscription & Support Quantity": item.active_subscription_quantity,
      "Data Collection": item.data_collection,
      Production: item.production,
      Develop: item.develop,
      Status: item.status,
      "Calculation Date": item.calculation_date,
    }));

    // Prepare PRD and DEV data for export using the helper function
    const WAS_PRD = wasprdData.map(was_mq_db2Data);
    const WAS_DEV = wasdevData.map(was_mq_db2Data);
    const SecurityDirectory_PRD = securitydirectoryprdData.map(securityData);
    const SecurityDirectory_DEV = securitydirectorydevData.map(securityData);
    const MQ_PRD = mqprdData.map(was_mq_db2Data);
    const MQ_DEV = mqdevData.map(was_mq_db2Data);
    const DB2_PRD = db2prdData.map(was_mq_db2Data);
    const DB2_DEV = db2devData.map(was_mq_db2Data);
    const productionDataToExport = productionData.map(mapData);
    const developDataToExport = developData.map(mapData);

    // Convert data to Excel worksheets
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const WAS_PRDWorksheet = XLSX.utils.json_to_sheet(WAS_PRD);
    const WAS_DEVWorksheet = XLSX.utils.json_to_sheet(WAS_DEV);
    const SecurityDirectory_PRDWorksheet = XLSX.utils.json_to_sheet(SecurityDirectory_PRD);
    const SecurityDirectory_DEVWorksheet = XLSX.utils.json_to_sheet(SecurityDirectory_DEV);
    const MQ_PRDWorksheet = XLSX.utils.json_to_sheet(MQ_PRD);
    const MQ_DEVWorksheet = XLSX.utils.json_to_sheet(MQ_DEV);
    const DB2_PRDWorksheet = XLSX.utils.json_to_sheet(DB2_PRD);
    const DB2_DEVWorksheet = XLSX.utils.json_to_sheet(DB2_DEV);
    const prdWorksheet = XLSX.utils.json_to_sheet(productionDataToExport);
    const devWorksheet = XLSX.utils.json_to_sheet(developDataToExport);

    // Create Excel workbook and append sheets
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Summary License');
    XLSX.utils.book_append_sheet(workbook, WAS_PRDWorksheet, 'WAS_PRD');
    XLSX.utils.book_append_sheet(workbook, WAS_DEVWorksheet, 'WAS_DEV');
    XLSX.utils.book_append_sheet(workbook, SecurityDirectory_PRDWorksheet, 'SecurityDirectory_PRD');
    XLSX.utils.book_append_sheet(workbook, SecurityDirectory_DEVWorksheet, 'SecurityDirectory_DEV');
    XLSX.utils.book_append_sheet(workbook, MQ_PRDWorksheet, 'MQ_PRD');
    XLSX.utils.book_append_sheet(workbook, MQ_DEVWorksheet, 'MQ_DEV');
    XLSX.utils.book_append_sheet(workbook, DB2_PRDWorksheet, 'DB2_PRD');
    XLSX.utils.book_append_sheet(workbook, DB2_DEVWorksheet, 'DB2_DEV');
    XLSX.utils.book_append_sheet(workbook, prdWorksheet, 'PRD');
    XLSX.utils.book_append_sheet(workbook, devWorksheet, 'DEV');

    // Generate Excel file and trigger download
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
  }
}
