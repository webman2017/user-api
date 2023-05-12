const { activities, orders, orderDetails, delivery, restaurant } = require("./../models");
const Sequelize = require("sequelize");
const { object } = require("joi");
const { calculateGoogleMapDistance } = require("./../utils/common.utils");
const database = require("../configs/firebaseConfig");
const { ref, set, onValue, update } = require("firebase/database");
const moment = require("moment");
const admin = require("firebase-admin");
const db = admin.firestore()
module.exports = {
    async takeorder(ctx, _next) {
        try {
            const data = ctx.request.body
            console.log(data)
            db.collection('restaurantsonline').doc('1234').update({
                statusCooking: "2"
            });
        } catch (error) {
            ctx.body = error.message;
        }
    },

};
