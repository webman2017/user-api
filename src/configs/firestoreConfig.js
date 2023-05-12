const admin = require("firebase-admin");
const serviceAccount = require("./../../serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: "https://hubexpress-3cac4-default-rtdb.asia-southeast1.firebasedatabase.app"
});
const db = admin.firestore()


const geo = require('geofirex').init(admin);