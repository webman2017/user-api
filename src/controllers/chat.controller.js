const { chatOfficer, chat } = require("./../models");
const Sequelize = require("sequelize");
// const { calculateGoogleMapDistance } = require("./../utils/common.utils");
const database = require("../configs/firebaseConfig");
const { ref, set, onValue, update, query } = require("firebase/database");
const chatOfficerModel = require("../models/chatOfficer.model");
const path = require('path');
const __basedir = path.resolve();
const moment = require('moment')
const fs = require("fs");
module.exports = {
    async saveChatCustomerOfficer(ctx, _next) {
        try {
            const data = ctx.request.body
            console.log(data)
            const brand = await chatOfficer.create({
                sender: data.sender,
                receiver: data.receiver,
                message: data.message,
            });
            const userId = data.userId
            const id = Date.now()
            const firebaseData = {
                sender: data.sender,
                receiver: data.receiver,
                message: data.message,
            }
            console.log(firebaseData)
            // set(ref(database, "chat-customer-officer/" + userId + "/" + id), firebaseData);
            // ctx.body = {
            //     data: "success"
            // };
        } catch (error) {
            ctx.body = error.message;
        }
    },
    async saveChatDriverCustomer(ctx, _next) {
        try {
            const req = ctx.request.body
            console.log(req)

            // return
            // const tmp = req.path
            // const name = req.filename
            // const type = req.mime
            // let base64Data = tmp.replace(/^data:image\/[a-z]+;base64,/, "")
            // let dir = String(req.orderId)
            // const pathFile = path.join(__basedir, dir)
            // console.log(__basedir)
            // fs.existsSync(dir) || fs.mkdirSync(dir, { recursive: true });
            // fs.writeFile(path.join(pathFile, name), base64Data, 'base64', function (err) {
            //     console.log(err)
            // })
            const brand = await chat.create({
                order_id: req.orderId,
                sender: req.sender,
                receiver: req.receiver,
                message: req.message,
                create_at: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
            });
            const tmp = req.path
            const name = req.filename
            const type = req.mime
            let base64Data = tmp.replace(/^data:image\/[a-z]+;base64,/, "")
            let dir = "image_chat"

            console.log(dir)

            const pathFile = path.join(__basedir, dir)
            console.log(__basedir)
            fs.existsSync(dir) || fs.mkdirSync(dir, { recursive: true });
            fs.writeFile(path.join(pathFile, name), base64Data, 'base64', function (err) {
                console.log(err)
            })
            const driverId = req.driverId
            const id = Date.now()
            const firebaseData = {
                message: req.message,
                datetime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
                sender: req.sender,
                receiver: req.receiver,
                filename: req.filename
            }
            // console.log(firebaseData)
            // set(ref(database, "chat-driver-customer/" + req.orderId + "/" + id + ""), firebaseData);
            const FCM = require('fcm-node')
            var serverKey = 'AAAAl5Iu6I8:APA91bFzRbdm8HodvRZri5E9qee-9wcucAolZ1-m3skYhkZ20v2lbN2tQIpxPn6c6X1OW7o1dOXCoNxEEWupLHSpuTYosrGYUolDlhYCtBybpWDFLpgzWuZYzcxFO9vcP6RY30AMfXzX';
            var fcm = new FCM(serverKey);
            var message = {
                to: req.token,
                notification: {
                    title: 'chat message',
                    body: req.message,
                },
                data: { //you can send only notification or only data(or include both)
                    title: 'chat',
                    body: req.message,
                }
            };
            await fcm.send(message, function (err, response) {
                if (err) {
                    console.log("Something has gone wrong!" + err);
                    console.log("Respponse:! " + response);

                } else {
                    // showToast("Successfully sent with response");
                    console.log("Successfully sent with response: ", response);

                }
            });
            ctx.body = {
                data: "success"
            };
        } catch (error) {
            ctx.body = error.message;
        }
    },
    async pictureReportDelivery(ctx, _next) {
        try {
            const req = ctx.request.body
            console.log(req)
            const brand = await chat.create({
                order_id: req.orderId,
                sender: req.sender,
                receiver: req.receiver,
                message: req.message,
                create_at: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
            });
            // console.l2og(req.orderId)
            // return
            // const tmp = req.path
            // const name = req.filename
            // const type = req.mime
            // let base64Data = tmp.replace(/^data:image\/[a-z]+;base64,/, "")
            // let dir = String(req.orderId)
            // const pathFile = path.join(__basedir, dir)
            // console.log(__basedir)
            // fs.existsSync(dir) || fs.mkdirSync(dir, { recursive: true });
            // fs.writeFile(path.join(pathFile, name), base64Data, 'base64', function (err) {
            //     console.log(err)
            // })
            const tmp = req.path
            const name = req.filename
            const type = req.mime
            let base64Data = tmp.replace(/^data:image\/[a-z]+;base64,/, "")
            let dir = "public"

            console.log(dir)

            const pathFile = path.join(__basedir, dir)
            console.log(__basedir)
            fs.existsSync(dir) || fs.mkdirSync(dir, { recursive: true });
            fs.writeFile(path.join(pathFile, name), base64Data, 'base64', function (err) {
                console.log(err)
            })


            return
            const driverId = req.driverId
            const id = Date.now()
            const firebaseData = {
                message: req.message,
                datetime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
                sender: req.sender,
                receiver: req.receiver,
                filename: req.filename
            }
            // console.log(firebaseData)
            set(ref(database, "chat/" + req.orderId + "/" + id + ""), firebaseData);

            ctx.body = {
                data: "success"
            };
        } catch (error) {
            ctx.body = error.message;
        }
    },

    async saveChatDriverOfficer(ctx, _next) {
        try {
            const data = ctx.request.body
            console.log(data)
            const brand = await chatOfficer.create({
                sender: data.sender,
                receiver: data.receiver,
                message: data.message,
            });
            const driverId = data.driverId
            const id = Date.now()
            const firebaseData = {
                sender: data.sender,
                receiver: data.receiver,
                message: data.message,
            }
            const room = "test"
            console.log(firebaseData)
            // set(ref(database, "chat-driver-officer/" + driverId + ""), room);
            // set(ref(database, "chat-driver-officer/" + driverId + "/" + id), firebaseData);

            ctx.body = {
                data: "success"
            };
        } catch (error) {
            ctx.body = error.message;
        }
    },
    async getDriverCustomer(ctx, _next) {
        try {
            const noticeData = ref(database, "chat-driver-customer");
            onValue(noticeData, (snapshot) => {
                // result = snapshot.val();
                const dataNotification = []
                snapshot.forEach((data) => {
                    // console.log(data.key + ' xxx ' + data.val().message);
                    dataNotification.push({ 'chatId': data.key })
                });
                console.log(dataNotification)
                ctx.body = { 'notification': dataNotification }
            })
        } catch (error) {
            ctx.body = error.message;
        }
    }
};
