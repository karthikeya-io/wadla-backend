const bucket = require("../initializeFirebaseWadlaPrivate");

const generateSignedUrl = async (filePath) => {
  let file = bucket.file(filePath);

  const options = {
    action: "read",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  };

  const [url] = await file.getSignedUrl(options);

  return url;
};

module.exports = generateSignedUrl;
