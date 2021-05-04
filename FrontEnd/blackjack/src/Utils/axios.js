import axios from 'axios'

const API_URL = "http://0.0.0.0:5000"
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/'

const AxiosInstance = axios.create({
       baseURL: API_URL,  
       headers : {
           Accept: 'application/json',
           'Content-Type': 'application/json',
           'Access-Control-Allow-Origin': '*',
       }
});


const getAPI = (apiUrl) => AxiosInstance.get(PROXY_URL + apiUrl);

const postAPI = (apiUrl, data) => AxiosInstance.post(apiUrl, data);


export { 
    postAPI,
    getAPI,
};

export default AxiosInstance;
