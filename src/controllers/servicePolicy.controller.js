const { servicePolicy } = require('./../models')
const Sequelize = require('sequelize')
module.exports = {
    async findAll(ctx, _next) {
        try {
            const pages = await servicePolicy.findAll({
                where: {
                    iPageId: [4, 33]
                }
            })
            ctx.body = pages
        } catch (error) {
            ctx.body = error.message
        }
    }
}