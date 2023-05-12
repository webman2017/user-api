const { delivery, deliverySave, deliverySaveDetail, activities } = require("./../models");
const { calculateGoogleMapDistance } = require("./../utils/common.utils");
const { x } = require("joi");
const Sequelize = require("sequelize");
const sumPrice = async (values) => {
    let total = 0
    let totalPrice = 0
    const promise = values.map(async (data, i) => {
        let index = values.indexOf(data);
        let nextPersonName = values[index + 1];
        if (i !== values.length - 1) {
            const distance = await calculateGoogleMapDistance(
                data,
                nextPersonName
            );
            // console.log('ระยะทาง', distance)
            totalPrice = distance <= 4 ? 44 : 44 + (distance - 4) * 8
            // console.log(totalPrice)
            total += Number(totalPrice)
        }
        return total
        // return distance
    })
    return await Promise.all(promise)
}
module.exports = {
    async deliveryRate(ctx, _next) {
        try {
            const axios = require('axios').default;
            const data = ctx.request.body
            const destinationData = data.destination
            let destinationSource = []
            destinationData.map(async (data, i) => {
                // console.log(data)
                // console.log(data.lat)
                // console.log(data.lng)
                destinationSource.push([data.lng, data.lat])
                // let index = destinationData.indexOf(data);
                // console.log(index)
            })
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
                console.log(response.data.routes[0].summary.distance)

                // return
                return response.data.routes[0].summary.distance
            }).catch(function (error) {
                console.log(error);
            });
            // console.log(response.data.routes[0].summary.distance)
            // var lodash = require('lodash');
            // var sum = lodash.sum(routeData.distances[0]);
            // console.log(sum);
            if (routeData > 4) {
                var priceTotal = 44 + (parseFloat(routeData) - 4) * 8
                ctx.body = { price: priceTotal, distance: routeData }
            } else {
                ctx.body = { price: 44, distance: routeData }
            }

            return
            return await routeData
            const body = ctx.request.body;
            const deliveryData = await delivery.findOne({
                where: {
                    vVehicleType: "HubEat",
                },
            });
            // if (body.destination.length == 1) {
            //     // const distanceOne = async () => {
            //     const distance = await calculateGoogleMapDistance(
            //         body.source,
            //         body.destination[0]
            //     );
            //     console.log(distance)
            //     const basePrice = deliveryData.BasePriceMin;
            //     const StartMinKM = deliveryData.StartMinKM
            //     priceRate = distance > StartMinKM ? (distance - StartMinKM) * deliveryData.PricePerKM + basePrice : basePrice;
            //     // return priceRate
            //     // ctx.body = priceRate
            // } else {

            // let total = 0
            // body.destination.forEach(async function (data, i,) {
            //     let totalPrice = 0
            //     // console.log(data)
            //     var index = body.destination.indexOf(data);
            //     // console.log(data)
            //     var nextPersonName = body.destination[index + 1];
            //     if (i !== body.destination.length - 1) {
            //         const distance = await calculateGoogleMapDistance(
            //             data,
            //             nextPersonName
            //         );
            //         console.log('ระยะทาง', distance)
            //         totalPrice = distance <= 4 ? 44 : 44 + (distance - 4) * 8
            //         console.log(totalPrice)
            //         total += Number(totalPrice)
            //         console.log({ total })
            //     }
            // })
            let a = await sumPrice(body.destination)
            console.log(a)
            // return
            ctx.body = { price: Math.max(...a) }
        } catch (error) {
            ctx.body = error.message;
        }
    },
}
