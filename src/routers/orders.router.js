const Router = require("koa-joi-router");
const meta = require("./../utils/meta.utils");
const { orders } = require("./../controllers");
const authMiddleware = require("../middleware/auth.middleware");
const { object } = require("joi");
let Joi = Router.Joi;
const api = Router();
api.prefix("/orders");



api.route({
    meta: meta("Order Rate", "Order"),
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    method: "post",
    validate: {
        body: {
            destination: Joi.array().items({
                lat: Joi.string(),
                lng: Joi.string(),
                // 
            }),
        },
        type: "json",
    },
    path: "/orderRate",
    handler: orders.OrderRate,
});
module.exports = api;
