const { Client } = require("minio");

function getMinioClient() {
  const endpoint = process.env.MINIO_ENDPOINT;
  const accessKey =
    process.env.MINIO_ACCESS_KEY ||
    process.env.MINIO_ROOT_USER ||
    process.env.MINIO_USER;
  const secretKey =
    process.env.MINIO_SECRET_KEY ||
    process.env.MINIO_ROOT_PASSWORD ||
    process.env.MINIO_PASSWORD;

  if (!accessKey || !secretKey) {
    throw new Error(
      "Missing MinIO credentials. Set MINIO_ACCESS_KEY/MINIO_SECRET_KEY (or MINIO_ROOT_USER/MINIO_ROOT_PASSWORD).",
    );
  }

  if (endpoint) {
    const url = new URL(endpoint);
    const useSSL = url.protocol === "https:";
    const port = url.port ? Number(url.port) : useSSL ? 443 : 80;
    return new Client({
      endPoint: url.hostname,
      port,
      useSSL,
      accessKey,
      secretKey,
    });
  }

  const endPoint = process.env.MINIO_HOST || "localhost";
  const port = Number(process.env.MINIO_PORT || 9000);
  const useSSL = String(process.env.MINIO_USE_SSL || "false").toLowerCase() === "true";
  return new Client({ endPoint, port, useSSL, accessKey, secretKey });
}

function getRawBucket() {
  return process.env.MINIO_RAW_BUCKET || "raw";
}

module.exports = { getMinioClient, getRawBucket };

