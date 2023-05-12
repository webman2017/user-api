const {
    activities,
    orders,
    restaurant,
    deliverySave,
    deliverySaveDetail,
    driver,
    orderDetails, runningNumber
} = require("./../models");
const Sequelize = require("sequelize");
const admin = require("firebase-admin");
const { Op } = require("sequelize");
const axios = require("axios").default;
const serviceAccount = require("./../../serviceAccountKey.json");
const openrouteService = require("./../configs/openroute");
const moment = require("moment");
const currentTimeString = moment().tz("Asia/Bangkok").format("HH:mm:ss");
const { ref, set, onValue, update, remove } = require("firebase/database");
const database = require("../configs/firebaseConfig");

const currentTime = moment().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
        "https://hubexpress-3cac4-default-rtdb.asia-southeast1.firebasedatabase.app",
});
const pathImage = "https://www.hubexpress.co/webimages/upload/Driver/";
const db = admin.firestore();
const geo = require("geofirex").init(admin);
const { object } = require("joi");
const { calculateGoogleMapDistance } = require("./../utils/common.utils");
const { async } = require("@firebase/util");
const restaurantStatus = async (startTime, endTime) => {
    const timeStart = moment.duration(startTime, "HH:mm:ss");
    const timeCurrent = moment.duration(currentTimeString, "HH:mm:ss");
    const diff = timeCurrent.subtract(timeStart);
    // console.log(diff)
    const h = diff.hours(); // return hours
    const m = diff.minutes(); // return minutes
    let dayLabel = "";
    let statusNumber;
    // const timeEnd = moment.duration(endTime, "HH:mm:ss");
    // const diffEnd = currentTimeString.subtract(timeEnd);
    // const he = diffEnd.hours(); // return hours
    // const me = diffEnd.minutes(); // return minutes
    if (currentTimeString > startTime && currentTimeString < endTime) {
        dayLabel = "We are open";
        statusNumber = 1;
    } else if (
        (currentTimeString > startTime && currentTimeString > endTime) ||
        currentTimeString < startTime
    ) {
        dayLabel = "We are close";
        statusNumber = 0;
    }
    // if (h <= 1) {
    //    dayLabel = 'We are open soon'
    // }
    // } else if (me < -30) {
    //    dayLabel = 'We are close soon'
    // }
    return statusNumber;
};
// const intervalFunc = async () => {
//     const citiesRef = db.collection("eatorders");
//     const snapshot = await citiesRef
//         .where("ordersStatus", "in", ["5", "CN"])
//         .get();
//     if (snapshot.empty) {
//         console.log("No matching driver");
//         // return;
//     }
//     snapshot.forEach((doc) => {
//         console.log(doc.id, "=>", doc.data());
//         console.log(doc.data().ordersStatus);

//         if (doc.data().ordersStatus == "5") {
//             activities.update(
//                 {
//                     eStatus: "Complete",
//                 },
//                 {
//                     where: {
//                         iCabRequestId: doc.id,
//                     },
//                 }
//             );
//         } else if (doc.data().ordersStatus == "CN") {
//             activities.update(
//                 {
//                     eStatus: "Cancelled",
//                 },
//                 {
//                     where: {
//                         iCabRequestId: doc.id,
//                     },
//                 }
//             );
//         }
//     });
//     console.log("update order");
// };
// setInterval(intervalFunc, 30000)
module.exports = {
    async cloudMessage(ctx, _next) {
        const tokenData = ctx.request.body;
        const FCM = require("fcm-node");
        var serverKey =
            "AAAAl5Iu6I8:APA91bFzRbdm8HodvRZri5E9qee-9wcucAolZ1-m3skYhkZ20v2lbN2tQIpxPn6c6X1OW7o1dOXCoNxEEWupLHSpuTYosrGYUolDlhYCtBybpWDFLpgzWuZYzcxFO9vcP6RY30AMfXzX";
        var fcm = new FCM(serverKey);
        var message = {
            to: tokenData.token,
            notification: {
                title: "test",
                body: '{"test test"}',
            },
            data: {
                //you can send only notification or only data(or include both)
                title: "xxx",
                body: '{"name" : "xxx"}',
            },
        };
        fcm.send(message, function (err, response) {
            if (err) {
                console.log("Something has gone wrong!" + err);
                console.log("Respponse:! " + response);
            } else {
                // showToast("Successfully sent with response");
                console.log("Successfully sent with response: ", response);
            }
        });
    },

    async findAll(ctx, _next) {
        try {
            // const snapshot = await db.collection("drivertrigger").get();
            // snapshot.forEach((doc) => {
            //     console.log(doc.id, "=>", doc.data());
            // });
        } catch { }
    },
    async getMarker(ctx, _next) {
        // const snapshot = await db.collection("drivertrigger").get();
        // const a = snapshot.docs.map((doc) => doc.data());
        // console.log(a);
        // ctx.body = a;
    },
    async allOrdersDriver(ctx, _next) {
        try {
            const { query } = ctx;
        } catch (err) {
            ctx.err;
        }
    },
    async firestoreDriverLocation(ctx, _next) {
        try {
            const { query } = ctx;
            const driverId = query.driverId;
            const driverData = await driver.findOne({
                where: {
                    iDriverId: driverId,
                },
            });

            if (
                driverData.dataValues.vImage == "" ||
                driverData.dataValues.vImage == null
            ) {
                var img = "";
            } else {
                var img = pathImage + driverId + "/" + driverData.dataValues.vImage;
            }
            // return
            const position = geo.point(query.lat, query.lng);
            // await db.collection("drivertrigger").doc(`${query.driverId}`).set({
            //     driverId: driverId,
            //     name: driverData.dataValues.vName,
            //     lastname: driverData.dataValues.vLastName,
            //     mobile: driverData.dataValues.vPhone,
            //     image: img,
            //     position,
            //     auto: query.auto,
            //     status: query.status,
            //     tear: 1,
            //     rating: driverData.vAvgRating,
            //     order: 0,
            //     autoJob: 0,
            // });



            ctx.body = {
                result: true,
                message: "ตำแหน่งคนขับออนไลน์สำเร็จ",
            };
        } catch (err) {
            ctx.err;
        }
    },
    async geofirexFindDriver(ctx, _next) {
        try {
            const query = ctx.request.body;
            console.log(query.lat);
            console.log(query.lng);
            // const citiesRef = db.collection("drivertrigger");
            // const snapshot = await citiesRef
            //     .where("status", "==", "null")
            //     .where("auto", "==", true)
            //     .get();
            // if (snapshot.empty) {
            //     console.log("No matching driver");
            //     return;
            // }
            // snapshot.forEach((doc) => {
            //     console.log(doc.id, "=>", doc.data());
            // });
            return;



        } catch (err) {
            ctx.err;
        }
    },
    async orderStore(ctx, _next) {
        try {
            const max = await runningNumber.findOne({
                where: {
                    type: 'EAT'
                }
            })
            // console.log(max.dataValues.runningNumber)
            // let maxNumber = (max.dataValues.runningNumber + 1).toString().padStart(6, "0")
            // const maxData = max.dataValues.runningNumber + 1
            // const https = require("https");
            // const { google } = require("googleapis");
            // const PROJECT_ID = "hubexpress-3cac4";
            // const HOST = "fcm.googleapis.com";
            // const PATH = "/v1/projects/" + PROJECT_ID + "/messages:send";
            // const MESSAGING_SCOPE =
            //     "https://www.googleapis.com/auth/firebase.messaging";
            // const SCOPES = [MESSAGING_SCOPE];
            // function getAccessToken() {
            //     return new Promise(function (resolve, reject) {
            //         const key = require("./../../service-account.json");
            //         const jwtClient = new google.auth.JWT(
            //             key.client_email,
            //             null,
            //             key.private_key,
            //             SCOPES,
            //             null
            //         );
            //         jwtClient.authorize(function (err, tokens) {
            //             if (err) {
            //                 reject(err);
            //                 return;
            //             }
            //             resolve(tokens.access_token);
            //             // console.log(tokens.access_token)
            //         });
            //     });
            // }
            // // [END retrieve_access_token]
            // function sendFcmMessage(fcmMessage) {
            //     getAccessToken().then(function (accessToken) {
            //         const options = {
            //             hostname: HOST,
            //             path: PATH,
            //             method: "POST",
            //             // [START use_access_token]
            //             headers: {
            //                 Authorization: "Bearer " + accessToken,
            //             },
            //             // [END use_access_token]
            //         };
            //         const request = https.request(options, function (resp) {
            //             resp.setEncoding("utf8");
            //             resp.on("data", function (data) {
            //                 console.log("Message sent to Firebase for delivery, response:");
            //                 console.log(data);
            //             });
            //         });
            //         request.on("error", function (err) {
            //             console.log("Unable to send message to Firebase");
            //             console.log(err);
            //         });
            //         request.write(JSON.stringify(fcmMessage));
            //         request.end();
            //     });
            // }
            // const query = ctx.request.body;
            // const d = new Date();
            // const dataOrder = query.orders;
            // const countOrder = dataOrder.length;
            // let ll;
            // let payment = "";
            // let day = d.getDay();
            // let dataRestaurant = [];
            // switch (query.paymentMethod) {
            //     case "Cash":
            //         payment = Null;
            //         break;
            //     default:
            //         payment = query.paymentInfo;
            //         break;
            // }
            // if (countOrder == 1) {
            //     const restaurantData = await restaurant.findAll({
            //         where: {
            //             restaurant_id: dataOrder[0].restaurant_id,
            //         },
            //     });
            //     if (day == 1) {
            //         if (
            //             currentTimeString > restaurantData[0].dataValues.tMonStartTime &&
            //             currentTimeString < restaurantData[0].dataValues.tMonEndTime
            //         ) {
            //             const firestoreData = [];
            //             dataOrder.map((element, index) => {
            //                 restaurantData.map((element1, index1) => {
            //                     const name = dataOrder.find(
            //                         ({ restaurant_id }) => restaurant_id === element.restaurant_id
            //                     );
            //                     if (element.restaurant_id == element1.restaurant_id) {
            //                         let a = Boolean(element1.isMember);
            //                         const newObj = {
            //                             ...element,
            //                             restaurant_name: element1.name_primary,
            //                             restaurant_id: element1.restaurant_id,
            //                             isMember: a

            //                         };
            //                         firestoreData.push(newObj);
            //                     }
            //                 });
            //             });
            //             const position = geo.point(
            //                 parseFloat(dataOrder[0].location.lat),
            //                 parseFloat(dataOrder[0].location.lng)
            //             );

            //             const transactionIdData = 'EAT' + query.userId + '-' + '01' + '-' + moment().unix() + '-' + maxNumber
            //             const userData = {
            //                 iUserId: query.userId,
            //                 vSenderName: query.sender,
            //                 vSenderMobile: query.senderMobile,
            //                 tDestAddress: query.userAddress,
            //                 vSourceLatitude: query.latitude,
            //                 vSourceLongtitude: query.longitude,
            //                 vSenderDeliveryIns: query.vSenderDeliveryIns,
            //                 deliveryFee: query.deliveryFee,
            //                 orderSum: query.total,
            //                 eType: "Eat",
            //                 ePayType: query.paymentMethod,
            //                 eStatus: "Requesting",
            //                 iDriverId: 0,
            //                 message: query.message,
            //                 deliveryFee: query.deliveryFee,
            //                 type: query.type,
            //                 ordersStatus: "0",
            //                 position,
            //                 driver: {
            //                     driverId: null,
            //                     name: null,
            //                     mobile: null,
            //                     image: null,
            //                     rating: null,
            //                 },
            //                 driverOnJob: [],
            //                 orderDate: currentTimeString,
            //                 ordersData: query.orders,
            //                 deliveryPrice: 0,
            //                 transactionId: transactionIdData
            //             };
            //             // console.log(firestoreData)
            //             const result = await activities.create(userData);
            //             await runningNumber.update({
            //                 runningNumber: maxData,
            //             },
            //                 {
            //                     where: {
            //                         type: 'EAT'
            //                     }
            //                 })
            //             // await db
            //             //     .collection("eatorders")
            //             //     .doc(`${transactionIdData}`)
            //             //     .set({
            //             //         iUserId: query.userId,
            //             //         vSenderName: query.sender,
            //             //         vSenderMobile: query.senderMobile,
            //             //         tDestAddress: query.userAddress,
            //             //         vSourceLatitude: query.latitude,
            //             //         vSourceLongtitude: query.longitude,
            //             //         vSenderDeliveryIns: query.vSenderDeliveryIns,
            //             //         orderSum: query.total,
            //             //         paymentInfo: payment,
            //             //         eType: "Eat",
            //             //         eStatus: "Requesting",
            //             //         discountHub: "",
            //             //         iDriverId: 0,
            //             //         ePayType: query.paymentMethod,
            //             //         message: query.message,
            //             //         deliveryFee: query.deliveryFee,
            //             //         type: query.type,
            //             //         ordersStatus: "0",
            //             //         position,
            //             //         driver: {
            //             //             driverId: null,
            //             //             name: null,
            //             //             mobile: null,
            //             //             image: null,
            //             //             rating: null,
            //             //         },
            //             //         driverOnJob: [],
            //             //         orderDate: currentTime,
            //             //         ordersData: firestoreData,
            //             //         getFoodImage: "",
            //             //         receiveFoodImage: "",
            //             //     });
            //             //restaurantonline
            //             const orderbyrestaurant = dataOrder.filter(function (order) {
            //                 return order.restaurant_id == dataOrder[0].restaurant_id;
            //             });
            //             const dataOrderData = {
            //                 vSenderName: query.sender,
            //                 vSenderMobile: query.senderMobile,
            //                 tDestAddress: query.userAddress,
            //                 vSourceLatitude: query.latitude,
            //                 vSourceLongtitude: query.longitude,
            //                 message: orderbyrestaurant[0].message,
            //                 orderId: result.dataValues.iCabRequestId,
            //                 order_sum: orderbyrestaurant[0].order_sum,
            //                 orderdetails: orderbyrestaurant[0].orderdetails,
            //                 statusCooking: 0,
            //                 viewOrders: "0"
            //             };
            //             await dataOrder.forEach(async function (data) {
            //                 var docRef = db
            //                     .collection("restaurantsonline")
            //                     .doc(`${data.restaurant_id}`);
            //                 docRef.get().then((doc) => {
            //                     if (doc.exists) {
            //                         let orderTotal = doc.data().orders;
            //                         // console.log("Document data:", doc.data());
            //                         db.collection("restaurantsonline")
            //                             .doc(`${data.restaurant_id}`)
            //                             .update({
            //                                 orders: orderTotal.concat([dataOrderData]),
            //                             });
            //                         if (doc.data().status == "offline") {
            //                             const noticeData = {
            //                                 message: {
            //                                     // 'topic': `${data.restaurant_id}`,
            //                                     topic: "all",
            //                                     notification: {
            //                                         // 'title': `${result.dataValues.iCabRequestId}`,
            //                                         title: "Hub Merchant App",
            //                                         body: "ORDER จาก" + query.sender + "",
            //                                     },
            //                                 },
            //                             };
            //                             sendFcmMessage(noticeData);
            //                         }
            //                     } else {
            //                         console.log("No such document!");
            //                         db.collection("restaurantsonline")
            //                             .doc(`${data.restaurant_id}`)
            //                             .set({
            //                                 address: restaurantData[0].dataValues.address,
            //                                 address_detail: restaurantData[0].dataValues.address,
            //                                 datetime: currentTime,
            //                                 isMember: Boolean(restaurantData[0].dataValues.isMember),
            //                                 location: {
            //                                     lat: restaurantData[0].dataValues.lat,
            //                                     lng: restaurantData[0].dataValues.lng,
            //                                 },
            //                                 orders: dataOrderData,
            //                                 restaurantsId: restaurantData[0].dataValues.restaurant_id,
            //                                 restaurantsName:
            //                                     restaurantData[0].dataValues.name_primary,
            //                                 status: "offline",
            //                                 viewOrders: "0"
            //                                 // statusCooking: "2",
            //                                 // tel: "0988888888"
            //                             });
            //                     }
            //                 });
            //                 dataRestaurant.push({
            //                     order_sum: data.order_sum,
            //                     order_date: currentTime,
            //                     address: data.address,
            //                     address_detail: data.address_detail,
            //                     iCabRequestId: result.dataValues.iCabRequestId,
            //                     restaurant_id: data.restaurant_id,
            //                     message: data.message,
            //                 });
            //             });
            //             await orders.bulkCreate(dataRestaurant);
            //             const cities = db.collection("drivertrigger");
            //             const center = geo.point(
            //                 parseFloat(query.latitude),
            //                 parseFloat(query.longitude)
            //             );
            //             const radius = 15;
            //             const field = "position";
            //             const driver = geo
            //                 .query(cities)
            //                 .within(center, radius, field)
            //                 .subscribe(async (snap) => {
            //                     const map1 = snap.map(({ id }) => parseInt(id));
            //                     const found = snap.find(
            //                         (element) =>
            //                             element.auto == "true" &&
            //                             element.status == 0 &&
            //                             element.autoJob == 0
            //                     );
            //                     // console.log(found)
            //                     await db
            //                         .collection("eatorders")
            //                         .doc(`${transactionIdData}`)
            //                         .get()
            //                         .then(async (docRef) => {
            //                             // console.log(docRef.data().driverOnJob)
            //                             // return docRef.data().driverOnJob
            //                             if (docRef.data().driverOnJob.length == 0) {
            //                                 if (found) {
            //                                     console.log(found);
            //                                     await db
            //                                         .collection("eatorders")
            //                                         .doc(`${transactionIdData}`)
            //                                         .update({
            //                                             iDriverId: found.id,
            //                                         });
            //                                     await db
            //                                         .collection("drivertrigger")
            //                                         .doc(`${found.id}`)
            //                                         .update({
            //                                             autoJob: 1,
            //                                         });
            //                                 }
            //                             } else {
            //                                 console.log("No such document!");
            //                                 db.collection("restaurantsonline")
            //                                     .doc(`${data.restaurant_id}`)
            //                                     .set({
            //                                         address: restaurantData[0].dataValues.address,
            //                                         address_detail: restaurantData[0].dataValues.address,
            //                                         datetime: currentTime,
            //                                         isMember: Boolean(
            //                                             restaurantData[0].dataValues.isMember
            //                                         ),
            //                                         location: {
            //                                             lat: restaurantData[0].dataValues.lat,
            //                                             lng: restaurantData[0].dataValues.lng,
            //                                         },
            //                                         orders: [dataOrderData],
            //                                         restaurantsId:
            //                                             restaurantData[0].dataValues.restaurant_id,
            //                                         restaurantsName:
            //                                             restaurantData[0].dataValues.name_primary,
            //                                         status: "offline",
            //                                         // statusCooking: "2",
            //                                         // tel: "0988888888"
            //                                     });
            //                             }
            //                         })
            //                         .catch((error) => { });
            //                     db.collection("eatorders")
            //                         .doc(`${transactionIdData}`)
            //                         .update({
            //                             driverOnJob: map1,
            //                         });
            //                 });
            //             ctx.body = {
            //                 message: "orders success",
            //                 orderId: transactionIdData,
            //             };
            //         } else if (
            //             (currentTimeString > restaurantData[0].dataValues.tMonStartTime &&
            //                 currentTimeString > restaurantData[0].dataValues.tMonEndTime) ||
            //             currentTimeString < restaurantData[0].dataValues.tMonStartTime
            //         ) {
            //             ctx.body = {
            //                 status: false,
            //                 details: [
            //                     {
            //                         restaurant_id: dataOrder[0].restaurant_id,
            //                         restaurant_name: dataOrder[0].name_primary,
            //                         open: 0,
            //                         lat: restaurantData[0].dataValues.lat,
            //                         lng: restaurantData[0].dataValues.lng,
            //                     },
            //                 ],
            //             };
            //         }
            //     }
            //     // Tueday
            //     else if (day == 2) {
            //         // console.log("2");
            //         if (
            //             (currentTimeString > restaurantData[0].dataValues.tTueStartTime &&
            //                 currentTimeString < restaurantData[0].dataValues.tTueEndTime) ||
            //             currentTimeString < restaurantData[0].dataValues.tTueEndTime
            //         ) {
            //             // console.log("fff");
            //             const firestoreData = [];
            //             dataOrder.map((element, index) => {
            //                 restaurantData.map((element1, index1) => {
            //                     const name = dataOrder.find(
            //                         ({ restaurant_id }) => restaurant_id === element.restaurant_id
            //                     );
            //                     if (element.restaurant_id == element1.restaurant_id) {
            //                         let a = Boolean(element1.isMember);
            //                         const newObj = {
            //                             ...element,
            //                             restaurant_name: element1.name_primary,
            //                             restaurant_id: element1.restaurant_id,
            //                             isMember: a

            //                         };
            //                         firestoreData.push(newObj);
            //                     }
            //                 });
            //             });
            //             const position = geo.point(
            //                 parseFloat(dataOrder[0].location.lat),
            //                 parseFloat(dataOrder[0].location.lng)
            //             );

            //             const transactionIdData = 'EAT' + query.userId + '-' + '01' + '-' + moment().unix() + '-' + maxNumber
            //             const userData = {
            //                 iUserId: query.userId,
            //                 vSenderName: query.sender,
            //                 vSenderMobile: query.senderMobile,
            //                 tDestAddress: query.userAddress,
            //                 vSourceLatitude: query.latitude,
            //                 vSourceLongtitude: query.longitude,
            //                 vSenderDeliveryIns: query.vSenderDeliveryIns,
            //                 deliveryFee: query.deliveryFee,
            //                 orderSum: query.total,
            //                 paymentInfo: payment,
            //                 eType: "Eat",
            //                 eStatus: "Requesting",
            //                 ePayType: query.paymentMethod,
            //                 iDriverId: 0,
            //                 message: query.message,
            //                 deliveryFee: query.deliveryFee,
            //                 type: query.type,
            //                 ordersStatus: "0",
            //                 position,
            //                 driver: {
            //                     driverId: null,
            //                     name: null,
            //                     mobile: null,
            //                     image: null,
            //                     rating: null,
            //                 },
            //                 driverOnJob: [],
            //                 orderDate: currentTime,
            //                 ordersData: query.orders,
            //                 deliveryPrice: 0,
            //                 transactionId: transactionIdData
            //             };
            //             // console.log(firestoreData);
            //             const result = await activities.create(userData);

            //             await runningNumber.update({
            //                 runningNumber: maxData,
            //             },
            //                 {
            //                     where: {
            //                         type: 'EAT'
            //                     }
            //                 })

            //             await db
            //                 .collection("eatorders")
            //                 .doc(`${transactionIdData}`)
            //                 .set({
            //                     paymentInfo: payment,
            //                     iUserId: query.userId,
            //                     vSenderName: query.sender,
            //                     vSenderMobile: query.senderMobile,
            //                     tDestAddress: query.userAddress,
            //                     vSourceLatitude: query.latitude,
            //                     vSourceLongtitude: query.longitude,
            //                     vSenderDeliveryIns: query.vSenderDeliveryIns,
            //                     orderSum: query.total,
            //                     paymentInfo: payment,
            //                     eType: "Eat",
            //                     eStatus: "Requesting",
            //                     ePayType: query.paymentMethod,
            //                     discountHub: "",
            //                     iDriverId: 0,
            //                     message: query.message,
            //                     deliveryFee: query.deliveryFee,
            //                     type: query.type,
            //                     ordersStatus: "0",
            //                     position,
            //                     driver: {
            //                         driverId: null,
            //                         name: null,
            //                         mobile: null,
            //                         image: null,
            //                         rating: null,
            //                     },
            //                     driverOnJob: [],
            //                     orderDate: currentTime,
            //                     ordersData: firestoreData,
            //                     getFoodImage: "",
            //                     receiveFoodImage: "",
            //                 });

            //             //restaurantonline
            //             const orderbyrestaurant = dataOrder.filter(function (order) {
            //                 return order.restaurant_id == dataOrder[0].restaurant_id;
            //             });
            //             console.log(orderbyrestaurant);
            //             let dataOrderData = {
            //                 vSenderName: query.sender,
            //                 vSenderMobile: query.senderMobile,
            //                 tDestAddress: query.userAddress,
            //                 vSourceLatitude: query.latitude,
            //                 vSourceLongtitude: query.longitude,
            //                 paymentMethod: query.paymentMethod,
            //                 message: orderbyrestaurant[0].message,
            //                 orderId: result.dataValues.iCabRequestId,
            //                 order_sum: orderbyrestaurant[0].order_sum,
            //                 orderdetails: orderbyrestaurant[0].orderdetails,
            //                 statusCooking: 0,
            //                 viewOrders: "0"
            //             };
            //             await dataOrder.forEach(async function (data) {
            //                 var docRef = db
            //                     .collection("restaurantsonline")
            //                     .doc(`${data.restaurant_id}`);
            //                 docRef.get().then((doc) => {
            //                     if (doc.exists) {
            //                         let orderTotal = doc.data().orders;
            //                         // console.log(orderTotal);
            //                         // console.log(dataOrderData);
            //                         // console.log("Document data:", doc.data());
            //                         db.collection("restaurantsonline")
            //                             .doc(`${data.restaurant_id}`)
            //                             .update({
            //                                 orders: orderTotal.concat([dataOrderData]),
            //                             });

            //                         if (doc.data().status == "offline") {
            //                         }
            //                     } else {
            //                         // console.log("No such document!");
            //                         db.collection("restaurantsonline")
            //                             .doc(`${data.restaurant_id}`)
            //                             .set({
            //                                 address: restaurantData[0].dataValues.address,
            //                                 address_detail: restaurantData[0].dataValues.address,
            //                                 datetime: currentTime,
            //                                 isMember: Boolean(restaurantData[0].dataValues.isMember),
            //                                 viewOrders: "0",
            //                                 location: {
            //                                     lat: restaurantData[0].dataValues.lat,
            //                                     lng: restaurantData[0].dataValues.lng,
            //                                 },
            //                                 name_primary: restaurantData[0].dataValues.name_primary,
            //                                 tel: restaurantData[0].dataValues.callablePhoneno,
            //                                 orders: [dataOrderData],
            //                                 restaurantsId: restaurantData[0].dataValues.restaurant_id,
            //                                 restaurantsName:
            //                                     restaurantData[0].dataValues.name_primary,
            //                                 status: "offline",
            //                             });
            //                     }
            //                 });
            //                 dataRestaurant.push({
            //                     order_sum: data.order_sum,
            //                     order_date: currentTime,
            //                     address: data.address,
            //                     address_detail: data.address_detail,
            //                     iCabRequestId: result.dataValues.iCabRequestId,
            //                     restaurant_id: data.restaurant_id,
            //                     message: data.message,
            //                     isMember: "New",
            //                 });
            //             });
            //             // console.log(dataRestaurant)
            //             await orders.bulkCreate(dataRestaurant);
            //             //find driver near area and update in orders collection
            //             const cities = db.collection("drivertrigger");
            //             const center = geo.point(
            //                 parseFloat(query.latitude),
            //                 parseFloat(query.longitude)
            //             );
            //             const radius = 15;
            //             const field = "position";
            //             const driver = geo
            //                 .query(cities)
            //                 .within(center, radius, field)
            //                 .subscribe(async (snap) => {
            //                     const map1 = snap.map(({ id }) => parseInt(id));
            //                     const found = snap.find(
            //                         (element) =>
            //                             element.auto == "true" &&
            //                             element.status == 0 &&
            //                             element.autoJob == 0
            //                     );
            //                     console.log(found);
            //                     await db
            //                         .collection("eatorders")
            //                         .doc(`${transactionIdData}`)
            //                         .get()
            //                         .then(async (docRef) => {
            //                             console.log(docRef.data().driverOnJob);
            //                             // return docRef.data().driverOnJob
            //                             if (docRef.data().driverOnJob.length == 0) {
            //                                 if (found) {
            //                                     console.log(found);
            //                                     await db
            //                                         .collection("eatorders")
            //                                         .doc(`${transactionIdData}`)
            //                                         .update({
            //                                             iDriverId: found.id,
            //                                         });

            //                                     await db
            //                                         .collection("drivertrigger")
            //                                         .doc(`${found.id}`)
            //                                         .update({
            //                                             autoJob: 1,
            //                                         });
            //                                 }
            //                             } else {
            //                                 console.log("No such document!");
            //                                 db.collection("restaurantsonline")
            //                                     .doc(`${data.restaurant_id}`)
            //                                     .set({
            //                                         address: restaurantData[0].dataValues.address,
            //                                         address_detail: restaurantData[0].dataValues.address,
            //                                         datetime: currentTime,
            //                                         isMember: Boolean(
            //                                             restaurantData[0].dataValues.isMember
            //                                         ),
            //                                         location: {
            //                                             lat: restaurantData[0].dataValues.lat,
            //                                             lng: restaurantData[0].dataValues.lng,
            //                                         },
            //                                         orders: dataOrderData,
            //                                         restaurantsId:
            //                                             restaurantData[0].dataValues.restaurant_id,
            //                                         restaurantsName:
            //                                             restaurantData[0].dataValues.name_primary,
            //                                         status: "offline",
            //                                         // statusCooking: "2",
            //                                         // tel: "0988888888"
            //                                     });
            //                             }
            //                         })
            //                         .catch((error) => { });
            //                     db.collection("eatorders")
            //                         .doc(`${transactionIdData}`)
            //                         .update({
            //                             driverOnJob: map1,
            //                         });
            //                 });
            //             ctx.body = {
            //                 message: "orders success",
            //                 orderId: transactionIdData,
            //             };
            //         } else if (
            //             (currentTimeString > restaurantData[0].dataValues.tTueStartTime &&
            //                 currentTimeString > restaurantData[0].dataValues.tTueEndTime) ||
            //             currentTimeString < restaurantData[0].dataValues.tTueStartTime
            //         ) {
            //             ctx.body = {
            //                 status: false,
            //                 details: [
            //                     {
            //                         restaurant_id: dataOrder[0].restaurant_id,
            //                         restaurant_name: dataOrder[0].name_primary,
            //                         open: 0,
            //                         lat: restaurantData[0].dataValues.lat,
            //                         lng: restaurantData[0].dataValues.lng,
            //                     },
            //                 ],
            //             };
            //         }
            //     }
            //     //Wednesday
            //     else if (day == 3) {
            //         if (
            //             currentTimeString > restaurantData[0].dataValues.tWedStartTime &&
            //             currentTimeString < restaurantData[0].dataValues.tWedEndTime
            //         ) {
            //             const firestoreData = [];
            //             dataOrder.map((element, index) => {
            //                 restaurantData.map((element1, index1) => {
            //                     const name = dataOrder.find(
            //                         ({ restaurant_id }) => restaurant_id === element.restaurant_id
            //                     );
            //                     if (element.restaurant_id == element1.restaurant_id) {
            //                         let a = Boolean(element1.isMember);
            //                         const newObj = {
            //                             ...element,
            //                             restaurant_name: element1.name_primary,
            //                             restaurant_id: element1.restaurant_id,
            //                             isMember: a,

            //                         };
            //                         firestoreData.push(newObj);
            //                     }
            //                 });
            //             });
            //             const position = geo.point(
            //                 parseFloat(dataOrder[0].location.lat),
            //                 parseFloat(dataOrder[0].location.lng)
            //             );
            //             const transactionIdData = 'EAT' + query.userId + '-' + '01' + '-' + moment().unix() + '-' + maxNumber
            //             await runningNumber.update({
            //                 runningNumber: maxData,
            //             },
            //                 {
            //                     where: {
            //                         type: 'EAT'
            //                     }
            //                 })
            //             const userData = {
            //                 iUserId: query.userId,
            //                 vSenderName: query.sender,
            //                 vSenderMobile: query.senderMobile,
            //                 tDestAddress: query.userAddress,
            //                 vSourceLatitude: query.latitude,
            //                 vSourceLongtitude: query.longitude,
            //                 vSenderDeliveryIns: query.vSenderDeliveryIns,
            //                 deliveryFee: query.deliveryFee,
            //                 orderSum: query.total,
            //                 eType: "Eat",
            //                 eStatus: "Requesting",
            //                 ePayType: query.paymentMethod,
            //                 iDriverId: 0,
            //                 message: query.message,
            //                 deliveryFee: query.deliveryFee,
            //                 type: query.type,
            //                 ordersStatus: "0",
            //                 position,
            //                 driver: {
            //                     driverId: null,
            //                     name: null,
            //                     mobile: null,
            //                     image: null,
            //                     rating: null,
            //                 },
            //                 driverOnJob: [],
            //                 orderDate: currentTime,
            //                 ordersData: query.orders,
            //                 deliveryPrice: 0,
            //                 transactionId: transactionIdData
            //             };
            //             // console.log(firestoreData)
            //             const result = await activities.create(userData);
            //             const orderDetail = dataOrder[0].orderdetails;
            //             await orderDetail.map((item) => {
            //                 orderDetails.create({
            //                     order_id: result.dataValues.iCabRequestId,
            //                     menu_id: parseInt(item.menu_id),
            //                     menu_name: item.menu_name,
            //                     request_message: item.request_message,
            //                     price_exact: parseInt(item.price_exact),
            //                     price_sale: parseInt(item.price_sale),
            //                     qty: parseInt(item.qty),
            //                 });
            //             });
            //             await db
            //                 .collection("eatorders")
            //                 .doc(`${transactionIdData}`)
            //                 .set({
            //                     paymentInfo: payment,
            //                     iUserId: query.userId,
            //                     vSenderName: query.sender,
            //                     vSenderMobile: query.senderMobile,
            //                     tDestAddress: query.userAddress,
            //                     vSourceLatitude: query.latitude,
            //                     vSourceLongtitude: query.longitude,
            //                     vSenderDeliveryIns: query.vSenderDeliveryIns,
            //                     orderSum: query.total,
            //                     paymentInfo: payment,
            //                     eType: "Eat",
            //                     eStatus: "Requesting",
            //                     ePayType: query.paymentMethod,
            //                     discountHub: "",
            //                     iDriverId: 0,
            //                     message: query.message,
            //                     deliveryFee: query.deliveryFee,
            //                     type: query.type,
            //                     ordersStatus: "0",
            //                     position,
            //                     driver: {
            //                         driverId: null,
            //                         name: null,
            //                         mobile: null,
            //                         image: null,
            //                         rating: null,
            //                     },
            //                     driverOnJob: [],
            //                     orderDate: currentTime,
            //                     ordersData: firestoreData,
            //                     getFoodImage: "",
            //                     receiveFoodImage: "",
            //                 });
            //             //restaurantonline
            //             const orderbyrestaurant = dataOrder.filter(function (order) {
            //                 return order.restaurant_id == dataOrder[0].restaurant_id;
            //             });
            //             // console.log(orderbyrestaurant);
            //             const dataOrderData = {
            //                 vSenderName: query.sender,
            //                 vSenderMobile: query.senderMobile,
            //                 tDestAddress: query.userAddress,
            //                 vSourceLatitude: query.latitude,
            //                 vSourceLongtitude: query.longitude,
            //                 paymentMethod: query.paymentMethod,
            //                 message: orderbyrestaurant[0].message,
            //                 orderId: result.dataValues.iCabRequestId,
            //                 order_sum: orderbyrestaurant[0].order_sum,
            //                 orderdetails: orderbyrestaurant[0].orderdetails,
            //                 statusCooking: 0,
            //                 viewOrders: "0"
            //             };
            //             await dataOrder.forEach(async function (data) {
            //                 var docRef = db
            //                     .collection("restaurantsonline")
            //                     .doc(`${data.restaurant_id}`);
            //                 docRef.get().then((doc) => {
            //                     if (doc.exists) {
            //                         let orderTotal = doc.data().orders;
            //                         // console.log("Document data:", doc.data());
            //                         db.collection("restaurantsonline")
            //                             .doc(`${data.restaurant_id}`)
            //                             .update({
            //                                 orders: orderTotal.concat([dataOrderData]),
            //                             });
            //                         if (doc.data().status == "offline") {
            //                             const noticeData = {
            //                                 message: {
            //                                     // 'topic': `${data.restaurant_id}`,
            //                                     topic: "all",
            //                                     notification: {
            //                                         // 'title': `${result.dataValues.iCabRequestId}`,
            //                                         title: "Hub Merchant App",
            //                                         body: "ORDER จาก" + query.sender + "",
            //                                     },
            //                                 },
            //                             };
            //                             sendFcmMessage(noticeData);
            //                         }
            //                     } else {
            //                         // console.log("No such document!");
            //                         db.collection("restaurantsonline")
            //                             .doc(`${data.restaurant_id}`)
            //                             .set({
            //                                 address: restaurantData[0].dataValues.address,
            //                                 address_detail: restaurantData[0].dataValues.address,
            //                                 datetime: currentTime,
            //                                 isMember: Boolean(restaurantData[0].dataValues.isMember),
            //                                 viewOrders: "0",
            //                                 location: {
            //                                     lat: restaurantData[0].dataValues.lat,
            //                                     lng: restaurantData[0].dataValues.lng,
            //                                 },
            //                                 orders: [dataOrderData],
            //                                 restaurantsId: restaurantData[0].dataValues.restaurant_id,
            //                                 restaurantsName:
            //                                     restaurantData[0].dataValues.name_primary,
            //                                 status: "offline",
            //                             });
            //                     }
            //                 });
            //                 dataRestaurant.push({
            //                     order_sum: data.order_sum,
            //                     order_date: currentTime,
            //                     address: data.address,
            //                     address_detail: data.address_detail,
            //                     iCabRequestId: result.dataValues.iCabRequestId,
            //                     restaurant_id: data.restaurant_id,
            //                     message: data.message,
            //                 });
            //             });
            //             // console.log(dataRestaurant)
            //             await orders.bulkCreate(dataRestaurant);
            //             //find driver near area and update in orders collection
            //             const cities = db.collection("drivertrigger");
            //             const center = geo.point(
            //                 parseFloat(query.latitude),
            //                 parseFloat(query.longitude)
            //             );
            //             const radius = 15;
            //             const field = "position";
            //             const driver = geo
            //                 .query(cities)
            //                 .within(center, radius, field)
            //                 .subscribe(async (snap) => {
            //                     const map1 = snap.map(({ id }) => parseInt(id));
            //                     const found = snap.find(
            //                         (element) =>
            //                             element.auto == "true" &&
            //                             element.status == 0 &&
            //                             element.autoJob == 0
            //                     );
            //                     console.log(found);
            //                     await db
            //                         .collection("eatorders")
            //                         .doc(`${transactionIdData}`)
            //                         .get()
            //                         .then(async (docRef) => {
            //                             console.log(docRef.data().driverOnJob);
            //                             // return docRef.data().driverOnJob
            //                             if (docRef.data().driverOnJob.length == 0) {
            //                                 if (found) {
            //                                     console.log(found);
            //                                     await db
            //                                         .collection("eatorders")
            //                                         .doc(`${transactionIdData}`)
            //                                         .update({
            //                                             iDriverId: found.id,
            //                                         });
            //                                     await db
            //                                         .collection("drivertrigger")
            //                                         .doc(`${found.id}`)
            //                                         .update({
            //                                             autoJob: 1,
            //                                         });
            //                                 }
            //                             } else {
            //                                 console.log("No such document!");
            //                                 db.collection("restaurantsonline")
            //                                     .doc(`${data.restaurant_id}`)
            //                                     .set({
            //                                         address: restaurantData[0].dataValues.address,
            //                                         address_detail: restaurantData[0].dataValues.address,
            //                                         datetime: currentTime,
            //                                         isMember: Boolean(
            //                                             restaurantData[0].dataValues.isMember
            //                                         ),
            //                                         location: {
            //                                             lat: restaurantData[0].dataValues.lat,
            //                                             lng: restaurantData[0].dataValues.lng,
            //                                         },
            //                                         orders: dataOrderData,
            //                                         restaurantsId:
            //                                             restaurantData[0].dataValues.restaurant_id,
            //                                         restaurantsName:
            //                                             restaurantData[0].dataValues.name_primary,
            //                                         status: "offline",
            //                                         // statusCooking: "2",
            //                                         // tel: "0988888888"
            //                                     });
            //                             }
            //                         })
            //                         .catch((error) => { });

            //                     db.collection("eatorders")
            //                         .doc(`${transactionIdData}`)
            //                         .update({
            //                             driverOnJob: map1,
            //                         });
            //                 });
            //             ctx.body = {
            //                 status: 200,
            //                 message: "orders success",
            //                 orderId: transactionIdData,
            //             };
            //         } else if (
            //             (currentTimeString > restaurantData[0].dataValues.tWedStartTime &&
            //                 currentTimeString > restaurantData[0].dataValues.tWedEndTime) ||
            //             currentTimeString < restaurantData[0].dataValues.tWedStartTime
            //         ) {
            //             ctx.body = {
            //                 status: false,
            //                 details: [
            //                     {
            //                         restaurant_id: dataOrder[0].restaurant_id,
            //                         restaurant_name: dataOrder[0].name_primary,
            //                         open: 0,
            //                         lat: restaurantData[0].dataValues.lat,
            //                         lng: restaurantData[0].dataValues.lng,
            //                     },
            //                 ],
            //             };
            //         }
            //     }
            //     //Thurday
            //     else if (day == 4) {
            //         if (
            //             currentTimeString > restaurantData[0].dataValues.tThuStartTime &&
            //             currentTimeString < restaurantData[0].dataValues.tThuEndTime
            //         ) {
            //             const firestoreData = [];
            //             dataOrder.map((element, index) => {
            //                 restaurantData.map((element1, index1) => {
            //                     const name = dataOrder.find(
            //                         ({ restaurant_id }) => restaurant_id === element.restaurant_id
            //                     );
            //                     if (element.restaurant_id == element1.restaurant_id) {
            //                         let a = Boolean(element1.isMember);
            //                         const newObj = {
            //                             ...element,
            //                             restaurant_name: element1.name_primary,
            //                             restaurant_id: element1.restaurant_id,
            //                             isMember: a,
            //                             viewOrders: "0"
            //                         };
            //                         firestoreData.push(newObj);
            //                     }
            //                 });
            //             });
            //             const position = geo.point(
            //                 parseFloat(dataOrder[0].location.lat),
            //                 parseFloat(dataOrder[0].location.lng)
            //             );

            //             const transactionIdData = 'EAT' + query.userId + '-' + '01' + '-' + moment().unix() + '-' + maxNumber

            //             const userData = {
            //                 iUserId: query.userId,
            //                 vSenderName: query.sender,
            //                 vSenderMobile: query.senderMobile,
            //                 tDestAddress: query.userAddress,
            //                 vSourceLatitude: query.latitude,
            //                 vSourceLongtitude: query.longitude,
            //                 vSenderDeliveryIns: query.vSenderDeliveryIns,
            //                 deliveryFee: query.deliveryFee,
            //                 orderSum: query.total,
            //                 eType: "Eat",
            //                 eStatus: "Requesting",
            //                 ePayType: query.paymentMethod,
            //                 iDriverId: 0,
            //                 message: query.message,
            //                 deliveryFee: query.deliveryFee,
            //                 type: query.type,
            //                 ordersStatus: "0",
            //                 position,
            //                 driver: {
            //                     driverId: null,
            //                     name: null,
            //                     mobile: null,
            //                     image: null,
            //                     rating: null,
            //                 },
            //                 driverOnJob: [],
            //                 orderDate: currentTime,
            //                 ordersData: query.orders,
            //                 deliveryPrice: 0,
            //                 transactionId: transactionIdData
            //             };
            //             // console.log(firestoreData);
            //             const result = await activities.create(userData);

            //             await runningNumber.update({
            //                 runningNumber: maxData,
            //             },
            //                 {
            //                     where: {
            //                         type: 'EAT'
            //                     }
            //                 })

            //             await db
            //                 .collection("eatorders")
            //                 .doc(`${transactionIdData}`)
            //                 .set({
            //                     paymentInfo: payment,
            //                     iUserId: query.userId,
            //                     vSenderName: query.sender,
            //                     vSenderMobile: query.senderMobile,
            //                     tDestAddress: query.userAddress,
            //                     vSourceLatitude: query.latitude,
            //                     vSourceLongtitude: query.longitude,
            //                     vSenderDeliveryIns: query.vSenderDeliveryIns,
            //                     orderSum: query.total,
            //                     paymentInfo: payment,
            //                     eType: "Eat",
            //                     eStatus: "Requesting",
            //                     ePayType: query.paymentMethod,
            //                     discountHub: "",
            //                     iDriverId: 0,
            //                     message: query.message,
            //                     deliveryFee: query.deliveryFee,
            //                     type: query.type,
            //                     ordersStatus: "0",
            //                     position,
            //                     driver: {
            //                         driverId: null,
            //                         name: null,
            //                         mobile: null,
            //                         image: null,
            //                         rating: null,
            //                     },
            //                     driverOnJob: [],
            //                     orderDate: currentTime,
            //                     ordersData: firestoreData,
            //                     getFoodImage: "",
            //                     receiveFoodImage: "",
            //                 });
            //             //restaurantonline
            //             const orderbyrestaurant = dataOrder.filter(function (order) {
            //                 return order.restaurant_id == dataOrder[0].restaurant_id;
            //             });
            //             console.log(orderbyrestaurant);
            //             const dataOrderData = {

            //                 vSenderName: query.sender,
            //                 vSenderMobile: query.senderMobile,
            //                 tDestAddress: query.userAddress,
            //                 vSourceLatitude: query.latitude,
            //                 vSourceLongtitude: query.longitude,
            //                 paymentMethod: query.paymentMethod,
            //                 message: orderbyrestaurant[0].message,
            //                 orderId: result.dataValues.iCabRequestId,
            //                 order_sum: orderbyrestaurant[0].order_sum,
            //                 orderdetails: orderbyrestaurant[0].orderdetails,
            //                 statusCooking: 0,
            //                 viewOrders: "0"
            //             };
            //             await dataOrder.forEach(async function (data) {
            //                 var docRef = db
            //                     .collection("restaurantsonline")
            //                     .doc(`${data.restaurant_id}`);
            //                 docRef.get().then((doc) => {
            //                     if (doc.exists) {
            //                         let orderTotal = doc.data().orders;
            //                         // console.log("Document data:", doc.data());
            //                         // console.log(doc.data().status);
            //                         db.collection("restaurantsonline")
            //                             .doc(`${data.restaurant_id}`)
            //                             .update({
            //                                 orders: orderTotal.concat([dataOrderData]),
            //                             });
            //                         if (doc.data().status == "offline") {
            //                             const noticeData = {
            //                                 message: {
            //                                     // 'topic': `${data.restaurant_id}`,
            //                                     topic: "all",
            //                                     notification: {
            //                                         // 'title': `${result.dataValues.iCabRequestId}`,
            //                                         title: "Hub Merchant App",
            //                                         body: "ORDER จาก" + query.sender + "",
            //                                     },
            //                                 },
            //                             };
            //                             sendFcmMessage(noticeData);
            //                         }
            //                     } else {
            //                         console.log("No such document!");
            //                         db.collection("restaurantsonline")
            //                             .doc(`${data.restaurant_id}`)
            //                             .set({
            //                                 address: restaurantData[0].dataValues.address,
            //                                 address_detail: restaurantData[0].dataValues.address,
            //                                 datetime: currentTime,
            //                                 isMember: Boolean(restaurantData[0].dataValues.isMember),
            //                                 viewOrders: "0",
            //                                 location: {
            //                                     lat: restaurantData[0].dataValues.lat,
            //                                     lng: restaurantData[0].dataValues.lng,
            //                                 },
            //                                 orders: [dataOrderData],
            //                                 restaurantsId: restaurantData[0].dataValues.restaurant_id,
            //                                 restaurantsName:
            //                                     restaurantData[0].dataValues.name_primary,
            //                                 status: "offline",
            //                             });
            //                     }
            //                 });
            //                 dataRestaurant.push({
            //                     order_sum: data.order_sum,
            //                     order_date: currentTime,
            //                     address: data.address,
            //                     address_detail: data.address_detail,
            //                     iCabRequestId: result.dataValues.iCabRequestId,
            //                     restaurant_id: data.restaurant_id,
            //                     message: data.message,
            //                 });
            //             });
            //             // console.log(dataRestaurant)
            //             await orders.bulkCreate(dataRestaurant);
            //             // return
            //             //find driver near area and update in orders collection
            //             const cities = db.collection("drivertrigger");
            //             const center = geo.point(
            //                 parseFloat(query.latitude),
            //                 parseFloat(query.longitude)
            //             );
            //             const radius = 15;
            //             const field = "position";
            //             const driver = geo
            //                 .query(cities)
            //                 .within(center, radius, field)
            //                 .subscribe(async (snap) => {
            //                     const map1 = snap.map(({ id }) => parseInt(id));
            //                     const found = snap.find(
            //                         (element) =>
            //                             element.auto == "true" &&
            //                             element.status == 0 &&
            //                             element.autoJob == 0
            //                     );
            //                     console.log(found);
            //                     await db
            //                         .collection("eatorders")
            //                         .doc(`${transactionIdData}`)
            //                         .get()
            //                         .then(async (docRef) => {
            //                             console.log(docRef.data().driverOnJob);
            //                             // return docRef.data().driverOnJob
            //                             if (docRef.data().driverOnJob.length == 0) {
            //                                 if (found) {
            //                                     console.log(found);
            //                                     await db
            //                                         .collection("eatorders")
            //                                         .doc(`${transactionIdData}`)
            //                                         .update({
            //                                             iDriverId: found.id,
            //                                         });

            //                                     await db
            //                                         .collection("drivertrigger")
            //                                         .doc(`${found.id}`)
            //                                         .update({
            //                                             autoJob: 1,
            //                                         });
            //                                 }
            //                             } else {
            //                                 console.log("No such document!");
            //                                 db.collection("restaurantsonline")
            //                                     .doc(`${data.restaurant_id}`)
            //                                     .set({
            //                                         address: restaurantData[0].dataValues.address,
            //                                         address_detail: restaurantData[0].dataValues.address,
            //                                         datetime: currentTime,
            //                                         isMember: Boolean(
            //                                             restaurantData[0].dataValues.isMember
            //                                         ),
            //                                         location: {
            //                                             lat: restaurantData[0].dataValues.lat,
            //                                             lng: restaurantData[0].dataValues.lng,
            //                                         },
            //                                         orders: dataOrderData,
            //                                         restaurantsId:
            //                                             restaurantData[0].dataValues.restaurant_id,
            //                                         restaurantsName:
            //                                             restaurantData[0].dataValues.name_primary,
            //                                         status: "offline",
            //                                         // statusCooking: "2",
            //                                         // tel: "0988888888"
            //                                     });
            //                             }
            //                         })
            //                         .catch((error) => { });

            //                     db.collection("eatorders")
            //                         .doc(`${transactionIdData}`)
            //                         .update({
            //                             driverOnJob: map1,
            //                         });
            //                 });
            //             ctx.body = {
            //                 message: "orders success",
            //                 orderId: transactionIdData,
            //             };
            //         } else if (
            //             (currentTimeString > restaurantData[0].dataValues.tThuStartTime &&
            //                 currentTimeString > restaurantData[0].dataValues.tThuEndTime) ||
            //             currentTimeString < restaurantData[0].dataValues.tThuStartTime
            //         ) {
            //             ctx.body = {
            //                 status: false,
            //                 details: [
            //                     {
            //                         restaurant_id: dataOrder[0].restaurant_id,
            //                         restaurant_name: dataOrder[0].name_primary,
            //                         open: 0,
            //                         lat: restaurantData[0].dataValues.lat,
            //                         lng: restaurantData[0].dataValues.lng,
            //                     },
            //                 ],
            //             };
            //         }
            //     }
            //     //Friday
            //     else if (day == 5) {
            //         if (
            //             (currentTimeString > restaurantData[0].dataValues.tFriStartTime &&
            //                 currentTimeString < restaurantData[0].dataValues.tFriEndTime) ||
            //             currentTimeString < restaurantData[0].dataValues.tFriStartTime
            //         ) {
            //             const firestoreData = [];
            //             dataOrder.map((element, index) => {
            //                 restaurantData.map((element1, index1) => {
            //                     const name = dataOrder.find(
            //                         ({ restaurant_id }) => restaurant_id === element.restaurant_id
            //                     );
            //                     if (element.restaurant_id == element1.restaurant_id) {
            //                         let a = Boolean(element1.isMember);
            //                         const newObj = {
            //                             ...element,
            //                             restaurant_name: element1.name_primary,
            //                             restaurant_id: element1.restaurant_id,
            //                             isMember: a,

            //                         };
            //                         firestoreData.push(newObj);
            //                     }
            //                 });
            //             });
            //             const position = geo.point(
            //                 parseFloat(dataOrder[0].location.lat),
            //                 parseFloat(dataOrder[0].location.lng)
            //             );
            //             const userData = {
            //                 iUserId: query.userId,
            //                 vSenderName: query.sender,
            //                 vSenderMobile: query.senderMobile,
            //                 tDestAddress: query.userAddress,
            //                 vSourceLatitude: query.latitude,
            //                 vSourceLongtitude: query.longitude,
            //                 vSenderDeliveryIns: query.vSenderDeliveryIns,
            //                 deliveryFee: query.deliveryFee,
            //                 orderSum: query.total,
            //                 eType: "Eat",
            //                 eStatus: "Requesting",
            //                 ePayType: query.paymentMethod,
            //                 iDriverId: 0,
            //                 message: query.message,
            //                 deliveryFee: query.deliveryFee,
            //                 type: query.type,
            //                 ordersStatus: "0",
            //                 position,
            //                 driver: {
            //                     driverId: null,
            //                     name: null,
            //                     mobile: null,
            //                     image: null,
            //                     rating: null,
            //                 },
            //                 driverOnJob: [],
            //                 orderDate: currentTime,
            //                 ordersData: query.orders,
            //                 deliveryPrice: 0,
            //                 transactionId: 'EAT' + query.userId + '-' + '01' + '-' + moment().unix() + '-' + maxNumber
            //             };


            //             const transactionIdData = 'EAT' + query.userId + '-' + '01' + '-' + moment().unix() + '-' + maxNumber
            //             // console.log(firestoreData);
            //             const result = await activities.create(userData);

            //             await runningNumber.update({
            //                 runningNumber: maxData,
            //             },
            //                 {
            //                     where: {
            //                         type: 'EAT'
            //                     }
            //                 })

            //             await db
            //                 .collection("eatorders")
            //                 .doc(`${transactionIdData}`)
            //                 .set({
            //                     paymentInfo: payment,
            //                     iUserId: query.userId,
            //                     vSenderName: query.sender,
            //                     vSenderMobile: query.senderMobile,
            //                     tDestAddress: query.userAddress,
            //                     vSourceLatitude: query.latitude,
            //                     vSourceLongtitude: query.longitude,
            //                     vSenderDeliveryIns: query.vSenderDeliveryIns,
            //                     orderSum: query.total,
            //                     paymentInfo: payment,
            //                     eType: "Eat",
            //                     eStatus: "Requesting",
            //                     ePayType: query.paymentMethod,
            //                     discountHub: "",
            //                     iDriverId: 0,
            //                     message: query.message,
            //                     deliveryFee: query.deliveryFee,
            //                     type: query.type,
            //                     ordersStatus: "0",
            //                     position,
            //                     driver: {
            //                         driverId: null,
            //                         name: null,
            //                         mobile: null,
            //                         image: null,
            //                         rating: null,
            //                     },
            //                     driverOnJob: [],
            //                     orderDate: currentTime,
            //                     ordersData: firestoreData,
            //                     getFoodImage: "",
            //                     receiveFoodImage: "",
            //                 });
            //             //restaurantonline
            //             const orderbyrestaurant = dataOrder.filter(function (order) {
            //                 return order.restaurant_id == dataOrder[0].restaurant_id;
            //             });
            //             // console.log(orderbyrestaurant)
            //             const dataOrderData = {
            //                 vSenderName: query.sender,
            //                 vSenderMobile: query.senderMobile,
            //                 tDestAddress: query.userAddress,
            //                 vSourceLatitude: query.latitude,
            //                 vSourceLongtitude: query.longitude,
            //                 paymentMethod: query.paymentMethod,
            //                 message: orderbyrestaurant[0].message,
            //                 orderId: result.dataValues.iCabRequestId,
            //                 order_sum: orderbyrestaurant[0].order_sum,
            //                 orderdetails: orderbyrestaurant[0].orderdetails,
            //                 statusCooking: 0,
            //                 viewOrders: "0"
            //             };
            //             await dataOrder.forEach(async function (data) {
            //                 var docRef = db
            //                     .collection("restaurantsonline")
            //                     .doc(`${data.restaurant_id}`);
            //                 docRef.get().then((doc) => {
            //                     if (doc.exists) {

            //                         let orderTotal = doc.data().orders;
            //                         // console.log("Document data:", doc.data());
            //                         db.collection("restaurantsonline")
            //                             .doc(`${data.restaurant_id}`)
            //                             .update({
            //                                 orders: orderTotal.concat([dataOrderData]),
            //                             });
            //                         const noticeData = {
            //                             message: {
            //                                 // 'topic': `${data.restaurant_id}`,
            //                                 topic: "all",
            //                                 notification: {
            //                                     // 'title': `${result.dataValues.iCabRequestId}`,
            //                                     title: "Hub Merchant App",
            //                                     body: "ORDER จาก" + query.sender + "",
            //                                 },
            //                             },
            //                         };
            //                         sendFcmMessage(noticeData);
            //                     } else {
            //                         console.log("No such document!");
            //                         db.collection("restaurantsonline")
            //                             .doc(`${data.restaurant_id}`)
            //                             .set({
            //                                 address: restaurantData[0].dataValues.address,
            //                                 address_detail: restaurantData[0].dataValues.address,
            //                                 datetime: currentTime,
            //                                 isMember: Boolean(restaurantData[0].dataValues.isMember),
            //                                 location: {
            //                                     lat: restaurantData[0].dataValues.lat,
            //                                     lng: restaurantData[0].dataValues.lng,
            //                                 },
            //                                 orders: [dataOrderData],
            //                                 restaurantsId: restaurantData[0].dataValues.restaurant_id,
            //                                 restaurantsName:
            //                                     restaurantData[0].dataValues.name_primary,
            //                                 status: "offline",
            //                                 // statusCooking: "2",
            //                                 // tel: "0988888888"
            //                             });
            //                     }
            //                 });

            //                 dataRestaurant.push({
            //                     order_sum: data.order_sum,
            //                     order_date: currentTime,
            //                     address: data.address,
            //                     address_detail: data.address_detail,
            //                     iCabRequestId: result.dataValues.iCabRequestId,
            //                     restaurant_id: data.restaurant_id,
            //                     message: data.message,
            //                 });
            //             });
            //             // console.log(dataRestaurant)
            //             await orders.bulkCreate(dataRestaurant);
            //             //find driver near area and update in orders collection
            //             const cities = db.collection("drivertrigger");
            //             const center = geo.point(
            //                 parseFloat(query.latitude),
            //                 parseFloat(query.longitude)
            //             );
            //             const radius = 15;
            //             const field = "position";
            //             const driver = geo
            //                 .query(cities)
            //                 .within(center, radius, field)
            //                 .subscribe(async (snap) => {
            //                     const map1 = snap.map(({ id }) => parseInt(id));
            //                     const found = snap.find(
            //                         (element) =>
            //                             element.auto == "true" &&
            //                             element.status == 0 &&
            //                             element.autoJob == 0
            //                     );
            //                     console.log(found);
            //                     await db
            //                         .collection("eatorders")
            //                         .doc(`${result.dataValues.iCabRequestId}`)
            //                         .get()
            //                         .then(async (docRef) => {
            //                             console.log(docRef.data().driverOnJob);
            //                             // return docRef.data().driverOnJob
            //                             if (docRef.data().driverOnJob.length == 0) {
            //                                 if (found) {
            //                                     console.log(found);
            //                                     await db
            //                                         .collection("eatorders")
            //                                         .doc(`${result.dataValues.iCabRequestId}`)
            //                                         .update({
            //                                             iDriverId: found.id,
            //                                         });

            //                                     await db
            //                                         .collection("drivertrigger")
            //                                         .doc(`${found.id}`)
            //                                         .update({
            //                                             autoJob: 1,
            //                                         });
            //                                 }
            //                             } else {
            //                             }
            //                         })
            //                         .catch((error) => { });

            //                     db.collection("eatorders")
            //                         .doc(`${result.dataValues.iCabRequestId}`)
            //                         .update({
            //                             driverOnJob: map1,
            //                         });
            //                 });
            //             ctx.body = {
            //                 message: "orders success",
            //                 orderId: transactionIdData,
            //             };
            //         } else if (
            //             (currentTimeString > restaurantData[0].dataValues.tFriStartTime &&
            //                 currentTimeString > restaurantData[0].dataValues.tFriEndTime) ||
            //             currentTimeString < restaurantData[0].dataValues.tFriStartTime
            //         ) {
            //             ctx.body = {
            //                 status: false,
            //                 details: [
            //                     {
            //                         restaurant_id: dataOrder[0].restaurant_id,
            //                         restaurant_name: dataOrder[0].name_primary,
            //                         open: 0,
            //                         lat: restaurantData[0].dataValues.lat,
            //                         lng: restaurantData[0].dataValues.lng,
            //                     },
            //                 ],
            //             };
            //         }
            //     }
            //     //Saturday
            //     else if (day == 6) {
            //         if (
            //             currentTimeString > restaurantData[0].dataValues.tSatStartTime &&
            //             currentTimeString < restaurantData[0].dataValues.tSatEndTime
            //         ) {
            //             const firestoreData = [];
            //             dataOrder.map((element, index) => {
            //                 restaurantData.map((element1, index1) => {
            //                     const name = dataOrder.find(
            //                         ({ restaurant_id }) => restaurant_id === element.restaurant_id
            //                     );
            //                     if (element.restaurant_id == element1.restaurant_id) {
            //                         let a = Boolean(element1.isMember);
            //                         const newObj = {
            //                             ...element,
            //                             restaurant_name: element1.name_primary,
            //                             restaurant_id: element1.restaurant_id,
            //                             isMember: a,

            //                         };
            //                         firestoreData.push(newObj);
            //                     }
            //                 });
            //             });
            //             const position = geo.point(
            //                 parseFloat(dataOrder[0].location.lat),
            //                 parseFloat(dataOrder[0].location.lng)
            //             );
            //             const userData = {
            //                 iUserId: query.userId,
            //                 vSenderName: query.sender,
            //                 vSenderMobile: query.senderMobile,
            //                 tDestAddress: query.userAddress,
            //                 vSourceLatitude: query.latitude,
            //                 vSourceLongtitude: query.longitude,
            //                 vSenderDeliveryIns: query.vSenderDeliveryIns,
            //                 deliveryFee: query.deliveryFee,
            //                 orderSum: query.total,
            //                 eType: "Eat",
            //                 eStatus: "Requesting",
            //                 ePayType: query.paymentMethod,
            //                 iDriverId: 0,
            //                 message: query.message,
            //                 deliveryFee: query.deliveryFee,
            //                 type: query.type,
            //                 ordersStatus: "0",
            //                 position,
            //                 driver: {
            //                     driverId: null,
            //                     name: null,
            //                     mobile: null,
            //                     image: null,
            //                     rating: null,
            //                 },
            //                 driverOnJob: [],
            //                 orderDate: currentTime,
            //                 ordersData: query.orders,
            //                 deliveryPrice: 0,
            //                 transactionId: 'EAT' + query.userId + '-' + '01' + '-' + moment().unix() + '-' + maxNumber
            //             };
            //             const transactionIdData = 'EAT' + query.userId + '-' + '01' + '-' + moment().unix() + '-' + maxNumber
            //             // console.log(firestoreData);
            //             const result = await activities.create(userData);

            //             await runningNumber.update({
            //                 runningNumber: maxData,
            //             },
            //                 {
            //                     where: {
            //                         type: 'EAT'
            //                     }
            //                 })

            //             await db
            //                 .collection("eatorders")
            //                 .doc(`${transactionIdData}`)
            //                 .set({
            //                     paymentInfo: payment,
            //                     iUserId: query.userId,
            //                     vSenderName: query.sender,
            //                     vSenderMobile: query.senderMobile,
            //                     tDestAddress: query.userAddress,
            //                     vSourceLatitude: query.latitude,
            //                     vSourceLongtitude: query.longitude,
            //                     vSenderDeliveryIns: query.vSenderDeliveryIns,
            //                     orderSum: query.total,
            //                     paymentInfo: payment,
            //                     eType: "Eat",
            //                     eStatus: "Requesting",
            //                     ePayType: query.paymentMethod,
            //                     discountHub: "",
            //                     iDriverId: 0,
            //                     message: query.message,
            //                     deliveryFee: query.deliveryFee,
            //                     type: query.type,
            //                     ordersStatus: "0",
            //                     position,
            //                     driver: {
            //                         driverId: null,
            //                         name: null,
            //                         mobile: null,
            //                         image: null,
            //                         rating: null,
            //                     },
            //                     driverOnJob: [],
            //                     orderDate: currentTime,
            //                     ordersData: firestoreData,
            //                     getFoodImage: "",
            //                     receiveFoodImage: "",
            //                 });

            //             //restaurantonline
            //             const orderbyrestaurant = dataOrder.filter(function (order) {
            //                 return order.restaurant_id == dataOrder[0].restaurant_id;
            //             });
            //             // console.log(orderbyrestaurant);
            //             const dataOrderData = {
            //                 vSenderName: query.sender,
            //                 vSenderMobile: query.senderMobile,
            //                 tDestAddress: query.userAddress,
            //                 vSourceLatitude: query.latitude,
            //                 vSourceLongtitude: query.longitude,
            //                 paymentMethod: query.paymentMethod,
            //                 message: orderbyrestaurant[0].message,
            //                 orderId: result.dataValues.iCabRequestId,
            //                 order_sum: orderbyrestaurant[0].order_sum,
            //                 orderdetails: orderbyrestaurant[0].orderdetails,
            //                 statusCooking: 0,
            //                 viewOrders: "0"
            //             };

            //             await dataOrder.forEach(async function (data) {
            //                 var docRef = db
            //                     .collection("restaurantsonline")
            //                     .doc(`${data.restaurant_id}`);
            //                 docRef.get().then((doc) => {
            //                     if (doc.exists) {
            //                         let orderTotal = doc.data().orders;
            //                         // console.log("Document data:", doc.data());
            //                         db.collection("restaurantsonline")
            //                             .doc(`${data.restaurant_id}`)
            //                             .update({
            //                                 orders: orderTotal.concat([dataOrderData]),
            //                             });
            //                         if (doc.data().status == "offline") {
            //                             const noticeData = {
            //                                 message: {
            //                                     // 'topic': `${data.restaurant_id}`,
            //                                     topic: "all",
            //                                     notification: {
            //                                         // 'title': `${result.dataValues.iCabRequestId}`,
            //                                         title: "Hub Merchant App",
            //                                         body: "ORDER จาก" + query.sender + "",
            //                                     },
            //                                 },
            //                             };
            //                             sendFcmMessage(noticeData);
            //                         }
            //                     } else {
            //                         console.log("No such document!");
            //                         db.collection("restaurantsonline")
            //                             .doc(`${data.restaurant_id}`)
            //                             .set({
            //                                 address: restaurantData[0].dataValues.address,
            //                                 address_detail: restaurantData[0].dataValues.address,
            //                                 datetime: currentTime,
            //                                 isMember: Boolean(restaurantData[0].dataValues.isMember),
            //                                 viewOrders: "0",
            //                                 location: {
            //                                     lat: restaurantData[0].dataValues.lat,
            //                                     lng: restaurantData[0].dataValues.lng,
            //                                 },
            //                                 orders: [dataOrderData],
            //                                 restaurantsId: restaurantData[0].dataValues.restaurant_id,
            //                                 restaurantsName:
            //                                     restaurantData[0].dataValues.name_primary,
            //                                 status: "offline",
            //                             });
            //                     }
            //                 });
            //                 dataRestaurant.push({
            //                     order_sum: data.order_sum,
            //                     order_date: currentTimeString,
            //                     address: data.address,
            //                     address_detail: data.address_detail,
            //                     iCabRequestId: result.dataValues.iCabRequestId,
            //                     restaurant_id: data.restaurant_id,
            //                     message: data.message,
            //                 });
            //             });
            //             // console.log(dataRestaurant)
            //             await orders.bulkCreate(dataRestaurant);
            //             // return
            //             //find driver near area and update in orders collection
            //             const cities = db.collection("drivertrigger");
            //             const center = geo.point(
            //                 parseFloat(query.latitude),
            //                 parseFloat(query.longitude)
            //             );
            //             const radius = 15;
            //             const field = "position";
            //             const driver = geo
            //                 .query(cities)
            //                 .within(center, radius, field)
            //                 .subscribe(async (snap) => {
            //                     const map1 = snap.map(({ id }) => parseInt(id));
            //                     const found = snap.find(
            //                         (element) =>
            //                             element.auto == "true" &&
            //                             element.status == 0 &&
            //                             element.autoJob == 0
            //                     );
            //                     console.log(found);
            //                     await db
            //                         .collection("eatorders")
            //                         .doc(`${transactionIdData}`)
            //                         .get()
            //                         .then(async (docRef) => {
            //                             console.log(docRef.data().driverOnJob);
            //                             // return docRef.data().driverOnJob
            //                             if (docRef.data().driverOnJob.length == 0) {
            //                                 if (found) {
            //                                     console.log(found);
            //                                     await db
            //                                         .collection("eatorders")
            //                                         .doc(`${transactionIdData}`)
            //                                         .update({
            //                                             iDriverId: found.id,
            //                                         });

            //                                     await db
            //                                         .collection("drivertrigger")
            //                                         .doc(`${found.id}`)
            //                                         .update({
            //                                             autoJob: 1,
            //                                         });
            //                                 }
            //                             } else {
            //                             }
            //                         })
            //                         .catch((error) => { });
            //                     db.collection("eatorders")
            //                         .doc(`${transactionIdData}`)
            //                         .update({
            //                             driverOnJob: map1,
            //                         });
            //                 });
            //             ctx.body = {
            //                 message: "orders success",
            //                 orderId: transactionIdData,
            //             };
            //         } else if (
            //             (currentTimeString > restaurantData[0].dataValues.tSatStartTime &&
            //                 currentTimeString > restaurantData[0].dataValues.tSatEndTime) ||
            //             currentTimeString < restaurantData[0].dataValues.tSatStartTime
            //         ) {
            //             ctx.body = {
            //                 status: false,
            //                 details: [
            //                     {
            //                         restaurant_id: dataOrder[0].restaurant_id,
            //                         restaurant_name: dataOrder[0].name_primary,
            //                         open: 0,
            //                         lat: restaurantData[0].dataValues.lat,
            //                         lng: restaurantData[0].dataValues.lng,
            //                     },
            //                 ],
            //             };
            //         }
            //     }
            //     //Sunday
            //     else if (day == 7) {
            //         if (
            //             currentTimeString > restaurantData[0].dataValues.tSunStartTime &&
            //             currentTimeString < restaurantData[0].dataValues.tSunEndTime
            //         ) {
            //             const firestoreData = [];
            //             dataOrder.map((element, index) => {
            //                 restaurantData.map((element1, index1) => {
            //                     const name = dataOrder.find(
            //                         ({ restaurant_id }) => restaurant_id === element.restaurant_id
            //                     );
            //                     if (element.restaurant_id == element1.restaurant_id) {
            //                         let a = Boolean(element1.isMember);
            //                         const newObj = {
            //                             ...element,
            //                             restaurant_name: element1.name_primary,
            //                             restaurant_id: element1.restaurant_id,
            //                             isMember: a,

            //                         };
            //                         firestoreData.push(newObj);
            //                     }
            //                 });
            //             });
            //             const position = geo.point(
            //                 parseFloat(dataOrder[0].location.lat),
            //                 parseFloat(dataOrder[0].location.lng)
            //             );
            //             const userData = {
            //                 iUserId: query.userId,
            //                 vSenderName: query.sender,
            //                 vSenderMobile: query.senderMobile,
            //                 tDestAddress: query.userAddress,
            //                 vSourceLatitude: query.latitude,
            //                 vSourceLongtitude: query.longitude,
            //                 vSenderDeliveryIns: query.vSenderDeliveryIns,
            //                 deliveryFee: query.deliveryFee,
            //                 orderSum: query.total,
            //                 eType: "Eat",
            //                 eStatus: "Requesting",
            //                 ePayType: query.paymentMethod,
            //                 iDriverId: 0,
            //                 message: query.message,
            //                 deliveryFee: query.deliveryFee,
            //                 type: query.type,
            //                 ordersStatus: "0",
            //                 position,
            //                 driver: {
            //                     driverId: null,
            //                     name: null,
            //                     mobile: null,
            //                     image: null,
            //                     rating: null,
            //                 },
            //                 driverOnJob: [],
            //                 orderDate: currentTime,
            //                 ordersData: query.orders,
            //                 deliveryPrice: 0,
            //                 transactionId: 'EAT' + query.userId + '-' + '01' + '-' + moment().unix() + '-' + maxNumber
            //             };


            //             const transactionIdData = 'EAT' + query.userId + '-' + '01' + '-' + moment().unix() + '-' + maxNumber

            //             // console.log(firestoreData);
            //             const result = await activities.create(userData);
            //             await runningNumber.update({
            //                 runningNumber: maxData,
            //             },
            //                 {
            //                     where: {
            //                         type: 'EAT'
            //                     }
            //                 })
            //             await db
            //                 .collection("eatorders")
            //                 .doc(`${transactionIdData}`)
            //                 .set({
            //                     paymentInfo: payment,
            //                     iUserId: query.userId,
            //                     vSenderName: query.sender,
            //                     vSenderMobile: query.senderMobile,
            //                     tDestAddress: query.userAddress,
            //                     vSourceLatitude: query.latitude,
            //                     vSourceLongtitude: query.longitude,
            //                     vSenderDeliveryIns: query.vSenderDeliveryIns,
            //                     orderSum: query.total,
            //                     paymentInfo: payment,
            //                     eType: "Eat",
            //                     eStatus: "Requesting",
            //                     ePayType: query.paymentMethod,
            //                     discountHub: "",
            //                     iDriverId: 0,
            //                     message: query.message,
            //                     deliveryFee: query.deliveryFee,
            //                     type: query.type,
            //                     ordersStatus: "0",
            //                     position,
            //                     driver: {
            //                         driverId: null,
            //                         name: null,
            //                         mobile: null,
            //                         image: null,
            //                         rating: null,
            //                     },
            //                     driverOnJob: [],
            //                     orderDate: currentTime,
            //                     ordersData: firestoreData,
            //                     getFoodImage: "",
            //                     receiveFoodImage: "",
            //                 });
            //             //restaurantonline
            //             const orderbyrestaurant = dataOrder.filter(function (order) {
            //                 return order.restaurant_id == dataOrder[0].restaurant_id;
            //             });
            //             console.log(orderbyrestaurant);
            //             const dataOrderData = {
            //                 vSenderName: query.sender,
            //                 vSenderMobile: query.senderMobile,
            //                 tDestAddress: query.userAddress,
            //                 vSourceLatitude: query.latitude,
            //                 vSourceLongtitude: query.longitude,
            //                 paymentMethod: query.paymentMethod,
            //                 message: orderbyrestaurant[0].message,
            //                 orderId: result.dataValues.iCabRequestId,
            //                 order_sum: orderbyrestaurant[0].order_sum,
            //                 orderdetails: orderbyrestaurant[0].orderdetails,
            //                 statusCooking: 0,
            //                 viewOrders: "0"
            //             };
            //             await dataOrder.forEach(async function (data) {
            //                 var docRef = db
            //                     .collection("restaurantsonline")
            //                     .doc(`${data.restaurant_id}`);
            //                 docRef.get().then((doc) => {
            //                     if (doc.exists) {
            //                         let orderTotal = doc.data().orders;
            //                         // console.log("Document data:", doc.data());
            //                         db.collection("restaurantsonline")
            //                             .doc(`${data.restaurant_id}`)
            //                             .update({
            //                                 orders: orderTotal.concat([dataOrderData]),
            //                             });
            //                         if (doc.data().status == "offline") {
            //                             const noticeData = {
            //                                 message: {
            //                                     // 'topic': `${data.restaurant_id}`,
            //                                     topic: "all",
            //                                     notification: {
            //                                         // 'title': `${result.dataValues.iCabRequestId}`,
            //                                         title: "Hub Merchant App",
            //                                         body: "ORDER จาก" + query.sender + "",
            //                                     },
            //                                 },
            //                             };
            //                             sendFcmMessage(noticeData);
            //                         }
            //                     } else {
            //                         console.log("No such document!");
            //                         db.collection("restaurantsonline")
            //                             .doc(`${data.restaurant_id}`)
            //                             .set({
            //                                 address: restaurantData[0].dataValues.address,
            //                                 address_detail: restaurantData[0].dataValues.address,
            //                                 datetime: currentTime,
            //                                 isMember: Boolean(restaurantData[0].dataValues.isMember),
            //                                 viewOrders: "0",
            //                                 location: {
            //                                     lat: restaurantData[0].dataValues.lat,
            //                                     lng: restaurantData[0].dataValues.lng,
            //                                 },
            //                                 orders: [dataOrderData],
            //                                 restaurantsId: restaurantData[0].dataValues.restaurant_id,
            //                                 restaurantsName:
            //                                     restaurantData[0].dataValues.name_primary,
            //                                 status: "offline",
            //                                 // statusCooking: "2",
            //                                 // tel: "0988888888"
            //                             });
            //                     }
            //                 });
            //                 dataRestaurant.push({
            //                     order_sum: data.order_sum,
            //                     order_date: currentTimeString,
            //                     address: data.address,
            //                     address_detail: data.address_detail,
            //                     iCabRequestId: result.dataValues.iCabRequestId,
            //                     restaurant_id: data.restaurant_id,
            //                     message: data.message,
            //                 });
            //             });
            //             // console.log(dataRestaurant)
            //             await orders.bulkCreate(dataRestaurant);
            //             // return
            //             //find driver near area and update in orders collection
            //             const cities = db.collection("drivertrigger");
            //             const center = geo.point(
            //                 parseFloat(query.latitude),
            //                 parseFloat(query.longitude)
            //             );
            //             const radius = 15;
            //             const field = "position";
            //             const driver = geo
            //                 .query(cities)
            //                 .within(center, radius, field)
            //                 .subscribe(async (snap) => {
            //                     const map1 = snap.map(({ id }) => parseInt(id));
            //                     const found = snap.find(
            //                         (element) =>
            //                             element.auto == "true" &&
            //                             element.status == 0 &&
            //                             element.autoJob == 0
            //                     );
            //                     console.log(found);
            //                     await db
            //                         .collection("eatorders")
            //                         .doc(`${transactionIdData}`)
            //                         .get()
            //                         .then(async (docRef) => {
            //                             console.log(docRef.data().driverOnJob);
            //                             // return docRef.data().driverOnJob
            //                             if (docRef.data().driverOnJob.length == 0) {
            //                                 if (found) {
            //                                     console.log(found);
            //                                     await db
            //                                         .collection("eatorders")
            //                                         .doc(`${transactionIdData}`)
            //                                         .update({
            //                                             iDriverId: found.id,
            //                                         });
            //                                     await db
            //                                         .collection("drivertrigger")
            //                                         .doc(`${found.id}`)
            //                                         .update({
            //                                             autoJob: 1,
            //                                         });
            //                                 }
            //                             } else {
            //                             }
            //                         })
            //                         .catch((error) => { });
            //                     db.collection("eatorders")
            //                         .doc(`${transactionIdData}`)
            //                         .update({
            //                             driverOnJob: map1,
            //                         });
            //                 });
            //             ctx.body = {
            //                 message: "orders success",
            //                 orderId: transactionIdData,
            //             };
            //         } else if (
            //             (currentTimeString > restaurantData[0].dataValues.tSunStartTime &&
            //                 currentTimeString > restaurantData[0].dataValues.tSunEndTime) ||
            //             currentTimeString < restaurantData[0].dataValues.tSunStartTime
            //         ) {
            //             ctx.body = {
            //                 status: false,
            //                 details: [
            //                     {
            //                         restaurant_id: dataOrder[0].restaurant_id,
            //                         restaurant_name: dataOrder[0].name_primary,
            //                         open: 0,
            //                         lat: restaurantData[0].dataValues.lat,
            //                         lng: restaurantData[0].dataValues.lng,
            //                     },
            //                 ],
            //             };
            //         }
            //     }
            // } else if (countOrder == 2) {
            //     const checkStatus = [];
            //     const checkOpen = [];
            //     let latLng = [];
            //     const name = dataOrder.map((x) => x.restaurant_id);
            //     const restaurantData = await restaurant.findAll({
            //         where: {
            //             restaurant_id: name,
            //         },
            //     });
            //     const resultDay = await restaurantData.map(async (element, index) => {
            //         if (day == 1) {
            //             console.log("xxx2");
            //             if (
            //                 currentTimeString > element.dataValues.tMonStartTime &&
            //                 currentTimeString < element.dataValues.tMonEndTime
            //             ) {
            //                 checkStatus.push(1);
            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 1,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             } else if (
            //                 (currentTimeString > element.dataValues.tMonStartTime &&
            //                     currentTimeString > element.dataValues.tMonEndTime) ||
            //                 currentTimeString < element.dataValues.tMonStartTime
            //             ) {
            //                 checkStatus.push(0);

            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 0,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             }
            //         } else if (day == 2) {
            //             // console.log("xxx2");
            //             if (
            //                 currentTimeString > element.dataValues.tTueStartTime &&
            //                 currentTimeString < element.dataValues.tTueEndTime
            //             ) {
            //                 checkStatus.push(1);
            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 1,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             } else if (
            //                 (currentTimeString > element.dataValues.tTueStartTime &&
            //                     currentTimeString > element.dataValues.tTueEndTime) ||
            //                 currentTimeString < element.dataValues.tTueStartTime
            //             ) {
            //                 checkStatus.push(0);
            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 0,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             }
            //         } else if (day == 3) {
            //             // console.log("xxx3");
            //             if (
            //                 currentTimeString > element.dataValues.tWedStartTime &&
            //                 currentTimeString < element.dataValues.tWedEndTime
            //             ) {
            //                 checkStatus.push(1);
            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 1,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             } else if (
            //                 (currentTimeString > element.dataValues.tWedStartTime &&
            //                     currentTimeString > element.dataValues.tWedEndTime) ||
            //                 currentTimeString < element.dataValues.tWedStartTime
            //             ) {
            //                 checkStatus.push(0);
            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 0,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             }
            //         } else if (day == 4) {
            //             console.log("xxx2");
            //             if (
            //                 currentTimeString > element.dataValues.tThuStartTime &&
            //                 currentTimeString < element.dataValues.tThuEndTime
            //             ) {
            //                 checkStatus.push(1);
            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 1,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             } else if (
            //                 (currentTimeString > element.dataValues.tThuStartTime &&
            //                     currentTimeString > element.dataValues.tThuEndTime) ||
            //                 currentTimeString < element.dataValues.tThuStartTime
            //             ) {
            //                 checkStatus.push(0);
            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 0,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             }
            //         } else if (day == 5) {
            //             console.log("xxx2");
            //             if (
            //                 currentTimeString > element.dataValues.tFriStartTime &&
            //                 currentTimeString < element.dataValues.tFriEndTime
            //             ) {
            //                 checkStatus.push(1);
            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 1,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             } else if (
            //                 (currentTimeString > element.dataValues.tFriStartTime &&
            //                     currentTimeString > element.dataValues.tFriEndTime) ||
            //                 currentTimeString < element.dataValues.tFriStartTime
            //             ) {
            //                 checkStatus.push(0);
            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 0,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             }
            //         } else if (day == 6) {
            //             console.log("xxx2");
            //             if (
            //                 currentTimeString > element.dataValues.tSatStartTime &&
            //                 currentTimeString < element.dataValues.tSatEndTime
            //             ) {
            //                 checkStatus.push(1);
            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 1,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             } else if (
            //                 (currentTimeString > element.dataValues.tSatStartTime &&
            //                     currentTimeString > element.dataValues.tSatEndTime) ||
            //                 currentTimeString < element.dataValues.tSatStartTime
            //             ) {
            //                 checkStatus.push(0);

            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 0,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             }
            //         } else if (day == 7) {
            //             console.log("xxx2");
            //             if (
            //                 currentTimeString > element.dataValues.tSunStartTime &&
            //                 currentTimeString < element.dataValues.tSunEndTime
            //             ) {
            //                 checkStatus.push(1);
            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 1,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             } else if (
            //                 (currentTimeString > element.dataValues.tSunStartTime &&
            //                     currentTimeString > element.dataValues.tSunEndTime) ||
            //                 currentTimeString < element.dataValues.tSunStartTime
            //             ) {
            //                 checkStatus.push(0);
            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 0,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             }
            //         }
            //     });

            //     const countData = await checkStatus.filter((x) => x == 1).length;
            //     console.log(countData);
            //     if (countData == 2) {
            //         const results = checkOpen.filter((obj) => {
            //             return obj.open === 1;
            //         });
            //         results.map((element, index) => {
            //             latLng.push([element.lng, element.lat]);
            //         });
            //         console.log(latLng);
            //         let destination = JSON.stringify({
            //             coordinates: latLng,
            //             units: "km",
            //         });
            //         const header = {
            //             Accept:
            //                 "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
            //             Authorization:
            //                 "5b3ce3597851110001cf624814d13839107e44dc8881bead9d61b803",
            //             "Content-Type": "application/json; charset=utf-8",
            //         };
            //         let routeData = await axios
            //             .post(
            //                 "https://api.openrouteservice.org/v2/directions/driving-car",
            //                 `${destination}`,
            //                 {
            //                     headers: header,
            //                 }
            //             )
            //             .then(function (response) {
            //                 return response;
            //             })
            //             .catch(function (error) {
            //                 console.log(error);
            //             });
            //         console.log(routeData.data.routes[0].summary.distance);
            //         //สองร้านอยู่ใกล้กันไม่เกิน 1 km
            //         // if (routeData.data.routes[0].summary.distance <= 1) {
            //         //firestore
            //         const transactionIdData = 'EAT' + query.userId + '-' + '02' + '-' + moment().unix() + '-' + maxNumber
            //         const firestoreData = [];
            //         dataOrder.map((element, index) => {
            //             restaurantData.map((element1, index1) => {
            //                 const name = dataOrder.find(
            //                     ({ restaurant_id }) => restaurant_id === element.restaurant_id
            //                 );
            //                 if (element.restaurant_id == element1.restaurant_id) {
            //                     let a = "";
            //                     element1.isMember == 1 ? (a = true) : (a = false);
            //                     const newObj = {
            //                         ...element,
            //                         restaurant_name: element1.name_primary,
            //                         restaurant_id: element1.restaurant_id,
            //                         isMember: a,

            //                     };
            //                     firestoreData.push(newObj);
            //                 }
            //             });
            //         });
            //         const position = geo.point(
            //             parseFloat(dataOrder[0].location.lat),
            //             parseFloat(dataOrder[0].location.lng)
            //         );
            //         const userData = {
            //             iUserId: query.userId,
            //             vSenderName: query.sender,
            //             vSenderMobile: query.senderMobile,
            //             tDestAddress: query.userAddress,
            //             vSourceLatitude: query.latitude,
            //             vSourceLongtitude: query.longitude,
            //             vSenderDeliveryIns: query.vSenderDeliveryIns,
            //             deliveryFee: query.deliveryFee,
            //             orderSum: query.total,
            //             eType: "Eat",
            //             eStatus: "Requesting",
            //             ePayType: query.paymentMethod,
            //             iDriverId: 0,
            //             message: query.message,
            //             deliveryFee: query.deliveryFee,
            //             type: query.type,
            //             ordersStatus: "0",
            //             position,
            //             driver: {
            //                 driverId: null,
            //                 name: null,
            //                 mobile: null,
            //                 image: null,
            //                 rating: null,
            //             },
            //             driverOnJob: [],
            //             orderDate: currentTime,
            //             ordersData: query.orders,
            //             deliveryPrice: 0,
            //             transactionId: transactionIdData
            //         };
            //         // console.log(firestoreData)
            //         const result = await activities.create(userData);
            //         await db
            //             .collection("eatorders")
            //             .doc(`${transactionIdData}`)
            //             .set({
            //                 iUserId: query.userId,
            //                 vSenderName: query.sender,
            //                 vSenderMobile: query.senderMobile,
            //                 tDestAddress: query.userAddress,
            //                 vSourceLatitude: query.latitude,
            //                 vSourceLongtitude: query.longitude,
            //                 vSenderDeliveryIns: query.vSenderDeliveryIns,
            //                 orderSum: query.total,
            //                 paymentInfo: payment,
            //                 eType: "Eat",
            //                 eStatus: "Requesting",
            //                 ePayType: query.paymentMethod,
            //                 discountHub: "",
            //                 iDriverId: 0,
            //                 message: query.message,
            //                 deliveryFee: query.deliveryFee,
            //                 type: query.type,
            //                 ordersStatus: "0",
            //                 position,
            //                 driver: {
            //                     driverId: null,
            //                     name: null,
            //                     mobile: null,
            //                     image: null,
            //                     rating: null,
            //                 },
            //                 driverOnJob: [],
            //                 orderDate: currentTime,
            //                 ordersData: firestoreData,
            //                 getFoodImage: "",
            //                 receiveFoodImage: "",
            //             });

            //         await dataOrder.forEach(async function (data) {
            //             //restaurantonline
            //             const orderbyrestaurant = dataOrder.filter(function (order) {
            //                 return order.restaurant_id == data.restaurant_id;
            //             });
            //             console.log(orderbyrestaurant);
            //             const dataOrderData = {
            //                 vSenderName: query.sender,
            //                 vSenderMobile: query.senderMobile,
            //                 tDestAddress: query.userAddress,
            //                 vSourceLatitude: query.latitude,
            //                 vSourceLongtitude: query.longitude,
            //                 paymentMethod: query.paymentMethod,
            //                 message: data.message,
            //                 orderId: result.dataValues.iCabRequestId,
            //                 order_sum: data.order_sum,
            //                 orderdetails: data.orderdetails,
            //                 statusCooking: 0,
            //                 viewOrders: "0"
            //             };
            //             var docRef = db
            //                 .collection("restaurantsonline")
            //                 .doc(`${data.restaurant_id}`);
            //             docRef.get().then((doc) => {
            //                 if (doc.exists) {
            //                     let orderTotal = doc.data().orders;
            //                     // console.log("Document data:", doc.data());
            //                     db.collection("restaurantsonline")
            //                         .doc(`${data.restaurant_id}`)
            //                         .update({
            //                             orders: orderTotal.concat([dataOrderData]),
            //                         });

            //                     if (doc.data().status == "offline") {
            //                         const noticeData = {
            //                             message: {
            //                                 // 'topic': `${data.restaurant_id}`,
            //                                 topic: "all",
            //                                 notification: {
            //                                     // 'title': `${result.dataValues.iCabRequestId}`,
            //                                     title: "Hub Merchant App",
            //                                     body: "ORDER จาก" + query.sender + "",
            //                                 },
            //                             },
            //                         };
            //                         sendFcmMessage(noticeData);
            //                     }
            //                 } else {
            //                     console.log("No such document!");
            //                     db.collection("restaurantsonline")
            //                         .doc(`${data.restaurant_id}`)
            //                         .set({
            //                             address: restaurantData[0].dataValues.address,
            //                             address_detail: restaurantData[0].dataValues.address,
            //                             datetime: currentTime,
            //                             isMember: Boolean(restaurantData[0].dataValues.isMember),
            //                             viewOrders: "0",
            //                             location: {
            //                                 lat: restaurantData[0].dataValues.lat,
            //                                 lng: restaurantData[0].dataValues.lng,
            //                             },
            //                             orders: [dataOrderData],
            //                             restaurantsId: restaurantData[0].dataValues.restaurant_id,
            //                             restaurantsName: restaurantData[0].dataValues.name_primary,
            //                             status: "offline",
            //                             // statusCooking: "2",
            //                             // tel: "0988888888"
            //                         });
            //                 }
            //             });

            //             dataRestaurant.push({
            //                 order_sum: data.order_sum,
            //                 order_date: currentTime,
            //                 address: data.address,
            //                 address_detail: data.address_detail,
            //                 iCabRequestId: result.dataValues.iCabRequestId,
            //                 restaurant_id: data.restaurant_id,
            //                 message: data.message,
            //             });
            //         });
            //         // console.log(dataRestaurant)
            //         await orders.bulkCreate(dataRestaurant);
            //         // return
            //         //find driver near area and update in orders collection
            //         const cities = db.collection("drivertrigger");
            //         const center = geo.point(
            //             parseFloat(query.latitude),
            //             parseFloat(query.longitude)
            //         );
            //         const radius = 15;
            //         const field = "position";
            //         const driver = geo
            //             .query(cities)
            //             .within(center, radius, field)
            //             .subscribe(async (snap) => {
            //                 const map1 = snap.map(({ id }) => parseInt(id));
            //                 const found = snap.find(
            //                     (element) =>
            //                         element.auto == "true" &&
            //                         element.status == 0 &&
            //                         element.autoJob == 0
            //                 );
            //                 console.log(found);
            //                 await db
            //                     .collection("eatorders")
            //                     .doc(`${result.dataValues.iCabRequestId}`)
            //                     .get()
            //                     .then(async (docRef) => {
            //                         console.log(docRef.data().driverOnJob);
            //                         // return docRef.data().driverOnJob
            //                         if (docRef.data().driverOnJob.length == 0) {
            //                             if (found) {
            //                                 console.log(found);
            //                                 await db
            //                                     .collection("eatorders")
            //                                     .doc(`${transactionIdData}`)
            //                                     .update({
            //                                         iDriverId: found.id,
            //                                     });

            //                                 await db
            //                                     .collection("drivertrigger")
            //                                     .doc(`${found.id}`)
            //                                     .update({
            //                                         autoJob: 1,
            //                                     });
            //                             }
            //                         } else {
            //                         }
            //                     })
            //                     .catch((error) => { });

            //                 db.collection("eatorders")
            //                     .doc(`${transactionIdData}`)
            //                     .update({
            //                         driverOnJob: map1,
            //                     });
            //             });
            //         ctx.body = {
            //             status: 200,
            //             message: "orders success",
            //             orderId: transactionIdData,
            //         };
            //         // } else {
            //         // ctx.body = { distance: false, "status": false, details: [checkOpen] }
            //         // }
            //     } else {
            //         ctx.body = {
            //             status: false,
            //             details: [checkOpen],
            //         };
            //     }
            // } else if (countOrder == 3) {
            //     const name = dataOrder.map((x) => x.restaurant_id);
            //     const restaurantData = await restaurant.findAll({
            //         where: {
            //             restaurant_id: name,
            //         },
            //     });
            //     let checkOpen = [];
            //     let details = [];
            //     let countRestaurant = [];
            //     let latLng = [];
            //     const resultDay = await restaurantData.map((element, index) => {
            //         if (day == 1) {
            //             if (
            //                 currentTimeString > element.dataValues.tMonStartTime &&
            //                 currentTimeString < element.dataValues.tMonEndTime
            //             ) {
            //                 countRestaurant.push(1);
            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 1,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             } else if (
            //                 (currentTimeString > element.dataValues.tMonStartTime &&
            //                     currentTimeString > element.dataValues.tMonEndTime) ||
            //                 currentTimeString < element.dataValues.tMonStartTime
            //             ) {
            //                 countRestaurant.push(0);

            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 0,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             }
            //         } else if (day == 2) {
            //             if (
            //                 currentTimeString > element.dataValues.tTueStartTime &&
            //                 currentTimeString < element.dataValues.tTueEndTime
            //             ) {
            //                 countRestaurant.push(1);
            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 1,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             } else if (
            //                 (currentTimeString > element.dataValues.tTueStartTime &&
            //                     currentTimeString > element.dataValues.tTueEndTime) ||
            //                 currentTimeString < element.dataValues.tTueStartTime
            //             ) {
            //                 countRestaurant.push(0);

            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 0,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             }
            //         } else if (day == 3) {
            //             if (
            //                 currentTimeString > element.dataValues.tWedStartTime &&
            //                 currentTimeString < element.dataValues.tWedEndTime
            //             ) {
            //                 countRestaurant.push(1);
            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 1,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             } else if (
            //                 (currentTimeString > element.dataValues.tWedStartTime &&
            //                     currentTimeString > element.dataValues.tWedEndTime) ||
            //                 currentTimeString < element.dataValues.tWedStartTime
            //             ) {
            //                 countRestaurant.push(0);

            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 0,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             }
            //         } else if (day == 4) {
            //             if (
            //                 currentTimeString > element.dataValues.tThuStartTime &&
            //                 currentTimeString < element.dataValues.tThuEndTime
            //             ) {
            //                 countRestaurant.push(1);
            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 1,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             } else if (
            //                 (currentTimeString > element.dataValues.tThuStartTime &&
            //                     currentTimeString > element.dataValues.tThuEndTime) ||
            //                 currentTimeString < element.dataValues.tThuStartTime
            //             ) {
            //                 countRestaurant.push(0);
            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 0,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             }
            //         } else if (day == 5) {
            //             if (
            //                 currentTimeString > element.dataValues.tFriStartTime &&
            //                 currentTimeString < element.dataValues.tFriEndTime
            //             ) {
            //                 countRestaurant.push(1);
            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 1,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             } else if (
            //                 (currentTimeString > element.dataValues.tFriStartTime &&
            //                     currentTimeString > element.dataValues.tFriEndTime) ||
            //                 currentTimeString < element.dataValues.tFriStartTime
            //             ) {
            //                 countRestaurant.push(0);

            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 0,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             }
            //         } else if (day == 6) {
            //             if (
            //                 currentTimeString > element.dataValues.tSatStartTime &&
            //                 currentTimeString < element.dataValues.tSatEndTime
            //             ) {
            //                 countRestaurant.push(1);
            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 1,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             } else if (
            //                 (currentTimeString > element.dataValues.tSatStartTime &&
            //                     currentTimeString > element.dataValues.tSatEndTime) ||
            //                 currentTimeString < element.dataValues.tSatStartTime
            //             ) {
            //                 countRestaurant.push(0);
            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 0,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             }
            //         } else if (day == 7) {
            //             if (
            //                 currentTimeString > element.dataValues.tSunStartTime &&
            //                 currentTimeString < element.dataValues.tSunEndTime
            //             ) {
            //                 countRestaurant.push(1);
            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 1,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             } else if (
            //                 (currentTimeString > element.dataValues.tSunStartTime &&
            //                     currentTimeString > element.dataValues.tSunEndTime) ||
            //                 currentTimeString < element.dataValues.tSunStartTime
            //             ) {
            //                 countRestaurant.push(0);
            //                 checkOpen.push({
            //                     restaurant_id: element.dataValues.restaurant_id,
            //                     restaurant_name: element.dataValues.name_primary,
            //                     open: 0,
            //                     lat: element.dataValues.lat,
            //                     lng: element.dataValues.lng,
            //                 });
            //             }
            //         }
            //     });
            //     const c = await countRestaurant.filter((x) => x == 1).length;
            //     if (c == 3) {
            //         const firestoreData = [];
            //         dataOrder.map((element, index) => {
            //             restaurantData.map((element1, index1) => {
            //                 const name = dataOrder.find(
            //                     ({ restaurant_id }) => restaurant_id === element.restaurant_id
            //                 );
            //                 if (element.restaurant_id == element1.restaurant_id) {
            //                     let a = "";
            //                     element1.isMember == 1 ? (a = true) : (a = false);
            //                     const newObj = {
            //                         ...element,
            //                         restaurant_name: element1.name_primary,
            //                         restaurant_id: element1.restaurant_id,
            //                         isMember: a,
            //                     };
            //                     firestoreData.push(newObj);
            //                 }
            //             });
            //         });
            //         const position = geo.point(
            //             parseFloat(dataOrder[0].location.lat),
            //             parseFloat(dataOrder[0].location.lng)
            //         );

            //         const transactionId = 'EAT' + query.userId + '-' + '03' + '-' + moment().unix() + '-' + maxNumber
            //         const userData = {
            //             iUserId: query.userId,
            //             vSenderName: query.sender,
            //             vSenderMobile: query.senderMobile,
            //             tDestAddress: query.userAddress,
            //             vSourceLatitude: query.latitude,
            //             vSourceLongtitude: query.longitude,
            //             vSenderDeliveryIns: query.vSenderDeliveryIns,
            //             deliveryFee: query.deliveryFee,
            //             orderSum: query.total,
            //             eType: "Eat",
            //             eStatus: "Requesting",
            //             ePayType: query.paymentMethod,
            //             iDriverId: 0,
            //             message: query.message,
            //             deliveryFee: query.deliveryFee,
            //             type: query.type,
            //             ordersStatus: "0",
            //             position,
            //             driver: {
            //                 driverId: null,
            //                 name: null,
            //                 mobile: null,
            //                 image: null,
            //                 rating: null,
            //             },
            //             driverOnJob: [],
            //             orderDate: currentTime,
            //             ordersData: query.orders,
            //             deliveryPrice: 0,
            //             transactionId: transactionId
            //         };
            //         // console.log(firestoreData)
            //         const result = await activities.create(userData);
            //         await db
            //             .collection("eatorders")
            //             .doc(`${transactionId}`)
            //             .set({
            //                 iUserId: query.userId,
            //                 vSenderName: query.sender,
            //                 vSenderMobile: query.senderMobile,
            //                 tDestAddress: query.userAddress,
            //                 vSourceLatitude: query.latitude,
            //                 vSourceLongtitude: query.longitude,
            //                 paymentMethod: query.paymentMethod,
            //                 vSenderDeliveryIns: query.vSenderDeliveryIns,
            //                 orderSum: query.total,
            //                 paymentInfo: payment,
            //                 eType: "Eat",
            //                 eStatus: "Requesting",
            //                 ePayType: query.paymentMethod,
            //                 discountHub: "",
            //                 iDriverId: 0,
            //                 message: query.message,
            //                 deliveryFee: query.deliveryFee,
            //                 type: query.type,
            //                 ordersStatus: "0",
            //                 position,
            //                 driver: {
            //                     driverId: null,
            //                     name: null,
            //                     mobile: null,
            //                     image: null,
            //                     rating: null,
            //                 },
            //                 driverOnJob: [],
            //                 orderDate: currentTime,
            //                 ordersData: firestoreData,
            //                 getFoodImage: "",
            //                 receiveFoodImage: "",
            //             });
            //         await dataOrder.forEach(async function (data) {
            //             //restaurantonline
            //             const orderbyrestaurant = dataOrder.filter(function (order) {
            //                 return order.restaurant_id == data.restaurant_id;
            //             });
            //             console.log(orderbyrestaurant);
            //             const dataOrderData = {
            //                 vSenderName: query.sender,
            //                 vSenderMobile: query.senderMobile,
            //                 tDestAddress: query.userAddress,
            //                 vSourceLatitude: query.latitude,
            //                 vSourceLongtitude: query.longitude,
            //                 paymentMethod: query.paymentMethod,

            //                 message: data.message,
            //                 orderId: result.dataValues.iCabRequestId,
            //                 order_sum: data.order_sum,
            //                 orderdetails: data.orderdetails,
            //                 statusCooking: 0,
            //                 viewOrders: "0"
            //             };
            //             var docRef = db
            //                 .collection("restaurantsonline")
            //                 .doc(`${data.restaurant_id}`);
            //             docRef.get().then((doc) => {
            //                 if (doc.exists) {
            //                     console.log("Document data:", doc.data());

            //                     let orderTotal = doc.data().orders;

            //                     db.collection("restaurantsonline")
            //                         .doc(`${data.restaurant_id}`)
            //                         .update({
            //                             orders: orderTotal.concat([dataOrderData]),
            //                         });

            //                     if (doc.data().status == "offline") {
            //                         const noticeData = {
            //                             message: {
            //                                 // 'topic': `${data.restaurant_id}`,
            //                                 topic: "all",
            //                                 notification: {
            //                                     title: "Hub Merchant App",
            //                                     body: "ORDER จาก" + query.sender + "",
            //                                 },
            //                             },
            //                         };
            //                         sendFcmMessage(noticeData);
            //                     }
            //                 } else {
            //                     console.log("No such document!");
            //                     db.collection("restaurantsonline")
            //                         .doc(`${data.restaurant_id}`)
            //                         .set({
            //                             address: restaurantData[0].dataValues.address,
            //                             address_detail: restaurantData[0].dataValues.address,
            //                             datetime: currentTime,
            //                             isMember: Boolean(restaurantData[0].dataValues.isMember),
            //                             viewOrders: "0",
            //                             location: {
            //                                 lat: restaurantData[0].dataValues.lat,
            //                                 lng: restaurantData[0].dataValues.lng,
            //                             },
            //                             orders: [dataOrderData],
            //                             restaurantsId: restaurantData[0].dataValues.restaurant_id,
            //                             restaurantsName: restaurantData[0].dataValues.name_primary,
            //                             status: "offline",
            //                             // statusCooking: "2",
            //                             // tel: "0988888888"
            //                         });
            //                 }
            //             });
            //             // return
            //             //end restaurantonline
            //             dataRestaurant.push({
            //                 order_sum: data.order_sum,
            //                 order_date: currentTime,
            //                 address: data.address,
            //                 address_detail: data.address_detail,
            //                 iCabRequestId: result.dataValues.iCabRequestId,
            //                 restaurant_id: data.restaurant_id,
            //                 message: data.message,
            //             });
            //         });
            //         await orders.bulkCreate(dataRestaurant);
            //         const cities = db.collection("drivertrigger");
            //         const center = geo.point(
            //             parseFloat(query.latitude),
            //             parseFloat(query.longitude)
            //         );
            //         const radius = 15;
            //         const field = "position";
            //         const driver = geo
            //             .query(cities)
            //             .within(center, radius, field)
            //             .subscribe(async (snap) => {
            //                 const map1 = snap.map(({ id }) => parseInt(id));
            //                 const found = snap.find(
            //                     (element) =>
            //                         element.auto == "true" &&
            //                         element.status == 0 &&
            //                         element.autoJob == 0
            //                 );
            //                 console.log(found);
            //                 await db
            //                     .collection("eatorders")
            //                     .doc(`${transactionId}`)
            //                     .get()
            //                     .then(async (docRef) => {
            //                         console.log(docRef.data().driverOnJob);
            //                         // return docRef.data().driverOnJob
            //                         if (docRef.data().driverOnJob.length == 0) {
            //                             if (found) {
            //                                 console.log(found);
            //                                 await db
            //                                     .collection("eatorders")
            //                                     .doc(`${transactionId}`)
            //                                     .update({
            //                                         iDriverId: found.id,
            //                                     });

            //                                 await db
            //                                     .collection("drivertrigger")
            //                                     .doc(`${found.id}`)
            //                                     .update({
            //                                         autoJob: 1,
            //                                     });
            //                             }
            //                         } else {
            //                         }
            //                     })
            //                     .catch((error) => { });

            //                 db.collection("eatorders")
            //                     .doc(`${transactionId}`)
            //                     .update({
            //                         driverOnJob: map1,
            //                     });
            //             });
            //         ctx.body = {
            //             status: 200,
            //             message: "orders success",
            //             orderId: transactionId,
            //         };
            //     } else if (c == 2) {
            //         const results = checkOpen.filter((obj) => {
            //             return obj.open === 1;
            //         });
            //         results.map((element, index) => {
            //             latLng.push([element.lng, element.lat]);
            //         });
            //         console.log(latLng);
            //         let destination = JSON.stringify({
            //             coordinates: latLng,
            //             units: "km",
            //         });
            //         const header = {
            //             Accept:
            //                 "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
            //             Authorization:
            //                 "5b3ce3597851110001cf624814d13839107e44dc8881bead9d61b803",
            //             "Content-Type": "application/json; charset=utf-8",
            //         };
            //         let routeData = await axios
            //             .post(
            //                 "https://api.openrouteservice.org/v2/directions/driving-car",
            //                 `${destination}`,
            //                 {
            //                     headers: header,
            //                 }
            //             )
            //             .then(function (response) {
            //                 return response;
            //             })
            //             .catch(function (error) {
            //                 console.log(error);
            //             });
            //         console.log(routeData.data.routes[0].summary.distance);
            //         // var newData
            //         if (routeData.data.routes[0].summary.distance <= 1) {
            //             const firestoreData = [];
            //             dataOrder.map((element, index) => {
            //                 restaurantData.map((element1, index1) => {
            //                     const name = dataOrder.find(
            //                         ({ restaurant_id }) => restaurant_id === element.restaurant_id
            //                     );
            //                     if (element.restaurant_id == element1.restaurant_id) {
            //                         const newObj = {
            //                             ...element,
            //                             restaurant_name: element1.name_primary,
            //                             restaurant_id: element1.restaurant_id,
            //                         };
            //                         firestoreData.push(newObj);
            //                     }
            //                 });
            //             });

            //             const position = geo.point(
            //                 parseFloat(dataOrder[0].location.lat),
            //                 parseFloat(dataOrder[0].location.lng)
            //             );
            //             const userData = {
            //                 iUserId: query.userId,
            //                 vSenderName: query.sender,
            //                 vSenderMobile: query.senderMobile,
            //                 tDestAddress: query.userAddress,
            //                 vSourceLatitude: query.latitude,
            //                 vSourceLongtitude: query.longitude,
            //                 vSenderDeliveryIns: query.vSenderDeliveryIns,
            //                 deliveryFee: query.deliveryFee,
            //                 orderSum: query.total,
            //                 eType: "Eat",
            //                 eStatus: "Requesting",
            //                 ePayType: query.paymentMethod,
            //                 iDriverId: 0,
            //                 message: query.message,
            //                 deliveryFee: query.deliveryFee,
            //                 type: query.type,
            //                 ordersStatus: "0",
            //                 position,
            //                 driver: {
            //                     driverId: null,
            //                     name: null,
            //                     mobile: null,
            //                     image: null,
            //                     rating: null,
            //                 },
            //                 driverOnJob: [],
            //                 orderDate: currentTimeString,
            //                 ordersData: query.orders,
            //                 deliveryPrice: 0,
            //             };
            //             // console.log(firestoreData)
            //             const result = await activities.create(userData);
            //             await db
            //                 .collection("eatorders")
            //                 .doc(`${result.dataValues.iCabRequestId}`)
            //                 .set({
            //                     iUserId: query.userId,
            //                     vSenderName: query.sender,
            //                     vSenderMobile: query.senderMobile,
            //                     tDestAddress: query.userAddress,
            //                     vSourceLatitude: query.latitude,
            //                     vSourceLongtitude: query.longitude,
            //                     vSenderDeliveryIns: query.vSenderDeliveryIns,
            //                     orderSum: query.total,
            //                     paymentInfo: payment,
            //                     eType: "Eat",
            //                     eStatus: "Requesting",
            //                     ePayType: query.paymentMethod,
            //                     discountHub: "",
            //                     iDriverId: 0,
            //                     message: query.message,
            //                     deliveryFee: query.deliveryFee,
            //                     type: query.type,
            //                     ordersStatus: "0",
            //                     position,
            //                     driver: {
            //                         driverId: null,
            //                         name: null,
            //                         mobile: null,
            //                         image: null,
            //                         rating: null,
            //                     },
            //                     driverOnJob: [],
            //                     orderDate: currentTimeString,
            //                     ordersData: firestoreData,
            //                     getFoodImage: "",
            //                     receiveFoodImage: "",
            //                 });
            //             await dataOrder.forEach(async function (data) {
            //                 dataRestaurant.push({
            //                     order_sum: data.order_sum,
            //                     order_date: currentTimeString,
            //                     address: data.address,
            //                     address_detail: data.address_detail,
            //                     iCabRequestId: result.dataValues.iCabRequestId,
            //                     restaurant_id: data.restaurant_id,
            //                     message: data.message,
            //                 });
            //             });
            //             // console.log(dataRestaurant)
            //             await orders.bulkCreate(dataRestaurant);
            //             // return
            //             //find driver near area and update in orders collection
            //             const cities = db.collection("drivertrigger");
            //             const center = geo.point(
            //                 parseFloat(query.latitude),
            //                 parseFloat(query.longitude)
            //             );
            //             const radius = 15;
            //             const field = "position";
            //             const driver = geo
            //                 .query(cities)
            //                 .within(center, radius, field)
            //                 .subscribe(async (snap) => {
            //                     const map1 = snap.map(({ id }) => parseInt(id));
            //                     const found = snap.find(
            //                         (element) =>
            //                             element.auto == "true" &&
            //                             element.status == 0 &&
            //                             element.autoJob == 0
            //                     );
            //                     console.log(found);
            //                     await db
            //                         .collection("eatorders")
            //                         .doc(`${result.dataValues.iCabRequestId}`)
            //                         .get()
            //                         .then(async (docRef) => {
            //                             console.log(docRef.data().driverOnJob);
            //                             // return docRef.data().driverOnJob
            //                             if (docRef.data().driverOnJob.length == 0) {
            //                                 if (found) {
            //                                     console.log(found);
            //                                     await db
            //                                         .collection("eatorders")
            //                                         .doc(`${result.dataValues.iCabRequestId}`)
            //                                         .update({
            //                                             iDriverId: found.id,
            //                                         });

            //                                     await db
            //                                         .collection("drivertrigger")
            //                                         .doc(`${found.id}`)
            //                                         .update({
            //                                             autoJob: 1,
            //                                         });
            //                                 }
            //                             } else {
            //                             }
            //                         })
            //                         .catch((error) => { });

            //                     db.collection("eatorders")
            //                         .doc(`${result.dataValues.iCabRequestId}`)
            //                         .update({
            //                             driverOnJob: map1,
            //                         });
            //                 });
            //             ctx.body = {
            //                 message: "orders success",
            //                 orderId: result.dataValues.iCabRequestId,
            //             };
            //         } else {
            //             ctx.body = {
            //                 distance: false,
            //                 status: false,
            //                 details: [checkOpen],
            //             };
            //         }
            //     } else {
            //         ctx.body = {
            //             status: false,
            //             details: [checkOpen],
            //         };
            //     }
            // }
            // return;

            // const firestoreData = [];
            // dataOrder.map((element, index) => {
            //     restaurantData.map((element1, index1) => {
            //         const name = dataOrder.find(
            //             ({ restaurant_id }) => restaurant_id === element.restaurant_id
            //         );
            //         if (element.restaurant_id == element1.restaurant_id) {
            //             const newObj = {
            //                 ...element,
            //                 restaurant_name: element1.name_primary,
            //                 restaurant_id: element1.restaurant_id,
            //             };
            //             firestoreData.push(newObj);
            //         }
            //     });
            // });
            // const result = await activities.create(userData);
            // await db
            //     .collection("eatorders")
            //     .doc(`${result.dataValues.iCabRequestId}`)
            //     .set({
            //         iUserId: query.userId,
            //         vSenderName: query.sender,
            //         vSenderMobile: query.senderMobile,
            //         tDestAddress: query.userAddress,
            //         vSourceLatitude: query.latitude,
            //         vSourceLongtitude: query.longitude,
            //         vSenderDeliveryIns: query.vSenderDeliveryIns,
            //         orderSum: query.total,
            //         eType: "Eat",
            //         eStatus: "Requesting",
            //         discountHub: "",
            //         iDriverId: 0,
            //         message: query.message,
            //         deliveryFee: query.deliveryFee,
            //         type: query.type,
            //         ordersStatus: "0",
            //         position,
            //         driver: {
            //             driverId: null,
            //             name: null,
            //             mobile: null,
            //             image: null,
            //             rating: null,
            //         },
            //         driverOnJob: [],
            //         orderDate: currentTimeString,
            //         ordersData: firestoreData,
            //         getFoodImage: "",
            //         receiveFoodImage: "",
            //     });
            // await dataOrder.forEach(async function (data) {
            //     dataRestaurant.push({
            //         order_sum: data.order_sum,
            //         order_date: currentTimeString,
            //         address: data.address,
            //         address_detail: data.address_detail,
            //         iCabRequestId: result.dataValues.iCabRequestId,
            //         restaurant_id: data.restaurant_id,
            //         message: data.message,
            //     });
            // });
            // // console.log(dataRestaurant)
            // await orders.bulkCreate(dataRestaurant);
            // // return
            // //find driver near area and update in orders collection
            // const cities = db.collection("drivertrigger");
            // const center = geo.point(
            //     parseFloat(query.latitude),
            //     parseFloat(query.longitude)
            // );
            // const radius = 15;
            // const field = "position";
            // const driver = geo
            //     .query(cities)
            //     .within(center, radius, field)
            //     .subscribe(async (snap) => {
            //         const map1 = snap.map(({ id }) => parseInt(id));
            //         const found = snap.find(
            //             (element) =>
            //                 element.auto == "true" &&
            //                 element.status == 0 &&
            //                 element.autoJob == 0
            //         );
            //         console.log(found);
            //         await db
            //             .collection("eatorders")
            //             .doc(`${result.dataValues.iCabRequestId}`)
            //             .get()
            //             .then(async (docRef) => {
            //                 console.log(docRef.data().driverOnJob);
            //                 // return docRef.data().driverOnJob
            //                 if (docRef.data().driverOnJob.length == 0) {
            //                     if (found) {
            //                         console.log(found);
            //                         await db
            //                             .collection("eatorders")
            //                             .doc(`${result.dataValues.iCabRequestId}`)
            //                             .update({
            //                                 iDriverId: found.id,
            //                             });

            //                         await db
            //                             .collection("drivertrigger")
            //                             .doc(`${found.id}`)
            //                             .update({
            //                                 autoJob: 1,
            //                             });
            //                     }
            //                 } else {
            //                 }
            //             })
            //             .catch((error) => { });

            //         db.collection("eatorders")
            //             .doc(`${result.dataValues.iCabRequestId}`)
            //             .update({
            //                 driverOnJob: map1,
            //             });
            //     });
            // ctx.body = {
            //     message: "orders success",
            //     orderId: result.dataValues.iCabRequestId,
            // };
        } catch (error) {
            ctx.body = error.message;
        }
    },

    async deliveryOrder(ctx, _next) {
        const query = ctx.request.body;
        const currentTimeString = moment()
            .tz("Asia/Bangkok")
            .format("YYYY-MM-DD HH:mm:ss");
        console.log(query);
        const dataa = {
            userid: query.userId,
            name: query.name,
            tel: query.tel,
            deliveryPrice: query.deliveryPrice,
            promoCode: query.promoCode,
            totalprice: query.totalprice,
            discountprice: query.discountprice,
        };
        console.log(dataa);
        const userData = {
            iUserId: query.userId,
            vSenderName: query.name,
            vSenderMobile: query.tel,
        };
        const result = await activities.create(userData);
        console.log(result);
        await deliverySave.create({
            deliveryPrice: "",
            status: "",
            iCabRequestId: "",
        });
        return;
        await db.collection("deliveryorder").doc(`${query.userId}`).set(dataa);
    },
    async addTear(ctx, _next) {
        const { query } = ctx;
        console.log(query.tearName);
        ctx.body = query.tearName;
        const datad = {
            tearName: query.tearName,
            startRange: query.startRange,
            endRange: query.endRange,
            startCredit: query.startCredit,
            endCredit: query.endCredit,
        };
        await db.collection("tear").doc(`${query.tearName}`).set(datad);
    },
    async getOrderSuccess(ctx, _next) {
        try {
            // const citiesRef = db.collection("eatorders");
            // const snapshot = await citiesRef.where("ordersStatus", "==", "5").get();
            // if (snapshot.empty) {
            //     console.log("No matching driver");
            //     // return;
            // }
            // const updateStatus = await snapshot.forEach((doc) => {
            //     console.log(doc.id, "=>", doc.data());
            //     console.log(doc.data().ordersStatus);
            //     activities.update(
            //         {
            //             eStatus: "Complete",
            //         },
            //         {
            //             where: {
            //                 iCabRequestId: doc.id,
            //             },
            //         }
            //     );
            // });
            // ctx.body = "update success";
            return;

            ctx.body = updateStatus;
        } catch (error) { }
    },
    async deliverySave(ctx, _next) {
        try {
            // const moment = require("moment");
            // const currentTimeString = moment()
            //     .tz("Asia/Bangkok")
            //     .format("DD-MM-YYYY HH:mm:ss");
            // const deliveryData = ctx.request.body;
            // const deliverDataSave = await deliverySave.create({
            //     deliveryPrice: deliveryData.deliveryPrice,
            //     dateTime: currentTimeString,
            //     status: "Requesting",
            // });
            // console.log(deliverDataSave.dataValues.id);
            // const array1 = deliveryData.details;
            // const newData = array1.map((item) => ({
            //     ...item,
            //     delivery_id: deliverDataSave.dataValues.id,
            // }));
            // const destinationCount = (array1.length).toString().padStart(2, "0")
            // let typeDelivery = "";
            // newData.length > 1
            //     ? (typeDelivery = "Multi-Delivery")
            //     : (typeDelivery = "Deliver");
            // await deliverySaveDetail
            //     .bulkCreate(newData)
            //     .then(() => console.log("delivery data have been saved"));
            // // console.log(typeDelivery)
            // const maxQuick = await runningNumber.findOne({
            //     where: {
            //         type: 'QUICK'
            //     }
            // })
            // let maxNumber = (maxQuick.dataValues.runningNumber + 1).toString().padStart(6, "0")
            // const cabRequestId = await activities.create({
            //     iUserId: deliveryData.userid,
            //     eStatus: "Requesting",
            //     vSenderName: deliveryData.name,
            //     vSenderMobile: deliveryData.tel,
            //     eType: typeDelivery,
            //     transactionId: 'QUICK' + deliveryData.userid + '-' + destinationCount + '-' + moment().unix() + '-' + maxNumber
            // });
            // console.log(cabRequestId.dataValues.iCabRequestId);
            // await db
            //     .collection("quickorders")
            //     .doc(`${cabRequestId.dataValues.iCabRequestId}`)
            //     .set({
            //         iUserId: deliveryData.userid,
            //         eStatus: "Requesting",
            //         driveryPoint: newData.length,
            //         vSenderName: deliveryData.name,
            //         vSenderMobile: deliveryData.tel,
            //         eType: typeDelivery,
            //         driver: {
            //             driverId: 0,
            //             image: "",
            //             mobile: "",
            //             name: "",
            //             rating: "",
            //         },
            //         iDriverId: 0,
            //         driverOnJob: [],
            //         orderDate: currentTimeString,
            //         orderSum: 0,
            //         ordersStatus: 0,
            //         tDestAddress: "",
            //         deliveryDetail: newData,
            //         deliveryPrice: 0,
            //         getDeliveryImage: "",
            //         receiveDeliveryImage: "",
            //         promoCode: deliveryData.promoCode,
            //         totalprice: deliveryData.totalprice,
            //         discountprice: deliveryData.discountprice,
            //     });


            // await runningNumber.update({
            //     runningNumber: maxQuick.dataValues.runningNumber + 1
            // },
            //     {
            //         where: {
            //             type: 'QUICK'
            //         }
            //     })
            // await deliverySave.update(
            //     {
            //         iCabRequestId: cabRequestId.dataValues.iCabRequestId,
            //     },
            //     {
            //         where: {
            //             id: deliverDataSave.dataValues.id,
            //         },
            //     }
            // );
            // await deliverySaveDetail.update(
            //     {
            //         iCabRequestId: cabRequestId.dataValues.iCabRequestId,
            //     },
            //     {
            //         where: {
            //             delivery_id: deliverDataSave.dataValues.id,
            //         },
            //     }
            // );
            // ctx.body = {
            //     result: "success",
            //     detail: {
            //         dateTime: currentTimeString,
            //         status: "Requesting",
            //         id: deliverDataSave.dataValues.id,
            //         eType: typeDelivery,
            //         cabRequestId: cabRequestId.dataValues.iCabRequestId,
            //         transactionId: 'QUICK' + deliveryData.userid + '-' + destinationCount + '-' + moment().unix() + '-' + maxNumber
            //     },
            // };
        } catch (error) { }
    },
    async firestoreUpdateStatus(ctx, _next) {
        const req = ctx.request.body;

        // if (req.orderStatus == "1") {
        //     db.collection("eatorders").doc(`${req.orderId}`).update({
        //         ordersStatus: req.orderStatus,
        //         eStatus: "Ongoing",
        //     });
        //     await activities.update(
        //         {
        //             eStatus: "Ongoing",
        //             ordersStatus: req.orderStatus,
        //         },
        //         {
        //             where: {
        //                 iCabRequestId: req.orderId,
        //             },
        //         }
        //     );
        // } else if (req.orderStatus == "5") {
        //     db.collection("eatorders").doc(`${req.orderId}`).update({
        //         ordersStatus: req.orderStatus,
        //         eStatus: "Complete",
        //     });
        //     await activities.update(
        //         {
        //             ordersStatus: req.orderStatus,
        //             eStatus: "Complete",
        //         },
        //         {
        //             where: {
        //                 iCabRequestId: req.orderId,
        //             },
        //         }
        //     );
        // } else if (req.orderStatus == "CN") {
        //     db.collection("eatorders").doc(`${req.orderId}`).update({
        //         ordersStatus: req.orderStatus,
        //         eStatus: "Cancelled",
        //     });
        //     await activities.update(
        //         {
        //             ordersStatus: req.orderStatus,
        //             eStatus: "Cancelled",
        //         },
        //         {
        //             where: {
        //                 iCabRequestId: req.orderId,
        //             },
        //         }
        //     );
        // }
        // ctx.body = "update success";
    },
};
