const Router = require('koa-joi-router')
const meta = require('./../utils/meta.utils')
const { restaurant } = require('./../controllers')
const authMiddleware = require('../middleware/auth.middleware')
const paginationValidation = require('./../utils/pagination.util')
const Joi = Router.Joi
const api = Router()
api.prefix('/restaurant')
// CRUD
api.route({
    meta: meta('Filter Top Late', 'filter'),
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    validate: {
        query: { lat: Joi.number().required(), lng: Joi.number().required() },
    },
    method: 'get',
    path: '/filterTopLate',
    handler: restaurant.filterTopLate,
})
api.route({
    meta: meta('Filter Cuisines', 'filter'),
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    validate: {
        query: {
            lat: Joi.number().required(),
            lng: Joi.number().required(),
            categoryId: Joi.number().required(),
        },
    },
    method: 'get',
    path: '/filterCuisines',
    handler: restaurant.filterTopLate,
})

api.route({
    meta: meta('Find promocode', 'filter'),
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    validate: {
        query: {
            ...paginationValidation,
            lat: Joi.number().required(),
            lng: Joi.number().required(),
            distance: Joi.number().default(7),
            scroll: Joi.boolean().default(false),
            where: Joi.array().items(Joi.number()),
        },
    },
    method: 'get',
    path: '/findPromocode',
    handler: restaurant.findPromocode,
})
api.route({
    meta: meta('Find distance', 'filter'),
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    validate: {
        query: {
            ...paginationValidation,
            lat: Joi.number().required(),
            lng: Joi.number().required(),
            distance: Joi.number().default(1),
            scroll: Joi.boolean().default(false),
            where: Joi.array().items(Joi.number()),
        },
    },
    method: 'get',
    path: '/findDistance',
    handler: restaurant.findDistance,
})
api.route({
    meta: meta('Find promotion', 'filter'),
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    validate: {
        query: {
            ...paginationValidation,
            lat: Joi.number().required(),
            lng: Joi.number().required(),
            distance: Joi.number().default(7),
            scroll: Joi.boolean().default(false),
            where: Joi.array().items(Joi.number()),
        },
    },
    method: 'get',
    path: '/findPromotion',
    handler: restaurant.findPromotion,
})

api.route({
    meta: meta('Filter Promocode Rating Cuisines priceRange', 'filter'),
    // pre: async (ctx, next) => await authMiddleware(ctx, next),
    validate: {
        body: {
            promocode: Joi.string(),
            rating: Joi.number(),
            cuisineId: Joi.string(),
            priceRange: Joi.string(),
        },
        type: "json",
    },
    method: 'post',
    path: '/FilterAll',
    handler: restaurant.FilterAll,
})

module.exports = api
