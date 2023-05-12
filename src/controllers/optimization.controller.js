const { faqs } = require("./../models");
const Sequelize = require("sequelize");
module.exports = {
    async findAll(ctx, _next) {
        try {
            const data = ctx.request.body
            // console.log(data)
            const axios = require('axios').default;
            // let destination = '{ "jobs": [{ "id": 1, "service": 300, "amount": [1], "location": [1.98935, 48.701], "skills": [1], "time_windows": [[32400, 36000]] }, { "id": 2, "service": 300, "amount": [1], "location": [2.03655, 48.61128], "skills": [1] }, { "id": 3, "service": 300, "amount": [1], "location": [2.39719, 49.07611], "skills": [2] }, { "id": 4, "service": 300, "amount": [1], "location": [2.41808, 49.22619], "skills": [2] }, { "id": 5, "service": 300, "amount": [1], "location": [2.28325, 48.5958], "skills": [14] }, { "id": 6, "service": 300, "amount": [1], "location": [2.89357, 48.90736], "skills": [14] }], "vehicles": [{ "id": 1, "profile": "driving-car", "start": [2.35044, 48.71764], "end": [2.35044, 48.71764], "capacity": [4], "skills": [1, 14], "time_window": [28800, 43200] }] }'
            let destination = JSON.stringify(ctx.request.body)
            const header = {
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                'Authorization': '5b3ce3597851110001cf624814d13839107e44dc8881bead9d61b803',
                'Content-Type': 'application/json; charset=utf-8'
            }
            let routeData = await axios.post(
                'https://api.openrouteservice.org/optimization', `${destination}`, {
                headers: header
            }).then(function (response) {
                return response
            }).catch(function (error) {
                console.log(error);
            });
            // console.log(routeData.data.summary.cost)
            console.log(routeData.data.routes[0].steps)

            // return
            const priceData = 44 + (parseInt(routeData.data.summary.cost) / 1000 - 4) * 8
            // console.log(routeData.routes)
            // console.log(routeData.data.routes[0].steps)
            let jobData = []
            routeData.data.routes[0].steps.map(async (data, i) => {
                jobData.push(data.location)
                // console.log(data.location)
            })
            // console.log(jobData)
            let destination1 = JSON.stringify({ "coordinates": jobData, "units": "km" })
            // let destination1 = { "coordinates": [[8.681495, 49.41461], [8.686507, 49.41943], [8.687872, 49.420318]], "units": "km" }
            // console.log(destination1)
            // return
            const header1 = {
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                'Authorization': '5b3ce3597851110001cf624814d13839107e44dc8881bead9d61b803',
                'Content-Type': 'application/json; charset=utf-8'
            }
            let routeData1 = await axios.post(
                'https://api.openrouteservice.org/v2/directions/driving-car', `${destination1}`, {
                headers: header1
            }).then(function (response) {
                // console.log(response)
                return response
            }).catch(function (error) {
                console.log(error);
            });
            console.log(routeData1.data.routes[0].summary.distance)
            const priceTotal = 44 + (parseFloat(routeData1.data.routes[0].summary.distance) - 4) * 8
            // console.log(routeData1.data.distances)
            ctx.body = {
                price: priceTotal,
                distance: routeData1.data.routes[0].summary.distance,
                steps: routeData.data.routes[0].steps
            }
        } catch {
        }
    }
}