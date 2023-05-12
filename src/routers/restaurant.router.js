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
   meta: meta('Filter from elastic search ค้นหาร้านตามเงื่อนไข', 'restaurant'),
   pre: async (ctx, next) => await authMiddleware(ctx, next),
   validate: {
      body: {
         // ...paginationValidation,
         foodCategoryId: Joi.number().required(),
         priceRange: Joi.string().required(),
         rating: Joi.number().required(),
         lat: Joi.number().required(),
         lng: Joi.number().required(),
         distance: Joi.number().default(7),
         scroll: Joi.boolean().default(false)
      },
      type: "json"
   },
   method: 'post',
   path: '/filterElastic',
   handler: restaurant.filterElastic,
})

api.route({
   meta: meta('Find all restaurant from elastic search', 'restaurant'),
   pre: async (ctx, next) => await authMiddleware(ctx, next),
   validate: {
      query: {
         ...paginationValidation,
         lat: Joi.number().required(),
         lng: Joi.number().required(),
         distance: Joi.number().default(20),
         scroll: Joi.boolean().default(false)
      },
   },
   method: 'get',
   path: '/restaurantElastic',
   handler: restaurant.restaurantElastic,
})
api.route({
   meta: meta('Find restaurant by category from elastic search', 'restaurant'),
   pre: async (ctx, next) => await authMiddleware(ctx, next),
   validate: {
      query: { ...paginationValidation, lat: Joi.number().required(), lng: Joi.number().required(), distance: Joi.number().default(7), scroll: Joi.boolean().default(false) },
   },
   method: 'get',
   path: '/categoryElastic',
   handler: restaurant.categoryElastic,
})
api.route({
   meta: meta('deal around by category from elastic search', 'restaurant'),
   pre: async (ctx, next) => await authMiddleware(ctx, next),
   validate: {
      query: { ...paginationValidation, lat: Joi.number().required(), lng: Joi.number().required(), distance: Joi.number().default(7), scroll: Joi.boolean().default(false) },
   },
   method: 'get',
   path: '/dealAroundElastic',
   handler: restaurant.dealAroundElastic,
})
api.route({
   meta: meta('Find all restaurant', 'restaurant'),
   pre: async (ctx, next) => await authMiddleware(ctx, next),
   validate: {
      query: { ...paginationValidation, lat: Joi.number().required(), lng: Joi.number().required(), distance: Joi.number().default(7), scroll: Joi.boolean().default(false) },
   },
   method: 'get',
   path: '/',
   handler: restaurant.findAll,
})

api.route({
   meta: meta('Find all restaurant', 'restaurant'),
   method: 'get',
   path: '/restaurantDetail/:id',
   handler: restaurant.restaurantDetail,
})

api.route({
   meta: meta('Find deal around you restaurant', 'restaurant'),
   pre: async (ctx, next) => await authMiddleware(ctx, next),
   validate: {
      query: { lat: Joi.number().required(), lng: Joi.number().required() },
   },
   method: 'get',
   path: '/dealAroundYou',
   handler: restaurant.findDealAroundYou,
})

api.route({
   meta: meta('Find order again', 'restaurant'),
   pre: async (ctx, next) => await authMiddleware(ctx, next),
   validate: {
      query: { lat: Joi.number().required(), lng: Joi.number().required() },
   },
   method: 'get',
   path: '/orderAgain',
   handler: restaurant.findOrderAgain,
})

api.route({
   meta: meta('Find all restaurant near by 1 km', 'restaurant'),
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
   path: '/nearByOneKm',
   handler: restaurant.findNearByOneKm,
})

api.route({
   meta: meta('Match Current ', 'restaurant'),
   pre: async (ctx, next) => await authMiddleware(ctx, next),
   validate: {
      query: {
         userId: Joi.number().required(),
         lat: Joi.number().required(),
         lng: Joi.number().required(),
         distance: Joi.number().default(1),
         scroll: Joi.boolean().default(false),
         where: Joi.array().items(Joi.number()),
      },
   },
   method: 'get',
   path: '/matchCurrent',
   handler: restaurant.matchCurrent,
})


api.route({
   meta: meta('Search restaurant by elasticsearch', 'restaurant'),
   // pre: async (ctx, next) => await authMiddleware(ctx, next),
   validate: {
      query: {
         search: Joi.string().required(),
         from: Joi.number().default(0),
         size: Joi.number().required().default(10),
         lat: Joi.number().required(),
         lng: Joi.number().required(),
      },
   },
   method: 'get',
   path: '/search',
   handler: restaurant.elasticsearch,
})
api.route({
   meta: meta('Suggestion from elasticsearch', 'restaurant'),
   // pre: async (ctx, next) => await authMiddleware(ctx, next),
   validate: {
      query: {
         search: Joi.string().required(),
         from: Joi.number().default(0),
         size: Joi.number().required().default(1000),
         // menu: Joi.string().required().default("restaurant_menus.menu_name"),
         // lat: Joi.number().required(),
         // lng: Joi.number().required(),
      },
   },
   method: 'get',
   path: '/suggestion',
   handler: restaurant.suggestion,
})

api.route({
   meta: meta('Search restaurant suggest db', 'restaurant'),
   // pre: async (ctx, next) => await authMiddleware(ctx, next),
   validate: {
      query: {
         search: Joi.string().required(),
         from: Joi.number().default(0),
         size: Joi.number().required().default(10),
         // menu: Joi.string().required().default("restaurant_menus.menu_name"),
         // lat: Joi.number().required(),
         // lng: Joi.number().required(),
      },
   },
   method: 'get',
   path: '/suggestionserver',
   handler: restaurant.suggestionserver,
})
api.route({
   meta: meta('Find all restaurant near by category', 'restaurant'),
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
   path: '/nearByCategory',
   handler: restaurant.findRestaurantByCategory,
})
api.route({
   meta: meta('Find branch from elasticsearch', 'restaurant'),
   pre: async (ctx, next) => await authMiddleware(ctx, next),
   validate: {
      query: {
         lat: Joi.number().required(), lng: Joi.number().required(),
         branchId: Joi.number().required(),
      },
   },
   method: 'get',
   path: '/branchElastic',
   handler: restaurant.branchElastic,
})
api.route({
   meta: meta('Elasticsearch create restaurant bulk', 'restaurant'),
   pre: async (ctx, next) => await authMiddleware(ctx, next),
   method: 'post',
   path: '/create-restaurant-bulk',
   handler: restaurant.esRestaurantCreateAllBulk,
})
module.exports = api
