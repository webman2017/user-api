const { activities, orders, orderDetails, restaurant, deliverySave, deliverySaveDetail } = require("./../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op
const { getPagination } = require('./../utils/common.utils')
module.exports = {

    async sendCloudMessaging(ctx, _next) {
        try {
            let FCM = require('fcm-node');
            let serverKey = 'AAAAl5Iu6I8:APA91bFzRbdm8HodvRZri5E9qee-9wcucAolZ1-m3skYhkZ20v2lbN2tQIpxPn6c6X1OW7o1dOXCoNxEEWupLHSpuTYosrGYUolDlhYCtBybpWDFLpgzWuZYzcxFO9vcP6RY30AMfXzX'; //put your server key here
            let fcm = new FCM(serverKey);
            let message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                to: 'registration_token',
                collapse_key: 'your_collapse_key',

                notification: {
                    title: 'Title of your push notification',
                    body: 'Body of your push notification'
                },

                data: {  //you can send only notification or only data(or include both)
                    my_key: 'my value',
                    my_another_key: 'my another value'
                }
            };
            fcm.send(message, function (err, response) {
                if (err) {
                    console.log("Something has gone wrong!");
                } else {
                    console.log("Successfully sent with response: ", response);
                }
            });
            ctx.body = "xxx"
        } catch (error) {
            ctx.body = error.message;
        }
    }
}
