import axios from "axios";

const api = axios.create({
    baseURL:"https://nuti-seletivo-back-end-production.up.railway.app/api/consulta/v1"
})

export default api
