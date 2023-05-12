const { banner, bannerRestaurant, restaurant } = require('./../models')
const Sequelize = require('sequelize')
const { getPagination } = require('./../utils/common.utils')
module.exports = {
   async findAll(ctx, _next) {
      try {
         const { query } = ctx
         const queryOptions = getPagination(query.page, query.limit)
         const data = []
         const bannerData = await banner.findAll(
            {
               // ...queryOptions,
               where: {
                  ePosition: query.type,
                  eStatus: query.status
               }
            })
         const baseUrl = 'https://www.hubexpress.co/webimages/upload/AdvImages'
         bannerData.map(item => data.push({ ...item.dataValues, image: `${baseUrl}/${item.vBannerImage}` }))
         console.log(data)
         ctx.body = {
            message: 'success',
            data: { ...query, count: data.length, items: data },
         }
      } catch (error) {
         ctx.body = error.message
      }
   },
   async findShortCut(ctx, _next) {
      try {
         const data = []
         const shortCut = await banner.findAll({
            where: {
               ePosition: "Foodicon",
            },
         });
         const baseUrl = 'https://www.hubexpress.co/webimages/upload/AdvImages'
         shortCut.map(item => data.push({ ...item.dataValues, image: `${baseUrl}/${item.vBannerImage}` }))



         ctx.body = data
      } catch (error) {
         ctx.body = error.message
      }
   },
   async bannerRestaurant(ctx, _next) {
      try {
         const requestData = ctx.request.params

         const bannerData = await bannerRestaurant.findAll({
            include: [
               // { model: banner, paranoid: false },
               { model: restaurant, paranoid: false },

            ],
            where: {
               banner_id: requestData.id,
            },
         })
         console.log(bannerData)
         ctx.body = bannerData
      } catch (error) {
         ctx.body = error.message
      }

   }

}
