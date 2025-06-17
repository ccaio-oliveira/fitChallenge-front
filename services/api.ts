import axios from "axios";

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.5:8080/api",
    timeout: 10000,
});

export default api;