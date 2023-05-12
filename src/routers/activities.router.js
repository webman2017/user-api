const Router = require('koa-joi-router')
const meta = require('./../utils/meta.utils')
const { activities } = require('./../controllers')
const authMiddleware = require('../middleware/auth.middleware')
const paginationValidation = require('./../utils/pagination.util')
const Joi = Router.Joi
const api = Router()
api.prefix('/activities')
api.route({
    meta: meta('User Activities', 'activities'),
    method: 'get',
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    path: '/:id',
    validate: {
        query: {
            ...paginationValidation,
            type: Joi.string().valid(['Deliver', 'Food']),
            status: Joi.string().valid(['Requesting', 'Cancelled', 'Complete', 'Ongoing'])
        },
    },
    handler: activities.findAll,
}),
    api.route({
        meta: meta('food Activities', 'activities'),
        method: 'get',
        pre: async (ctx, next) => await authMiddleware(ctx, next),
        path: '/foodActivity/:id',
        // validate: {
        //     query: {
        //         ...paginationValidation,
        //         type: Joi.string().valid(['Deliver', 'Food']),
        //         status: Joi.string().valid(['Requesting', 'Cancelled', 'Complete'])
        //     },
        // },
        handler: activities.foodActivity,
    }),

    module.exports = api
