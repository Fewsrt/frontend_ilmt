import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.SERVER_NAME,
});

export default axiosInstance;
