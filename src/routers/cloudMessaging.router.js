const Router = require("koa-joi-router");
const meta = require("./../utils/meta.utils");
const { firestore } = require("./../controllers");
const authMiddleware = require("../middleware/auth.middleware");
let Joi = Router.Joi;
const api = Router();
api.prefix("/cloundMessaging");
api.route({
    meta: meta('send cloud messaging ', 'coundMessaging'),
    method: "post",
    validate: {
        body: {
            token: Joi.string().required(),
        },
        type: "json",

    },
    path: "/cloudMessage",
    handler: firestore.cloudMessage,
});


module.exports = api;
