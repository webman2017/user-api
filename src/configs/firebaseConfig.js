// Import the functions you need from the SDKs you need
// const firebase = require("firebase");
const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAdKUv-SsolSpufEtpqSIbH_GNQBXLp-14",
    authDomain: "hubexpress-3cac4.firebaseapp.com",
    databaseURL:
        "https://hubexpress-3cac4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "hubexpress-3cac4",
    storageBucket: "hubexpress-3cac4.appspot.com",
    messagingSenderId: "650992609423",
    appId: "1:650992609423:web:2f530760a9c24f09af28fa",
    measurementId: "G-LTWGE8FZ6P",
};
const app = initializeApp(firebaseConfig);

// Get a reference to the database service
const database = getDatabase(app);
// firebase.initializeApp({
//   apiKey: "AIzaSyAdKUv-SsolSpufEtpqSIbH_GNQBXLp-14",
//   authDomain: "hubexpress-3cac4.firebaseapp.com",
//   databaseURL:
//     "https://hubexpress-3cac4-default-rtdb.asia-southeast1.firebasedatabase.app",
//   projectId: "hubexpress-3cac4",
//   storageBucket: "hubexpress-3cac4.appspot.com",
//   messagingSenderId: "650992609423",
//   appId: "1:650992609423:web:2f530760a9c24f09af28fa",
//   measurementId: "G-LTWGE8FZ6P",
// });
// const app = firebase.initializeApp(firebaseConfig);
// const app = initializeApp(firebaseConfig);
// const database = firebase.database();
module.exports = database;
// module.exports = sequelize
// {
//   app: initializeApp(firebaseConfig),
//   database: firebase.database()
//   analytics: getAnalytics(app),
// };

// Initialize Firebase
// export const app = initializeApp(firebaseConfig);
// export const analytics = getAnalytics(app);
