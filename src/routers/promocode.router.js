const Router = require('koa-joi-router')
const meta = require('./../utils/meta.utils')
const { promocode } = require('./../controllers')
const authMiddleware = require('../middleware/auth.middleware')
const paginationValidation = require('./../utils/pagination.util')
const Joi = Router.Joi

const api = Router()
api.prefix('/promocode')
// CRUD
api.route({
   meta: meta('promocode list', 'promocode'),
   pre: async (ctx, next) => await authMiddleware(ctx, next),
   method: 'post',
   path: '/promocode',
   validate: {
      body: {
         eSystemType: Joi.string().allow(null).allow(''),
      },
      type: 'json',
   },
   handler: promocode.findAll,
})

api.route({
   meta: meta('check promocode', 'promocode'),
   pre: async (ctx, next) => await authMiddleware(ctx, next),
   method: 'post',
   path: '/check',
   validate: {
      body: {
         iUserId: Joi.number().required(),
         promocode: Joi.string().required(),
         food_price: Joi.number().required(),
         delivery_price: Joi.number().required(),
      },
      type: 'json',
   },
   handler: promocode.checkPromocode,
})

api.route({
   meta: meta('Create all promocode in elasticsearch', 'promocode'),
   method: 'post',
   pre: async (ctx, next) => await authMiddleware(ctx, next),
   path: '/create-bulk',
   handler: promocode.createBulkElasticsearch,
})

api.route({
   meta: meta('Search  promocode in elasticsearch', 'promocode'),
   method: 'get',
   pre: async (ctx, next) => await authMiddleware(ctx, next),
   path: '/search',
   validate: {
      query: {
         search: Joi.string(),
         from: Joi.number().default(0),
         size: Joi.number().default(10)
      },
   },
   handler: promocode.searchElasticsearch,
})

api.route({
   meta: meta('promocode condition', 'promocode'),
   pre: async (ctx, next) => await authMiddleware(ctx, next),
   method: 'post',
   path: '/condition',
   validate: {
      body: {
         promocodeList: Joi.array().items({
            promocode: Joi.string(),
         })
      },
      type: 'json',
   },
   handler: promocode.conditionPromocode,
})





module.exports = api
