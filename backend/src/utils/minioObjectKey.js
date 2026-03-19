function normalizeMinioObjectKey(storagePath, bucketName) {
  if (!storagePath) return "";

  let key = String(storagePath).trim();

  // s3://raw/path/to/file.pdf
  if (key.startsWith("s3://")) {
    key = key.slice("s3://".length);
    if (bucketName && key.toLowerCase().startsWith(bucketName.toLowerCase() + "/")) {
      key = key.slice(bucketName.length + 1);
    } else {
      const firstSlash = key.indexOf("/");
      if (firstSlash !== -1) key = key.slice(firstSlash + 1);
    }
  }

  // /raw/path/to/file.pdf
  while (key.startsWith("/")) key = key.slice(1);
  if (bucketName && key.toLowerCase().startsWith(bucketName.toLowerCase() + "/")) {
    key = key.slice(bucketName.length + 1);
  }

  return key;
}

module.exports = { normalizeMinioObjectKey };

