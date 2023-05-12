const Router = require("koa-joi-router");
const meta = require("./../utils/meta.utils");
const { faqs } = require("./../controllers");
const authMiddleware = require("../middleware/auth.middleware");
let Joi = Router.Joi;
const api = Router();
api.prefix("/faqs");
api.route({
    meta: meta("faqs", "faqs"),
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    method: "get",
    path: "/",
    handler: faqs.findAll,
});

module.exports = api;
