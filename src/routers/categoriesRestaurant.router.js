const Router = require('koa-joi-router')
const meta = require('./../utils/meta.utils')
const { categoriesRestaurant } = require('./../controllers')
const authMiddleware = require('../middleware/auth.middleware')
let Joi = Router.Joi
const api = Router()
api.prefix('/category')
// CRUD

api.route({
    meta: meta('Restuarant Category', 'Category'),
    method: 'get',
    pre: async (ctx, next) => await authMiddleware(ctx, next),
    path: '/',
    handler: categoriesRestaurant.category,
})

module.exports = api