const Router = require("koa-joi-router");
const meta = require("./../utils/meta.utils");
const { delivery, firestore } = require("./../controllers");
const authMiddleware = require("../middleware/auth.middleware");
let Joi = Router.Joi;
const api = Router();
api.prefix("/delivery");
api.route({
    meta: meta("Delivery Rate", "delivery"),
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
    path: "/",
    handler: delivery.deliveryRate,
});

api.route({
    meta: meta("Delivery Save", "delivery"),
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    method: "post",
    validate: {
        body: {
            userid: Joi.number().required(),
            tel: Joi.string().required(),
            name: Joi.string().required(),
            deliveryPrice: Joi.string().required(),
            promoCode: Joi.string().required(),
            totalprice: Joi.number().required(),
            discountprice: Joi.number().required(),
            details: Joi.array().items({
                title: Joi.string(),
                name: Joi.string(),
                addressName: Joi.string(),
                addressDetail: Joi.string().empty("").default(""),
                lat: Joi.number(),
                long: Joi.number(),
                tel: Joi.string(),
                typeItem: Joi.string().empty("").default(""),
                iconTypeItem: Joi.string().empty("").default(""),
                deliveryInstruction: Joi.string().empty("").default(""),
                status: Joi.string().valid(['Requesting', 'Cancelled', 'Complete', 'Ongoing'])
            })
        },
        type: "json",
    },
    path: "/deliverySave",
    handler: firestore.deliverySave,
});
module.exports = api;
