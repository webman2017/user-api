// const { countWalk } = require("./../models");
const Sequelize = require("sequelize");
const database = require("../configs/firebaseConfig");
const { ref, set, onValue, update, remove } = require("firebase/database");
module.exports = {
    async sendNotification(ctx, _next) {
        try {
            const message = ctx.request.body
            const firebaseData = {
                // type: message.type,
                title: message.title,
                message: message.message,
                status: message.status,
                date: message.date,
                url: message.url
            }
            set(ref(database, "notice/" + Date.now() + ""), firebaseData);
            ctx.body = "save success"

        } catch (err) {
            ctx.body = err.message;
        }
    },
    async delete(ctx, _next) {
        try {
            const messageId = ctx.params
            console.log(messageId)
            const noticeId = "notice" + "/" + messageId.messageId
            console.log(noticeId)
            remove(ref(database, noticeId));
            ctx.body = {
                result: "ลบ Notification แล้ว"
            }
            // console.log("database", database);
            // database.remove();
        } catch (err) {
            ctx.body = err.message;
        }
    },
    async readNotification(ctx, _next) {
        try {
            const messageId = ctx.request.body
            console.log(messageId.messageId)
            const noticeId = "notice" + "/" + messageId.messageId
            console.log(noticeId)
            const read = await update(ref(database, noticeId), {
                status: messageId.status,
            });

            ctx.body = {
                result: "อัพเดทสถานะ notification แล้ว"
            }
        } catch (err) {
            ctx.body = err.message;
        }
    },
    async getnotification(ctx, _next) {
        try {
            const noticeData = ref(database, "notice");
            onValue(noticeData, (snapshot) => {
                // result = snapshot.val();
                const dataNotification = []
                snapshot.forEach((data) => {
                    // console.log(data.key + ' xxx ' + data.val().message);
                    dataNotification.push({
                        'notificationId': data.key,
                        'id': data.val().id,
                        'status': data.val().status,
                        'message': data.val().message,
                        'type': data.val().type,
                        'url': data.val().url
                    })
                });
                console.log(dataNotification)
                ctx.body = { 'notification': dataNotification }
            });
        } catch (err) {
            ctx.body = err.message;
        }
    },
}