import axios from "axios";

const serverUrl = import.meta.env.VITE_API_URL;
export const client = axios.create({
    baseURL: serverUrl,
});