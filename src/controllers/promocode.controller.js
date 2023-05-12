const { promocode, user, trips, restaurant, foodType, restaurantMenu } = require('./../models')
const Sequelize = require('sequelize')
const { getPagination, getElasticsearchPagination } = require('./../utils/common.utils')

const moment = require('moment')
const Dicer = require('dicer')
const { promoCodeDTO } = require('./../dto/es.dto')
const es = require('./../configs/es')
const start = Date.now()
module.exports = {
   async findAll(ctx, _next) {
      try {
         let type = ctx.request.body
         let eType
         console.log(type.eSystemType)
         type.eSystemType == '' || type == null ? (eType = ['Delivery', 'Food']) : (eType = [type.eSystemType])
         // console.log(eType)
         const promocodeData = await promocode.findAll({
            where: {
               eSystemType: eType,
               restaurant_id: 0
            },
         })
         ctx.body = {
            promocode: promocodeData,
         }
      } catch (error) {
         ctx.body = error.message
      }
   },
   async checkPromocode(ctx, _next) {
      try {
         let userStatus
         const body = ctx.request.body
         let food_price = body.food_price
         let delivery_price = body.delivery_price
         let discountPrice = 0
         let net = 0
         const updateUser = async () => {
            await user.update(
               { New_User: 1 },
               {
                  where: {
                     iUserId: body.iUserId,
                  },
               }
            )
         }

         // console.log(body.promocode)
         const promocodeData = await promocode.findOne({
            where: {
               vCouponCode: body.promocode,
               // eStatus: "Active",
            },
         })

         // return
         const userData = await user.findOne({
            where: {
               iUserId: body.iUserId,
            },
         })
         // console.log(promocodeData.dataValues)
         // console.log(userData.dataValues)
         // return
         const newUser = userData.dataValues.New_User
         // console.log(promocodeData)
         newUser == 0 ? (userStatus = 0) : (userStatus = 1)
         // console.log(userStatus)
         // console.log(promocodeData.dataValues.eType)
         //discount food cash
         if (promocodeData.dataValues.eValidityType == 'New_User' && userStatus == 0 && promocodeData.dataValues.discount_type == 'discount_food' && promocodeData.dataValues.eType == 'cash') {
            // console.log("New User")
            // console.log(promocodeData.dataValues.discount_type)
            // ctx.body = "coupon ใช้ได้";
            net = food_price - promocodeData.dataValues.fDiscount

            ctx.body = {
               discountPrice: promocodeData.dataValues.fDiscount,
               discountType: promocodeData.dataValues.eType,
               discountDelivery: 0,
               discountFood: promocodeData.dataValues.fDiscount,
               net: net,
            }

            // ctx.body = discountPrice
            //discount food percentage
         } else if (
            promocodeData.dataValues.eValidityType == 'New_User' &&
            userStatus == 0 &&
            promocodeData.dataValues.discount_type == 'discount_food' &&
            promocodeData.dataValues.eType == 'percentage'
         ) {
            // console.log("New User")
            discountPrice = (promocodeData.dataValues.fDiscount / 100) * food_price
            net = ((100 - promocodeData.dataValues.fDiscount) / 100) * food_price
            // console.log(discountPrice)

            ctx.body = {
               discountPrice: promocodeData.dataValues.fDiscount,
               discountType: promocodeData.dataValues.eType,
               discountDelivery: 0,
               discountFood: discountPrice,
               net: net,
            }
         } else if (
            promocodeData.dataValues.eValidityType == 'New_User' &&
            userStatus == 0 &&
            promocodeData.dataValues.discount_type == 'discount_delivery' &&
            promocodeData.dataValues.eType == 'cash'
         ) {
            net = delivery_price - promocodeData.dataValues.fDiscount
            ctx.body = {
               discountPrice: promocodeData.fDiscount,
               discountType: promocodeData.eType,
               discountDelivery: promocodeData.discount_type,
               discountFood: 0,
               net: net,
            }
         } else if (promocodeData.dataValues.eValidityType == 'New_User' && userStatus == 1) {
            ctx.body = { result: 'Sorry, This Coupon for New User Only.' }
         }

         let today = new Date()
         let to = today.toISOString().split('T')[0]
         // console.log(to)
         const usedCoupon = await trips.findAll({
            where: {
               iUserId: body.iUserId,
               vCouponCode: promocodeData.vCouponCode,
            },
         })
         // console.log(usedCoupon.length)
         if (promocodeData.dataValues.eValidityType == 'Permanent' && promocodeData.dataValues.iUsageLimit <= promocodeData.dataValues.iUsed) {
            ctx.body = 'คูปองนี้ถูกใช้เต็มจำนวน'
         } else if (promocodeData.dataValues.eValidityType == 'Permanent' && usedCoupon.length > 0) {
            ctx.body = 'คูปองนี้ใ้ชงานแล้ว'
         } else if (promocodeData.dataValues.eValidityType == 'Permanent' && promocodeData.dataValues.discount_type == 'discount_food' && promocodeData.dataValues.eType == 'cash') {
            net = food_price - promocodeData.dataValues.fDiscount
            ctx.body = {
               discountPrice: promocodeData.dataValues.fDiscount,
               discountType: promocodeData.dataValues.eType,
               discountDelivery: 0,
               discountFood: promocodeData.dataValues.fDiscount,
               net: net,
            }
         } else if (promocodeData.dataValues.eValidityType == 'Permanent' && promocodeData.dataValues.discount_type == 'discount_food' && promocodeData.dataValues.eType == 'percentage') {
            discountPrice = (promocodeData.dataValues.fDiscount / 100) * food_price
            net = ((100 - promocodeData.dataValues.fDiscount) / 100) * food_price
            console.log(discountPrice)
            ctx.body = {
               discountPrice: promocodeData.dataValuesfDiscount,
               discountType: promocodeData.dataValues.eType,
               discountDelivery: 0,
               discountFood: discountPrice,
               net: net,
            }
         } else if (promocodeData.dataValues.eValidityType == 'Defined' && (to < promocodeData.dataValues.dActiveDate || to > promocodeData.dataValues.dExpiryDate)) {
            ctx.body = 'คูปองนี้หมดอายุ'
         } else if (promocodeData.dataValues.eValidityType == 'Defined' && promocodeData.dataValues.iUsageLimit <= promocodeData.dataValues.iUsed) {
            ctx.body = 'คูปองนี้ถูกใช้เต็มจำนวน'
         } else if (promocodeData.dataValues.eValidityType == 'Defined' && usedCoupon.length > 0) {
            ctx.body = 'คูปองนี้ใ้ชงานแล้ว'
         } else if (promocodeData.dataValues.eValidityType == 'Defined' && promocodeData.dataValues.discount_type == 'discount_food' && promocodeData.dataValues.eType == 'cash') {
            net = food_price - promocodeData.dataValues.fDiscount
            ctx.body = {
               discountPrice: promocodeData.dataValues.fDiscount,
               discountType: promocodeData.dataValues.eType,
               discountDelivery: 0,
               discountFood: promocodeData.dataValues.fDiscount,
               net: net,
            }
         } else if (promocodeData.dataValues.eValidityType == 'Defined' && promocodeData.dataValues.discount_type == 'discount_food' && promocodeData.dataValues.eType == 'percentage') {
            discountPrice = (promocodeData.dataValues.fDiscount / 100) * food_price
            net = ((100 - promocodeData.dataValues.fDiscount) / 100) * food_price
            console.log(discountPrice)
            ctx.body = {
               discountPrice: promocodeData.dataValuesfDiscount,
               discountType: promocodeData.dataValues.eType,
               discountDelivery: 0,
               discountFood: discountPrice,
               net: net,
            }
         }

         const addMinutes = promocodeData.dataValues.promocode_time_limit
         // console.log(addMinutes)

         var d1 = new Date(promocodeData.dataValues.coupon_active_time),
            d2 = new Date(d1)
         d2.setMinutes(d1.getMinutes() + parseInt(addMinutes))
         // console.log(d2);

         let d = d2
            .toISOString()
            .replace(/T/, ' ') // replace T with a space
            .replace(/\..+/, '') // delete the dot and everything after
         console.log(d)

         const current = moment(start).format('YYYY-MM-DD HH:mm:ss')
         console.log(current)
         if (d > current) {
            console.log('less')
         } else {
            console.log('over')
         }

         if (promocodeData.dataValues.eValidityType == 'Time' && promocodeData.dataValues.iUsageLimit <= promocodeData.dataValues.iUsed) {
            ctx.body = 'คูปองนี้ถูกใช้เต็มจำนวน'
         } else if (promocodeData.dataValues.eValidityType == 'Time' && usedCoupon.length > 0) {
            ctx.body = 'คูปองนี้ใ้ชงานแล้ว'
         } else if (promocodeData.dataValues.eValidityType == 'Time' && d < current) {
            ctx.body = 'หมดเวลาการใช้คูปอง'
         } else if (promocodeData.dataValues.eValidityType == 'Time' && promocodeData.dataValues.discount_type == 'discount_food' && promocodeData.dataValues.eType == 'cash') {
            net = food_price - promocodeData.dataValues.fDiscount
            ctx.body = {
               discountPrice: promocodeData.dataValues.fDiscount,
               discountType: promocodeData.dataValues.eType,
               discountDelivery: 0,
               discountFood: promocodeData.dataValues.fDiscount,
               net: net,
            }
         } else if (promocodeData.dataValues.eValidityType == 'Time' && promocodeData.dataValues.discount_type == 'discount_food' && promocodeData.dataValues.eType == 'percentage') {
            discountPrice = (promocodeData.dataValues.fDiscount / 100) * food_price
            net = ((100 - promocodeData.dataValues.fDiscount) / 100) * food_price
            console.log(discountPrice)
            ctx.body = {
               discountPrice: promocodeData.dataValuesfDiscount,
               discountType: promocodeData.dataValues.eType,
               discountDelivery: 0,
               discountFood: discountPrice,
               net: net,
            }
         }

         const currentData = moment(start).format('YYYY-MM-DD')
         // console.log(currentData)
         const dailyCoupon = await trips.findAll({
            where: [
               Sequelize.where(Sequelize.fn('date', Sequelize.col('tTripRequestDate')), '=', currentData),
               {
                  iUserId: body.iUserId,
                  vCouponCode: promocodeData.vCouponCode,
               },
            ],
         })
         console.log(dailyCoupon.length)
         if (promocodeData.dataValues.eValidityType == 'Daily' && promocodeData.dataValues.iUsageLimit <= promocodeData.dataValues.iUsed) {
            ctx.body = 'coupon นี้ใช้เต็มจำนวนแล้ว'
         } else if (promocodeData.dataValues.eValidityType == 'Daily' && dailyCoupon.length > 0) {
            ctx.body = 'คุณใช้ coupon ไปแล้ววันนี้'
         } else if (promocodeData.dataValues.eValidityType == 'Daily' && promocodeData.dataValues.discount_type == 'discount_food' && promocodeData.dataValues.eType == 'cash') {
            net = food_price - promocodeData.dataValues.fDiscount
            ctx.body = {
               discountPrice: promocodeData.dataValues.fDiscount,
               discountType: promocodeData.dataValues.eType,
               discountDelivery: 0,
               discountFood: promocodeData.dataValues.fDiscount,
               net: net,
            }
         } else if (promocodeData.dataValues.eValidityType == 'Daily' && promocodeData.dataValues.discount_type == 'discount_food' && promocodeData.dataValues.eType == 'percentage') {
            discountPrice = (promocodeData.dataValues.fDiscount / 100) * food_price
            net = ((100 - promocodeData.dataValues.fDiscount) / 100) * food_price
            console.log(discountPrice)
            ctx.body = {
               discountPrice: promocodeData.dataValuesfDiscount,
               discountType: promocodeData.dataValues.eType,
               discountDelivery: 0,
               discountFood: discountPrice,
               net: net,
            }
         }
      } catch (error) {
         ctx.body = error.message
      }
   },
   async createBulkElasticsearch(ctx, _next) {
      try {
         const elasticsearchIndex = 'promocode'
         const promoCodeData = await promocode.findAll({ include: [{ model: restaurant, include: [{ model: foodType }, { model: restaurantMenu }] }] })
         const body = promoCodeDTO(promoCodeData).flatMap(doc => [{ index: { _index: elasticsearchIndex, _id: doc.id } }, doc])
         const createdBulk = await es.bulk({ refresh: true, body })

         ctx.body = createdBulk
      } catch (error) {
         ctx.body = error.message
      }
   },

   async searchElasticsearch(ctx, _next) {
      try {
         const { query } = ctx

         // const elasticsearchIndex = 'promocode'
         // const search = await es.search(
         //    {
         //       index: elasticsearchIndex,
         //       ...getElasticsearchPagination(query.from, query.size), q: query.search
         //    },
         //    {
         //       ignore: [404],
         //       maxRetries: 3,
         //    }
         // )
         // const {
         //    body: {
         //       hits: { hits },
         //    },
         // } = search

         // let promoCode = []
         // hits.map(({ _source }) => {
         //    promoCode = [...promoCode, _source.id]
         // })

         const promoCodeData = await promocode.findAll({ where: { vCouponCode: query.search }, include: [{ model: restaurant, include: [{ model: foodType }, { model: restaurantMenu }] }] })
         let response = []
         const baseImage = 'https://www.hubexpress.co/admin/images'
         promoCodeData.map(item => {
            response = [...response, { ...item.dataValues, logo: `${baseImage}/${item.dataValues.logo}`, image: `${baseImage}/${item.dataValues.image}` }]
         })

         ctx.body = { result: response }
      } catch (error) {
         ctx.body = error.message
      }
   },
   async conditionPromocode(ctx, _next) {
      try {
         const query = ctx.request.body
         const array1 = query.promocodeList
         const newData = await array1.map(items => {
            return items.promocode
         });
         console.log(newData);
         const promoCodeData = await promocode.findAll({
            where: {
               vCouponCode: newData
            }
            // where: { vCouponCode: query.promocode },
            // include: [{ model: restaurant, 
            //    include: [{ model: foodType },
            //        { model: restaurantMenu }] }]
         })
         // console.log(promoCodeData)
         // return
         let response = []
         promoCodeData.map(item => {
            let baseImage = ''
            baseImage = 'https://www.hubexpress.co/admin/images'
            response = [...response, {
               iCouponId: item.dataValues.iCouponId,
               vCouponCode: item.dataValues.vCouponCode,
               restaurant_id: item.dataValues.restaurant_id,
               tDescription: JSON.parse(item.dataValues.tDescription),
               fDiscount: item.dataValues.fDiscount,
               iUsageLimit: item.dataValues.iUsageLimit,
               iUsed: item.dataValues.iUsed,
               eStatus: item.dataValues.eStatus,
               logo: `${baseImage}/${item.dataValues.logo}`,
               image: `${baseImage}/${item.dataValues.image}`,
               promocode_type: item.dataValues.promocode_type,
               promocode_tag: item.dataValues.promocode_tag,
               promocode_limit: item.dataValues.promocode_limit,
               promocode_limit_amount: item.dataValues.promocode_limit_amount,
               promocode_time_limit: item.dataValues.promocode_time_limit,
               discount_type: item.dataValues.discount_type,
               paid_type: item.dataValues.paid_type,
               eSystemType: item.dataValues.eSystemType,
               eType: item.dataValues.eType,
               dActiveDate: item.dataValues.dActiveDate,
               dExpiryDate: item.dataValues.dExpiryDate,
               eValidityType: item.dataValues.eValidityType,
               coupon_active_time: item.dataValues.coupon_active_time,
               sub_title: item.dataValues.sub_title,
            }]
         })
         ctx.body = { result: response }
      } catch (error) {
         ctx.body = error.message
      }
   },
}
