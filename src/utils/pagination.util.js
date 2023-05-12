const Router = require('koa-joi-router')
const Joi = Router.Joi

module.exports = {
    limit: Joi.number().default(10),
    page: Joi.number().default(1),
    search: Joi.string(),
    filter: Joi.number()
}