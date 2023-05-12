const Router = require('koa-joi-router')
const meta = require('./../utils/meta.utils')
const { report } = require('./../controllers')
const authMiddleware = require('../middleware/auth.middleware')
const paginationValidation = require('./../utils/pagination.util')
const Joi = Router.Joi

const api = Router()
api.prefix('/report')
// CRUD
api.route({
   meta: meta('Save report banner', 'report'),
   pre: async (ctx, next) => await authMiddleware(ctx, next), 
   method: 'post',
   path: '/banner',
   validate: {
      body: {
         userId: Joi.number().required(),
         bannerId: Joi.number().required(),
         ip: Joi.string().required(),
         type: Joi.string().valid(['Passenger', 'Driver', 'Store']).required(),
      },
      type: 'json',
   },
   handler: report.createBannerReport,
})

module.exports = api
