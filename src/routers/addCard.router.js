const Router = require('koa-joi-router')
const meta = require('./../utils/meta.utils')
const { addCard } = require('./../controllers')
const authMiddleware = require('../middleware/auth.middleware')
const paginationValidation = require('./../utils/pagination.util')
const Joi = Router.Joi
const api = Router()
api.prefix('/card')
api.route({
    meta: meta('create credit', 'credit'),
    method: 'post',
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    path: '/',
    validate: {
        body: {
            userId: Joi.number().required(),
            name: Joi.string().required(),
            // city: Joi.string().required(),
            number: Joi.number().required(),
            expiration_month: Joi.string().required(),
            expiration_year: Joi.string().required(),
            security_code: Joi.number().required()
        },
        type: "json",
    },
    handler: addCard.findAll,
})
api.route({
    meta: meta('get credit', 'credit'),
    method: 'get',
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    path: '/getCredit/:userId',
    // validate: {
    //     body: {
    //         userId: Joi.number().required(),
    //     },
    //     type: "json",
    // },
    handler: addCard.getCredit,
})
api.route({
    meta: meta('delete credit', 'credit'),
    method: 'delete',
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    path: '/delCredit/:userId/:cardId',
    // validate: {
    //     body: {
    //         userId: Joi.number().required(),
    //         cardId: Joi.string().required(),
    //     },
    //     type: "json",
    // },
    handler: addCard.delCredit,
})

api.route({
    meta: meta('charge card', 'credit'),
    method: 'post',
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    path: '/chargeCredit',
    validate: {
        body: {
            userId: Joi.number().required(),
            cardId: Joi.string().required(),
            amount: Joi.number().required()
        },
        type: "json",
    },
    handler: addCard.creditCharge,
})
api.route({
    meta: meta('internetBanking', 'credit'),
    method: 'post',
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    path: '/internetBanking',
    validate: {
        query: {
            bank: Joi.string().valid(['Krungsri Online', 'Bualuang iBanking', 'KTB Netbank', 'SCB Easy Net']),
            amount: Joi.number().required()
        },

    },
    handler: addCard.internetBanking,
})
module.exports = api
