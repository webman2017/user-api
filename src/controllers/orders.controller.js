const { activities, orders, orderDetails, delivery, restaurant } = require("./../models");
const Sequelize = require("sequelize");
const { object } = require("joi");
const { calculateGoogleMapDistance } = require("./../utils/common.utils");
const database = require("../configs/firebaseConfig");
const { ref, set, onValue, update } = require("firebase/database");
const moment = require("moment");
const sumPrice = async (values) => {
    let total = 0
    let totalPrice = 0
    const deliveryData = await delivery.findOne({
        where: {
            vVehicleType: "HubExpress",
        },
    });
    const basePrice = deliveryData.BasePriceMin;
    const StartMinKM = deliveryData.StartMinKM
    const PricePerKM = deliveryData.PricePerKM
    const promise = values.map(async (data, i) => {
        let index = values.indexOf(data);
        let nextPersonName = values[index + 1];
        if (i !== values.length - 1 && i < 2) {
            const distance = await calculateGoogleMapDistance(
                data,
                nextPersonName
            );
            console.log('ระยะทาง', distance)
            totalPrice = distance <= StartMinKM ? basePrice : basePrice + (distance - StartMinKM) * PricePerKM
            // console.log(totalPrice)
            total += Number(totalPrice)
            console.log(total)
        } else if (i !== values.length - 1 && i >= 2) {
            //  else {
            total += Number(basePrice)
        }
        // console.log(total)
        return total
    })
    return await Promise.all(promise)
}
// }
// return restaurantStatus
const restaurantD = async (restaurant_id) => {
    const restaurantData = await restaurant.findOne({
        where: {
            restaurant_id: restaurant_id,
        },
    });
    return restaurantData
}
module.exports = {
    async orderFood(ctx, _next) {
        try {
            let orderData = ctx.request.body;
            const d = new Date();
            let day = d.getDay()
            let status
            resultStatus = []
            console.log(day)
            const currentTimeString = moment().tz('Asia/Bangkok').format('HH:mm:ss')
            const restaurantId = await orderData.orders.map(menus => menus.restaurant_id)
            console.log(restaurantId)
            // return
            const restaurantData = await restaurant.findAll({
                where: {
                    restaurant_id: restaurantId
                }
            })
            menuResult = []
            restaurantData.forEach((element) => {
                console.log(element.restaurant_id)
                console.log(element.tMonStartTime)

                if (day == 1 && (currentTimeString > element.tMonStartTime && currentTimeString > element.tMonEndTime) || currentTimeString < element.tMonStartTime && currentTimeString > element.tMonEndTime) {
                    menuResult.push({ 'restaurant_id': element.restaurant_id, 'restaurant_name': element.name_primary, 'monStart': element.tMonStartTime, 'monEnd': element.tMonEndTime, 'status': 'close' })

                } else if (day == 2 && (currentTimeString > element.tTueStartTime && currentTimeString > element.tTueEndTime) || currentTimeString < element.tTueStartTime && currentTimeString > element.tTueEndTime) {
                    menuResult.push({ 'restaurant_id': element.restaurant_id, 'restaurant_name': element.name_primary, 'tueStart': element.tTueStartTime, 'tueEnd': element.tTueEndTime, 'status': 'close' })

                } else if (day == 3 && (currentTimeString > element.tWedStartTime && currentTimeString > element.tWedEndTime) || currentTimeString < element.tWedStartTime && currentTimeString > element.tWedEndTime) {
                    menuResult.push({ 'restaurant_id': element.restaurant_id, 'restaurant_name': element.name_primary, 'wedStart': element.tMonStartTime, 'wedEnd': element.tMonEndTime, 'status': 'close' })

                } else if (day == 4 && (currentTimeString > element.tThuStartTime && currentTimeString > element.tThuEndTime) || currentTimeString < element.tThuStartTime && currentTimeString > element.tThuEndTime) {
                    menuResult.push({ 'restaurant_id': element.restaurant_id, 'restaurant_name': element.name_primary, 'monStart': element.tThuStartTime, 'monEnd': element.tThuEndTime, 'status': 'close' }
                    )
                } else if (day == 5 && (currentTimeString > element.tFriStartTime && currentTimeString > element.tFriEndTime) || currentTimeString < element.tFriStartTime && currentTimeString > element.tFriEndTime) {
                    menuResult.push({ 'restaurant_id': element.restaurant_id, 'restaurant_name': element.name_primary, 'monStart': element.tThuStartTime, 'monEnd': element.tThuEndTime, 'status': 'close' }
                    )
                } else if (day == 6 && (currentTimeString > element.tFriStartTime && currentTimeString > element.tFriEndTime) || currentTimeString < element.tFriStartTime && currentTimeString > element.tFriEndTime) {
                    menuResult.push({ 'restaurant_id': element.restaurant_id, 'restaurant_name': element.name_primary, 'monStart': element.tThuStartTime, 'monEnd': element.tThuEndTime, 'status': 'close' }
                    )
                } else if (day == 7 && (currentTimeString > element.tFriStartTime && currentTimeString > element.tFriEndTime) || currentTimeString < element.tFriStartTime && currentTimeString > element.tFriEndTime) {
                    menuResult.push({ 'restaurant_id': element.restaurant_id, 'restaurant_name': element.name_primary, 'monStart': element.tThuStartTime, 'monEnd': element.tThuEndTime, 'status': 'close' }
                    )
                }
                // const filterMenu = groupNameData.filter(restaurantData => restaurantData.tMonStartTime == element.dataValues.menu_id);
                // filterMenu.length > 0 ? menuResult.push({ ...element.dataValues, groupName: getMenuGroup }) : menuResult.push({ ...element.dataValues, groupName: [] })
            })
            if (menuResult == null || menuResult == "") {
                let dataRestaurant = [];
                await orderData.orders.forEach(function (data) {
                    console.log(data.location.lat)
                    console.log(data.location.lng)
                    // console.log(data)
                    dataRestaurant.push({
                        address: data.address,
                        message: data.message,
                        id: data.restaurant_id,
                        location: { lat: data.location.lat, lng: data.location.lng },
                        name: "",
                        order: data.orderdetails
                    })
                })

                console.log(dataRestaurant)
                let dataUser =
                {
                    iUserId: orderData.user_id,
                    vSenderName: orderData.sender,
                    vSenderMobile: orderData.senderMobile,
                    vDestLatitude: orderData.latitude,
                    vDestLongitude: orderData.longitude,
                    tDestAddress: orderData.userAddress
                }

                const firebaseData = {
                    created: Date.now(),
                    deliveryFee: "",
                    id: "",
                    message: "",
                    paymentMethod: orderData.paymentMethod,
                    promoCode: orderData.promoCode,
                    restaurant: dataRestaurant,
                    status: "",
                    subTotal: orderData.subTotal,
                    total: orderData.total,
                    type: orderData.type,
                    updated: Date.now(),
                    user: dataUser
                }
                console.log(firebaseData)
                const createOrdersDetails = async (param) => {
                    await orderDetails.create(param[0]);
                }
                const createOrders = async (param) => {
                    // console.log(param[0])
                    await orders.create(param[0])
                        .then(async function (responseOrders) {
                            // console.log(responseOrders);
                            // console.log(param[0].orderdetails)
                            await param[0].orderdetails.forEach(function (data) {
                                // console.log(data)

                                const dataItem = [{ ...data, order_id: responseOrders.null }];
                                createOrdersDetails(dataItem);
                            });
                        });
                };
                let requestId = await activities.create(dataUser, {}).then(async function (response) {

                    await orderData.orders.forEach(function (data) {
                        // console.log(data)
                        const dataItem = [{ ...data, iCabRequestId: response.null }];
                        createOrders(dataItem);
                    });

                    return response.null
                });

                // console.log(requestId)
                // get data -------
                //   const starCountRef = ref(database, "transactions/hub1633587680781");
                //   onValue(starCountRef, (snapshot) => {
                //     const data = snapshot.val();
                //     console.log({ data });
                //   });
                //   -------------------
                // const status = 1;
                // update(ref(database, "transactions/hub1633667574708"), {
                //     status: status,
                //     updated: Date.now(),
                // });

                // insert data ----------
                set(ref(database, "transactions/" + requestId + ""), firebaseData);
                // --------------
                ctx.body = { message: "orders success", orderData: firebaseData };
            } else {
                ctx.body = { 'orderRestaurantStatus': menuResult }
            }

        } catch (error) {
            ctx.body = error.message;
        }
    },
    async OrderRate(ctx, _next) {
        try {
            const body = ctx.request.body;
            const deliveryData = await delivery.findOne({
                where: {
                    vVehicleType: "HubExpress",
                },
            });
            const basePrice = deliveryData.BasePriceMin;
            // console.log(body.destination)
            let a = await sumPrice(body.destination)
            ctx.body = { price: Math.max(...a), 'baseprice': basePrice }
        } catch (error) {
            ctx.body = error.message;
        }
    },
};
