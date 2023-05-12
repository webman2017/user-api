const Router = require("koa-joi-router");
const meta = require("./../utils/meta.utils");
const { getDistance } = require("./../controllers");
const authMiddleware = require("../middleware/auth.middleware");
let Joi = Router.Joi;
const api = Router();
api.prefix("/getDistanceRating");
api.route({
    meta: meta("get distance and rating", "get distance & rating"),
    // pre: async (ctx, next) => await authMiddleware(ctx, next),
    method: "post",
    validate: {
        body: {
            lat: Joi.number().required(),
            lng: Joi.number().required(),
            restaurantId: Joi.number().required(),
        },
        type: "json",
    },
    path: "/getDistanceRating",
    handler: getDistance.calculateDistance,
});
module.exports = api;
