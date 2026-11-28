// Cache only reference lists in browser memory. Never cache payroll, employee profiles or login.
import axios from "axios";
const TTL = 120000;
const allowed = /\/file-maintenance\/(department|division|position|barangay|country|bank|periods)\/get-all\/?$/;
export default ({ $axios }) => {
  if (typeof window === "undefined") return;
  const cache = new Map();
  const pending = new Map();
  let generation = 0;
  const clear = () => { generation++; cache.clear(); pending.clear(); };
  const identity = () => JSON.stringify([localStorage.getItem("empno"),localStorage.getItem("swipe_id"),localStorage.getItem("token")]);
  let session = identity();
  const install = client => {
    if (!client || !client.interceptors) return;
    client.interceptors.request.use(config => {
      const current = identity();
      if (current !== session) { clear(); session = current; }
      if ((config.method || "get").toLowerCase() !== "get") { clear(); return config; }
      if (config.__skipHrmsCache || config.params || config.signal || config.cancelToken || config.auth || config.withCredentials) return config;
      const url = (config.url || "").split("?")[0];
      if (!allowed.test(url) || (config.url || "").includes("?")) return config;
      const headers = config.headers || {};
      if (headers.Authorization || headers.authorization) return config;
      const key = JSON.stringify([current,config.baseURL || "",url]);
      const adapter = config.adapter || client.defaults.adapter;
      const execute = typeof adapter === "function" ? adapter : (axios.getAdapter ? axios.getAdapter(adapter) : null);
      if (!execute) return config;
      const version = generation;
      config.adapter = async cfg => {
        const clone = value => JSON.parse(JSON.stringify(value));
        const hit = cache.get(key);
        if (hit && Date.now() < hit.expires) return { ...hit.response, data:clone(hit.response.data), config:cfg };
        cache.delete(key);
        let task = pending.get(key);
        if (!task) {
          task = execute(cfg).then(response => {
            // Axios adapters return raw JSON strings; retain only successful reference responses.
            if (generation === version && response.status === 200 && identity() === current) {
              const {data,status,statusText,headers} = response;
              cache.set(key,{expires:Date.now()+TTL,response:{data:clone(data),status,statusText,headers}});
              while(cache.size>30) cache.delete(cache.keys().next().value);
            }
            return response;
          });
          pending.set(key,task);
        }
        try { const response = await task; return {...response,data:clone(response.data),config:cfg}; }
        finally { if(pending.get(key)===task) pending.delete(key); }
      };
      return config;
    });
    client.interceptors.response.use(response => {
      if ((response.config.method || "get").toLowerCase() !== "get") clear();
      return response;
    }, error => { if(error.config && (error.config.method || "get").toLowerCase() !== "get") clear(); return Promise.reject(error); });
  };
  install(axios);
  if ($axios !== axios) install($axios);
  window.addEventListener("pagehide",clear);
  window.addEventListener("storage",clear);
};
