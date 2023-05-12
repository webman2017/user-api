const { favorite, restaurant, promotion, promocode, foodType, categoriesRestaurant, categoriesRestaurant2, restaurantMenu } = require("./../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op
const { getPagination } = require('./../utils/common.utils')
const moment = require("moment");
const es = require('./../configs/es');
const { async } = require("@firebase/util");
const { where } = require("sequelize");

var currentTimeString = moment().tz('Asia/Bangkok').format('HH:mm:ss')
module.exports = {
    async findAll(ctx, _next) {
        try {
            const allData = ctx.request.body
            const userFavorite = await favorite.findOne({
                where: {
                    user_id: allData.userID,
                },
            })
            if (userFavorite == null) {
                ctx.body = { result: "ไม่พบร้านที่ Favorite" }
            } else {
                var arrayRestaurantId = JSON.parse(userFavorite.dataValues.restaurant_id);
                console.log(arrayRestaurantId)
                const restaurantDetail = await es.search(
                    {
                        index: 'restaurant',
                        body: {
                            query: {
                                terms: {
                                    restaurant_id: arrayRestaurantId
                                }
                            }
                        }
                    })
                ctx.body = restaurantDetail.body.hits.hits
            }
            // return
            // let favoriteData = []
            // favoriteData.push(userFavorite.dataValues.restaurant_id)
            // if (userFavorite !== null) {
            //     console.log(favoriteData)
            //     favoriteData.push(allData.restaurantId)

            //     console.log(favoriteData)

            //     const saveFav = await favorite.update(
            //         {
            //             restaurant_id: favoriteData
            //         },
            //         {
            //             where:
            //             {
            //                 user_id: allData.userID
            //             }
            //         })
            //     // }
            //     console.log('xxx')
            // } else {
            //     console.log('zzz')
            // }
            // return




            // console.log(userFavorite)

            return


            let restaurantData = []
            restaurantData.push(allData.restaurantId)
            console.log(restaurantData)
            const saveFav = await favorite.create({
                restaurant_id: JSON.stringify(restaurantData),
            })
            return
            if (allData.action == "create") {
                const saveFav = await favorite.create({
                    user_id: allData.userID,
                    restaurant_id: allData.restaurantId,
                    created_at: currentTimeString
                })
                console.log(saveFav.dataValues.fave_id)
                const restaurantResponse = await restaurant.findOne({
                    where: {
                        restaurant_id: allData.restaurantId,
                    },
                    include: [
                        { model: promotion, paranoid: false, attributes: ['promotion_name'] },
                        { model: promocode, paranoid: false, attributes: ['vCouponCode', 'tDescription', 'fDiscount', 'iUsageLimit', 'iUsed', 'eSystemType', 'eType', 'logo', 'image', 'promocode_type', 'promocode_tag', 'promocode_limit', 'promocode_limit_amount', 'discount_type', 'dActiveDate', 'dExpiryDate'] },
                        { model: foodType, paranoid: false },
                        { model: categoriesRestaurant, paranoid: false, attributes: ['cat_id', 'cat_name', 'emoji'] },
                        { model: categoriesRestaurant2, paranoid: false, attributes: ['cat_id', 'cat_name', 'emoji'] },
                        { model: restaurantMenu, paranoid: false },
                        // { model: groupName, paranoid: false }
                        //     include: { model: addOn, paranoid: false }
                        // },
                        // { model: groupName, paranoid: false },
                    ],
                })
                console.log(restaurantResponse.dataValues.promotions)
                // console.log(restaurantResponse.categories_restaurant.emoji)
                const fs = require("fs");
                let rawdata = fs.readFileSync('./emojis.json')
                let users = JSON.parse(rawdata)

                const obj = users.emojis.find(element => {
                    let elementArr = element.html.replace(';', ';|')
                    const elementArrSpit = elementArr.split('|');
                    var term = restaurantResponse.dataValues.categories_restaurant.emoji; // search term (regex pattern)
                    var search = new RegExp(term, 'i'); // prepare a regex object
                    let b = elementArrSpit.filter(item => search.test(item));
                    if (b.length > 0) {
                        return element
                    } else {
                        return null
                    }
                });

                const obj2 = users.emojis.find(element => {
                    let elementArr = element.html.replace(';', ';|')
                    const elementArrSpit = elementArr.split('|');
                    var term = restaurantResponse.dataValues.categories_restaurant2.emoji; // search term (regex pattern)
                    var search = new RegExp(term, 'i'); // prepare a regex object
                    let b = elementArrSpit.filter(item => search.test(item));
                    if (b.length > 0) {
                        return element
                    } else {
                        return null
                    }
                });


                ctx.body = {
                    fave_id: saveFav.dataValues.fave_id,
                    userID: allData.userID,
                    currentTime: currentTimeString,

                    emoji_category: obj,
                    emoji_category2: obj2,
                    foodTypeFilter: restaurantResponse.dataValues.food_type.dataValues,
                    menu: restaurantResponse.dataValues.restaurant_menus,
                    restaurant: {
                        address: restaurantResponse.dataValues.address,
                        callablePhoneno: restaurantResponse.dataValues.callablePhoneno,
                        cateID: restaurantResponse.dataValues.cateID,
                        cateID2: restaurantResponse.dataValues.cateID2,
                        categories_restaurant: restaurantResponse.dataValues.categories_restaurant.dataValues,
                        categories_restaurant2: restaurantResponse.dataValues.categories_restaurant2.dataValues,
                        coupons: restaurantResponse.dataValues.coupons,


                        "defaultPhotosmallUrl": "https://www.hubexpress.co/webimages/upload/restaurant/1644205191.jpg",
                        deliveryPrice: 44,
                        distance: "0.15",
                        ePickStatus: restaurantResponse.dataValues.ePickStatus,
                        email: restaurantResponse.dataValues.email,
                        food_type: restaurantResponse.dataValues.food_type,
                        googleMapDistance: "NaN",
                        guarantee: restaurantResponse.dataValues.guarantee,
                        instagram: restaurantResponse.dataValues.instagram,
                        lat: restaurantResponse.dataValues.lat,
                        line: restaurantResponse.dataValues.line,
                        lng: restaurantResponse.dataValues.lng,
                        name_primary: restaurantResponse.dataValues.name_primary,
                        open_status: restaurantResponse.dataValues.open_status,
                        priceRange: restaurantResponse.dataValues.priceRange,
                        price_range: restaurantResponse.dataValues.price_range,

                        promotions: restaurantResponse.dataValues.promotions,

                        rating: restaurantResponse.dataValues.rating,
                        restaurantStatus: restaurantResponse.dataValues.restaurantStatus,
                        restaurant_id: restaurantResponse.dataValues.restaurant_id,
                        tFriEndTime: restaurantResponse.dataValues.tFriEndTime,
                        tFriStartTime: restaurantResponse.dataValues.tFriStartTime,
                        tMonEndTime: restaurantResponse.dataValues.tMonEndTime,
                        tMonStartTime: restaurantResponse.dataValues.tMonStartTime,
                        tSatEndTime: restaurantResponse.dataValues.tSatEndTime,
                        tSatStartTime: restaurantResponse.dataValues.tSatStartTime,
                        tSunEndTime: restaurantResponse.dataValues.tSunEndTime,
                        tSunStartTime: restaurantResponse.dataValues.tSunStartTime,
                        tThuEndTime: restaurantResponse.dataValues.tThuEndTime,
                        tThuStartTime: restaurantResponse.dataValues.tThuStartTime,
                        tTueEndTime: restaurantResponse.dataValues.tTueEndTime,
                        tTueStartTime: restaurantResponse.dataValues.tTueStartTime,
                        tWedEndTime: restaurantResponse.dataValues.tWedEndTime,
                        tWedStartTime: restaurantResponse.dataValues.tWedStartTime,
                        tag1: restaurantResponse.dataValues.tag1,
                        tag2: restaurantResponse.dataValues.tag2,
                        verify: restaurantResponse.dataValues.verify,

                    },
                    restaurantStatus: 5,
                    status: "We are open",
                    statusNumber: 1
                }
            } else if (allData.action == "destroy" && allData.fave_id !== 0) {
                const res = await favorite.destroy({
                    where: {
                        fave_id: allData.fave_id
                    }
                })
                if (res) {
                    ctx.body = { result: "destroy success" }

                }

            }
        } catch (error) {

        }
    },
    async saveDestroyFavorite(ctx, _next) {
        const saveData = ctx.request.body
        const findFavorite = await favorite.findOne({
            where: {
                user_id: saveData.userID,
            },
        })
        if (findFavorite == null) {
            if (saveData.action == "create") {
                const saveFav = await favorite.create({
                    user_id: saveData.userID,
                    restaurant_id: [saveData.restaurantId],
                    // created_at: currentTimeString
                })

                ctx.body = { result: 'save restaurant id success' }
            }
        } else {
            let arrayRestaurantId = JSON.parse(findFavorite.dataValues.restaurant_id);
            if (saveData.action == "create") {
                const checkExist = arrayRestaurantId.includes(saveData.restaurantId)
                if (checkExist == false) {
                    arrayRestaurantId.push(saveData.restaurantId)
                    console.log(arrayRestaurantId)
                    const saveSuccess = await favorite.update(
                        {
                            restaurant_id: arrayRestaurantId,
                        },
                        {
                            where: {
                                user_id: saveData.userID,
                            },
                        }
                    )
                    ctx.body = { result: 'favorite restaurant id success' }
                } else {
                    ctx.body = { result: 'restaurant id exist!' }
                }

            } else if (saveData.action == "destroy") {
                const dataDestroy = arrayRestaurantId.filter(function (item) {
                    return item !== saveData.restaurantId
                })
                const destroySuccess = await favorite.update(
                    {
                        restaurant_id: dataDestroy,
                    },
                    {
                        where: {
                            user_id: saveData.userID,
                        },
                    }
                )
                ctx.body = {
                    result: 'destroy restaurant id success'
                }
            }
        }
    }
}
