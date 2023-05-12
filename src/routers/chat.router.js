const Router = require("koa-joi-router");
const meta = require("./../utils/meta.utils");
const { chat } = require("./../controllers");
const authMiddleware = require("../middleware/auth.middleware");
let Joi = Router.Joi;
const api = Router();
api.prefix("/chat");
api.route({
    meta: meta("chat customer officer แชทระหว่างผู้ใช้และเจ้าหน้าที่  Hub", "chat"),
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    method: "post",
    validate: {
        body: {
            userId: Joi.number().required(),
            sender: Joi.string().required(),
            receiver: Joi.string().required(),
            message: Joi.string().required(),
            date: Joi.string().required(),
        },
        type: "json",
    },
    path: "/chatCustomerOfficer",
    handler: chat.saveChatCustomerOfficer,
});

api.route({
    meta: meta("chat driver customer แชทระหว่างผู้ใช้และคนขับ", "chat"),
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    method: "post",
    validate: {
        body: {
            token: Joi.string(),
            orderId: Joi.string().required(),
            // driverId: Joi.number().required(),
            sender: Joi.number().required(),
            receiver: Joi.number().required(),
            message: Joi.string().required(),
            path: Joi.string(),
            filename: Joi.string(),
            mime: Joi.string()
            // date: Joi.string().required(),
        },
        type: "json",
    },
    path: "/chatDriverCustomer",
    handler: chat.saveChatDriverCustomer,
});

api.route({
    meta: meta("picture report delivery", "chat"),
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    method: "post",
    validate: {
        body: {
            orderId: Joi.string().required(),
            // driverId: Joi.number().required(),
            sender: Joi.number().required(),
            receiver: Joi.number().required(),
            message: Joi.string().required(),
            path: Joi.string(),
            filename: Joi.string(),
            mime: Joi.string()
            // date: Joi.string().required(),
        },
        type: "json",
    },
    path: "/pictureReportDelivery",
    handler: chat.pictureReportDelivery,
});






api.route({
    meta: meta("chat driver officer", "chat"),
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    method: "post",
    validate: {
        body: {
            driverId: Joi.number().required(),
            sender: Joi.string().required(),
            receiver: Joi.string().required(),
            message: Joi.string().required(),
            date: Joi.string().required(),
        },
        type: "json",
    },
    path: "/chatDriverOfficer",
    handler: chat.saveChatDriverOfficer,
});

api.route({
    meta: meta("get chat driver customer", "chat"),
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    method: "get",
    path: "/getChatDriverCustomer",
    handler: chat.getDriverCustomer,
});
module.exports = api;
