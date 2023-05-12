const Router = require("koa-joi-router");
const meta = require("./../utils/meta.utils");
const { favorite } = require("./../controllers");
const authMiddleware = require("../middleware/auth.middleware");
let Joi = Router.Joi;
const api = Router();
api.prefix("/favorite");
api.route({
    meta: meta("get favorite restaurant", "favorite"),
    // pre: async (ctx, next) => await authMiddleware(ctx, next),
    method: "post",
    validate: {
        body: {
            userID: Joi.number().required(),
        },
        type: "json",
    },
    path: "/getFavorite",
    handler: favorite.findAll,
});

api.route({
    meta: meta("save or destroy favorite restaurant", "favorite"),
    // pre: async (ctx, next) => await authMiddleware(ctx, next),
    method: "post",
    validate: {
        body: {
            userID: Joi.number().required(),
            restaurantId: Joi.number().required(),
            action: Joi.string().valid(['create', 'destroy']).required(),
        },
        type: "json",
    },
    path: "/saveDestroyFavorite",
    handler: favorite.saveDestroyFavorite,
});
module.exports = api;
