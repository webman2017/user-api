const Router = require("koa-joi-router");
const meta = require("./../utils/meta.utils");
const { servicePolicy } = require("./../controllers");
const authMiddleware = require("../middleware/auth.middleware");
let Joi = Router.Joi;
const api = Router();
api.prefix("/sevicePolicy");
api.route({
    meta: meta("service and policy", "service policy"),
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    method: "get",
    path: "/",
    handler: servicePolicy.findAll,
});
module.exports = api;
