var admin = require('firebase-admin');
var serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'wadla1.appspot.com'
});

var bucket = admin.storage().bucket();

module.exports = bucket;
