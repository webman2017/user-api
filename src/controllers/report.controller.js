const { bannerImpression } = require('./../models')
const Sequelize = require('sequelize')
module.exports = {
   async createBannerReport(ctx, _next) {
      try {
         const { body } = ctx.request
         const create = await bannerImpression.create({
            iAdvertBannerId: body.bannerId,
            vIP: body.ip,
            eUserType: body.type,
            iUserId: body.userId,
         })
         ctx.body = {
            message: 'success',
            data: { ...create.dataValues },
         }
      } catch (error) {
         ctx.body = error.message
      }
   },
}
