const bucket = require("../initializeFirebaseWadlaPrivate");

const generateSignedUrl = async (filePath) => {
  let file = bucket.file(filePath);

  const options = {
    action: "read",
    expires: Date.now() + 60 * 60 * 1000,
  };

  const [url] = await file.getSignedUrl(options);

  return url;
};

module.exports = generateSignedUrl;
