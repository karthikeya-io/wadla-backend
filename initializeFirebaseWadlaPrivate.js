var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKeyWadlaPrivate.json");

let wadlaPrivateapp = admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.PRIVATE_STORAGE_BUCKET,
  },
  "wadlaPrivate"
);

var bucket = wadlaPrivateapp.storage().bucket();

module.exports = bucket;
