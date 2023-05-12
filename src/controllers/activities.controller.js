const { activities, orders, driver, orderDetails, restaurant, deliverySave, deliverySaveDetail } = require("./../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op
const { getPagination } = require('./../utils/common.utils')
module.exports = {
    async findAll(ctx, _next) {
        try {
            const { query } = ctx
            const { id } = ctx.params;
            console.log(id)

            // return
            const queryOptions = getPagination(query.page, query.limit)
            // const typeFilter = query.type && { eType: query.type }
            // const eStatus = query.status && { eStatus: query.status }
            const data = []
            const data1 = []
            const bannerData = await activities.findAll(
                {
                    include: [{
                        model: driver, paranoid: false
                    }],
                    include: [
                        { model: deliverySave, paranoid: false, include: [{ model: deliverySaveDetail, paranoid: false }] },
                    ],
                    // ...queryOptions,

                    where: {
                        // ...typeFilter, ...eStatus,
                        iUserId: id,
                        // iDriverId: { [Op.ne]: 0 }
                    }
                })
            console.log(bannerData)
            // return
            const resultData = bannerData.map(item => item.dataValues)
            console.log(resultData)
            // return
            // bannerData.map(item => data.push({ ...item.dataValues.delivery.dataValues.delivery_detail }))
            ctx.body = {
                deliveryDetail: resultData
            }
        } catch (error) {
            ctx.body = error.message;
        }
    },
    async foodActivity(ctx, _next) {
        try {
            const dataId = ctx.request.params
            console.log(dataId)
            const bannerData = await activities.findAll(
                {
                    include: [{
                        model: driver
                    },
                    {
                        model: orders,
                        include: [
                            {
                                model: orderDetails, paranoid: false
                            },
                            {
                                model: restaurant, paranoid: false
                            }],
                        // right: true,
                        // include: [{ model: orderDetails, paranoid: false }],
                    },
                    ],
                    where: {
                        iUserId: dataId.id,
                    }
                })
            ctx.body = bannerData
        } catch (error) {
            ctx.body = error.message;
        }
    }
}
