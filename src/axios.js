// src/axios.js 或类似文件
import axios from 'axios';

// 是否需要携带cookie
axios.defaults.withCredentials = false;

// 使用环境变量设置 baseURL
const baseURL = process.env.VUE_APP_API_BASE_URL; 

// 创建axios实例
const instance = axios.create({
    baseURL: baseURL
});

export default instance;