import axios from 'axios';

const apiUrl = window.env.API_URL || import.meta.env.VITE_API_URL;

const instance = axios.create({
    baseURL: apiUrl
});

export default instance;
