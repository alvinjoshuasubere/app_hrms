// Lightweight in-memory GET cache for the HRMS frontend.
// Keeps API/business logic unchanged while avoiding repeated GET requests
// when navigating between pages during the same SPA session.
import axios from "axios";

const CACHE_TTL = 2 * 60 * 1000; // 2 minutes
const MAX_CACHE_ITEMS = 30;

function getCache() {
  if (typeof window === "undefined") return null;
  if (!window.__HRMS_GET_CACHE) window.__HRMS_GET_CACHE = new Map();
  return window.__HRMS_GET_CACHE;
}

function makeKey(config) {
  const method = (config.method || "get").toLowerCase();
  if (method !== "get") return null;

  const params = config.params || {};
  let query = "";
  try {
    query = Object.keys(params)
      .sort()
      .map((key) => `${key}=${JSON.stringify(params[key])}`)
      .join("&");
  } catch (_) {
    query = String(params);
  }

  return `${config.baseURL || ""}${config.url || ""}?${query}`;
}

export default () => {
  const cache = getCache();
  if (!cache || axios.__hrmsPerformanceInstalled) return;

  axios.__hrmsPerformanceInstalled = true;

  axios.interceptors.request.use((config) => {
    const method = (config.method || "get").toLowerCase();

    // Any write invalidates cached GET data so edits are immediately reflected.
    if (method !== "get") {
      cache.clear();
      return config;
    }

    if (config.__skipHrmsCache) return config;

    const key = makeKey(config);
    const entry = key ? cache.get(key) : null;

    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
      config.__hrmsCacheHit = true;
      config.adapter = async () => ({
        data: entry.data,
        status: entry.status,
        statusText: entry.statusText,
        headers: entry.headers,
        config,
        request: null,
      });
    } else if (entry) {
      cache.delete(key);
    }

    return config;
  });

  axios.interceptors.response.use(
    (response) => {
      const config = response.config || {};
      const key = makeKey(config);

      if (key && !config.__hrmsCacheHit) {
        cache.set(key, {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          timestamp: Date.now(),
        });

        while (cache.size > MAX_CACHE_ITEMS) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
      }

      return response;
    },
    (error) => Promise.reject(error)
  );
};
