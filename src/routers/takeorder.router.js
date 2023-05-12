const Router = require("koa-joi-router");
const meta = require("./../utils/meta.utils");
const { takeorder } = require("./../controllers");
const authMiddleware = require("../middleware/auth.middleware");
const { object } = require("joi");
let Joi = Router.Joi;
const api = Router();
api.prefix("/takeorder");
api.route({
    meta: meta("take order", "takeorder"),
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    method: "post",
    validate: {
        body: {
            orderId: Joi.string(),
            restaurant_id: Joi.number(),
            lat: Joi.number(),
            lng: Joi.number(),
            status: Joi.string(),
            message: Joi.string(),
        },
        type: "json",
    },
    path: "/",
    handler: takeorder.takeorder,
});
module.exports = api;
