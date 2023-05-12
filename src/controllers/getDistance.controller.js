const { restaurant } = require('./../models')
const Sequelize = require('sequelize')
const axios = require('axios').default;
const openrouteService = require('./../configs/openroute')
const { getPagination } = require('./../utils/common.utils')
module.exports = {
    async calculateDistance(ctx, _next) {
        const data = ctx.request.body
        const restaurantData = await restaurant.findOne({
            where: {
                restaurant_id: data.restaurantId,
            },
        })
        let destination = JSON.stringify({ "locations": [[data.lng, data.lat], [restaurantData.dataValues.lng, restaurantData.dataValues.lat]], "metrics": ["distance"], "units": "km" })
        const header = {
            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
            'Authorization': '',
            'Content-Type': 'application/json; charset=utf-8'
        }
        let routeData = await axios.post(
            openrouteService + 'ors/v2/matrix/driving-car', `${destination}`, {
            headers: header
        }).then(function (response) {
            return response.data.distances[1][0]
        }).catch(function (error) {
            console.log(error);
        });
        console.log(destination)
        // return await routeData
        ctx.body = {
            restaurantName: restaurantData.dataValues.name_primary,
            restaurantId: restaurantData.dataValues.restaurant_id,
            distance: routeData,
            rating: restaurantData.dataValues.rating
        }
        // console.log(routeData)
    }
}