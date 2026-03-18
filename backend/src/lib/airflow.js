const axios = require("axios");

const AIRFLOW_API_URL = process.env.AIRFLOW_API_URL;
const AIRFLOW_API_USER = process.env.AIRFLOW_API_USER;
const AIRFLOW_API_PASS = process.env.AIRFLOW_API_PASS;

const airflowApi = axios.create({
  baseURL: AIRFLOW_API_URL,
  auth: {
    username: AIRFLOW_API_USER,
    password: AIRFLOW_API_PASS,
  },
});

async function triggerOcrPipeline(filePath) {
  if (!AIRFLOW_API_URL) {
    console.warn("AIRFLOW_API_URL not set, skipping DAG trigger.");
    return null;
  }

  try {
    const response = await airflowApi.post("/dags/ocr_service_turbo_pipeline/dagRuns", {
      conf: {
        file_path: filePath,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error triggering Airflow DAG:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = { triggerOcrPipeline };
