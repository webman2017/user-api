const Router = require("koa-joi-router");
const meta = require("./../utils/meta.utils");
const { driverLog } = require("./../controllers");
const authMiddleware = require("../middleware/auth.middleware");
let Joi = Router.Joi;
const api = Router();
api.prefix("/DriverLog");
api.route({
    meta: meta("Driver Log", "DriverLog"),
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    method: "get",
    // validate: {
    //     body: {
    //         origins: { lat: Joi.string().required(), lng: Joi.string().required() },
    //         destinations: { lat: Joi.string().required(), lng: Joi.string().required() }
    //     },
    //     type: "json",
    // },
    path: "/",
    handler: driverLog.DriverLog,
});


module.exports = api;
