const Router = require('koa-joi-router')
const meta = require('./../utils/meta.utils')
const { countWalk } = require('./../controllers')
const authMiddleware = require('../middleware/auth.middleware')
const paginationValidation = require('./../utils/pagination.util')
const Joi = Router.Joi
const api = Router()
api.prefix('/countWalk')
api.route({
    meta: meta('Count Walk', 'count walk'),
    method: 'get',
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    path: '/:id',
    // validate: {
    //     query: {
    //         ...paginationValidation,
    //         type: Joi.string().valid(['Delivery', 'Food']),
    //         status: Joi.string().valid(['Requesting', 'Cancelled', 'Complete'])
    //     },
    // },
    handler: countWalk.findAll,
});
api.route({
    meta: meta("Save Count Walk", "count walk"),
    method: "post",
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    path: "/save",
    validate: {
        body: {

            userId: Joi.number().required(),
            step: Joi.string().required(),
            distance: Joi.string().required(),
            cal: Joi.string().required(),

        },
        type: "json",
    },
    handler: countWalk.saveCountWalk,
});




module.exports = api
