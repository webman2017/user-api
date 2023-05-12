const Router = require('koa-joi-router')
const meta = require('./../utils/meta.utils')
const { banner } = require('./../controllers')
const authMiddleware = require('../middleware/auth.middleware')
const paginationValidation = require('./../utils/pagination.util')
const Joi = Router.Joi

const api = Router()
api.prefix('/banner')

api.route({
   meta: meta('Find all banner', 'banner'),
   method: 'get',
   pre: async (ctx, next) => await authMiddleware(ctx, next),
   path: '/',
   validate: {
      query: {
         ...paginationValidation,
         type: Joi.string().valid(['MainPopup', 'MainSlider', 'MainPromotion', 'FoodSlider', 'MainPopular', 'Foodicon', 'DeliverySlider', 'DriverSlider']),
         status: Joi.string().valid(['Active', 'Inactive'])
      },
   },
   handler: banner.findAll,
})


api.route({
   meta: meta('shortcut icon', 'banner'),
   method: 'get',
   pre: async (ctx, next) => await authMiddleware(ctx, next),
   path: '/shortcut',

   handler: banner.findShortCut,
})

api.route({
   meta: meta('banner restaurnt', 'banner'),
   method: 'get',
   pre: async (ctx, next) => await authMiddleware(ctx, next),
   path: '/bannerRestaurnt/:id',

   handler: banner.bannerRestaurant,
})


module.exports = api
