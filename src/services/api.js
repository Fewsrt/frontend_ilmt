import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.SERVER_NAME,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchTableData = async (tableName, username) => {
  try {
    const response = await apiClient.get(`/api/table-data/${tableName}`, {
      params: { username },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching table data for ${tableName}: ${error.message}`);
  }
};

export const fetchTableNames = async (username) => {
  try {
    const response = await apiClient.get('/api/table-names', {
      params: { username },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching table names: ${error.message}`);
  }
};

export const saveDataToPostgreSQL = async (username, productName, totalLicense, pvuMinSum, licenseVpcSum) => {
    if (totalLicense !== 0 || pvuMinSum !== 0 || licenseVpcSum !== 0) {
      try {
        await apiClient.post('/api/update-data-collection', {
          productName,
          newDataCollection: {
            pvuMinSum,
            licenseVpcSum,
            totalLicense,
          },
        }, {
          params: { username },
        });
        return { success: true, message: 'Data updated successfully' };
      } catch (error) {
        return { success: false, message: `Error saving data: ${error.message}` };
      }
    } else {
      return { success: false, message: 'Data not saved because it contains zero values.' };
    }
  };
