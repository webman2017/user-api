const Router = require('koa-joi-router')
const meta = require('./../utils/meta.utils')
const { checkDistance } = require('./../controllers')
const authMiddleware = require('../middleware/auth.middleware')
const paginationValidation = require('./../utils/pagination.util')
const Joi = Router.Joi
const api = Router()
api.prefix('/checkDistance')
api.route({
    meta: meta('checkDistance', 'checkDistance'),
    method: 'post',
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    path: '/',
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
    handler: checkDistance.checkDistance,
}),


    module.exports = api
