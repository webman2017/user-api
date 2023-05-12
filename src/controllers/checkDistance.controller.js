const { delivery, deliverySave, deliverySaveDetail, activities } = require("./../models");
const { calculateGoogleMapDistance } = require("./../utils/common.utils");
const { x } = require("joi");
const Sequelize = require("sequelize");
const axios = require('axios').default;
module.exports = {

    async checkDistance(ctx, _next) {
        const destinationData = ctx.request.body.destination

        console.log(destinationData[0].lat)
        console.log(destinationData[0].lng)
        console.log(destinationData[1].lat)
        console.log(destinationData[1].lng)
        // return

        let destinationSource = []
        destinationSource.push([destinationData[0].lng, destinationData[0].lat], [destinationData[1].lng, destinationData[1].lat])


        // destinationData.map(async (data, i) => {

        //     console.log(data[0].lat)
        //     console.log(data[1].lat)
        //     // destinationSource.push([data[0].lng, data[0].lat])
        // })
        console.log(destinationSource)
        // return
        let destination = JSON.stringify({ "coordinates": destinationSource, "units": "km" })
        const header = {
            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
            'Authorization': '5b3ce3597851110001cf624814d13839107e44dc8881bead9d61b803',
            'Content-Type': 'application/json; charset=utf-8'
        }
        let routeData = await axios.post(
            'https://api.openrouteservice.org/v2/directions/driving-car', `${destination}`, {
            headers: header
        }).then(function (response) {
            // console.log(response.data.routes[0].summary.distance)
            // return
            return response.data.routes[0].summary.distance
        }).catch(function (error) {
            console.log(error);
        });

        console.log(routeData)
        if (routeData > 30) {
            ctx.body = {
                result: false,
                distance: routeData,
                message: "ระยะทางเกิน 30 กม"
            }
        } else {
            ctx.body = {
                result: true,
                distance: routeData,
                message: "ระยะทางเกินไม่เกิน 30 กม สามารถจัดส่งได้"
            }
        }
    }
}