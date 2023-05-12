const Router = require('koa-joi-router')
const meta = require('./../utils/meta.utils')
const { notification } = require('./../controllers')
const authMiddleware = require('../middleware/auth.middleware')
const paginationValidation = require('./../utils/pagination.util')
const { date } = require('joi')

const Joi = Router.Joi
const api = Router()
api.prefix('/notification')

api.route({
    meta: meta("Notification", "notification"),
    method: "post",
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    path: "/save",
    validate: {
        body: {
            // type: Joi.string().required(),
            title: Joi.string().required(),
            message: Joi.string().required(),
            status: Joi.number().required(),
            date: Date.now(),
            url: Joi.string().required()
        },
        type: "json",
    },
    handler: notification.sendNotification,
});

api.route({
    meta: meta("delete notification", "notification"),
    method: "delete",
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    path: '/delete/:messageId',
    handler: notification.delete,
});

api.route({
    meta: meta("get notification", "notification"),
    method: "get",
    path: '/',
    handler: notification.getnotification,
});



api.route({
    meta: meta("read/unread notification", "notification"),
    method: "post",
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    path: "/readUnread",
    validate: {
        body: {
            messageId: Joi.number().required(),
            status: Joi.string().required(),
        },
        type: "json",
    },
    handler: notification.readNotification,
});

module.exports = api
