function normalizeMinioObjectKey(storagePath, bucketName) {
  if (!storagePath) return "";

  let key = String(storagePath).trim();

  // s3://bucket/path/to/file.pdf
  if (key.startsWith("s3://")) {
    key = key.slice("s3://".length);
    const firstSlash = key.indexOf("/");
    if (firstSlash !== -1) {
      const pathBucket = key.slice(0, firstSlash);
      // If the bucket in the URL matches what we expect, or if we just want to strip the first part
      key = key.slice(firstSlash + 1);
    }
  }

  // /bucket/path/to/file.pdf or bucket/path/to/file.pdf
  while (key.startsWith("/")) key = key.slice(1);
  
  if (bucketName && key.toLowerCase().startsWith(bucketName.toLowerCase() + "/")) {
    key = key.slice(bucketName.length + 1);
  } else {
    // If it starts with common bucket names like raw/ silver/ gold/
    const buckets = ["raw", "silver", "gold"];
    for (const b of buckets) {
      if (key.toLowerCase().startsWith(b + "/")) {
        key = key.slice(b.length + 1);
        break;
      }
    }
  }

  return key;
}

module.exports = { normalizeMinioObjectKey };

