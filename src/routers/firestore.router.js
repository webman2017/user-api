const Router = require('koa-joi-router')
const meta = require('./../utils/meta.utils')
const { firestore } = require('./../controllers')
const authMiddleware = require('../middleware/auth.middleware')
const Joi = Router.Joi
const api = Router()
api.prefix('/firestore')
api.route({
    meta: meta('get firetone', 'firestore'),
    method: 'get',
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    path: "/",
    handler: firestore.findAll,
});
api.route({
    meta: meta('Add Location Firestore', 'firestore'),
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    validate: {
        query: {
            driverId: Joi.number().required(),
            // name: Joi.string().required(),
            lat: Joi.number().required(),
            lng: Joi.number().required(),
            status: Joi.string().valid(['0', '1', '2', '3', '4', '5', '6', '7']),
            auto: Joi.string().valid(['true', 'false']),

        },
    },
    method: 'post',
    path: '/addLocation',
    handler: firestore.firestoreDriverLocation,
});

api.route({
    meta: meta('getMarker', 'firestore'),
    method: 'get',
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    path: "/getMarker",
    handler: firestore.getMarker,
});

api.route({
    meta: meta("order store to database and save to firestore", "firestore"),
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    method: "post",
    validate: {
        body: {
            userId: Joi.number().required(),
            sender: Joi.string().required(),
            senderMobile: Joi.string().required(),
            userAddress: Joi.string().required(),
            latitude: Joi.string().required(),
            longitude: Joi.string().required(),
            message: Joi.string(),
            paymentMethod: Joi.string().required(),
            paymentInfo: Joi.object().keys({
                amount: Joi.number(),
                customer: Joi.string(),
                card: Joi.number(),
            }),
            type: Joi.string().required(),
            promoCode: Joi.string().required(),
            discountHub: Joi.number().required(),
            total: Joi.number().required(),
            subTotal: Joi.number().required(),
            deliveryFee: Joi.number().required(),
            vSenderDeliveryIns: Joi.string().required(),
            orders: Joi.array().items({
                promoCode: {
                    couponCode: Joi.string(),
                    discount: Joi.number(),
                },
                order_sum: Joi.string(),
                restaurant_id: Joi.string(),
                message: Joi.string().default(null),
                location: {
                    lat: Joi.string().required(),
                    lng: Joi.string().required(),
                },
                address: Joi.string(),
                address_detail: Joi.string(),
                orderdetails: Joi.array().items(Joi.object().keys({
                    menu_id: Joi.string(),
                    menu_name: Joi.string(),
                    request_message: Joi.string(),
                    price_exact: Joi.string(),
                    price_sale: Joi.string(),
                    qty: Joi.string(),
                    addon: Joi.array().items(Joi.object().keys({
                        addOn: Joi.string(),
                    }))
                }))
            })
        },
        type: "json",

    },
    path: "/",
    handler: firestore.orderStore,
});
api.route({
    meta: meta("order delivery", "firestore"),
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    method: "post",
    validate: {
        body: {
            userId: Joi.number().required(),
            name: Joi.string().required(),
            senderMobile: Joi.string().required(),
            tel: Joi.string().required(),
            deliveryPrice: Joi.string().required()

        },
        type: "json",
    },
    path: "/orderDelivery",
    handler: firestore.deliveryOrder,
});

api.route({
    meta: meta('getOrderSuccess', 'firestore'),
    method: 'get',
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    path: "/getOrderSuccess",
    handler: firestore.getOrderSuccess,
});

api.route({
    meta: meta('update firestore', 'firestore'),
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    validate: {
        body: {
            orderId: Joi.number().required(),
            orderStatus: Joi.string().required(),

        },
        type: "json",
    },
    method: 'post',
    path: '/updateStatus',
    handler: firestore.firestoreUpdateStatus,
});

module.exports = api
