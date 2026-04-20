import Vue from "vue";
import { init as initApm } from "@elastic/apm-rum";
const apm = initApm({
  // Set required service name (allowed characters: a-z, A-Z, 0-9, -, _, and space)
  serviceName: "tsis-app-prod",

  // Set custom APM Server URL (default: http://localhost:8200)
  serverUrl: "https://elasticsearch.biotechfarms.net",

  // Set the service version (required for source map feature)
  serviceVersion: "",

  // Set the service environment
  environment: "prod"
});

Vue.use(apm);