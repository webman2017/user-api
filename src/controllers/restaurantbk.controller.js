const { categoriesRestaurant, categoriesRestaurant2, restaurant, restaurantMenu, foodType, restaurantMenuGroup, groupName, addOn, promotion, promocode } = require('./../models')
const uniq = require('lodash/uniq')

const Sequelize = require('sequelize')
const Op = Sequelize.Op
const { calDeliveryPrice, calculateGoogleMapDistance, getPagination } = require('./../utils/common.utils')
const orderBy = require('lodash/orderBy')
const es = require('./../configs/es')
const { restaurantDTO } = require('../dto/es.dto')
const { required, exist } = require('joi')
const { filter } = require('lodash')

const formatRestaurantData = async (values, lat, lng) => {
    const date = new Date()
    const dateNow = date.getDay()
    const closedRestaurant = ['tSunEndTime', 'tMonEndTime', 'tTueEndTime', 'tWedEndTime', 'tThuEndTime', 'tFriEndTime', 'tSatEndTime'][dateNow]

    const minutes = date.getMinutes()
    const hours = date.getHours()

    const promise = values.map(async item => {
        const origins = { lat, lng }
        const destinations = { lat: item.lat, lng: item.lng }
        const distance = await calculateGoogleMapDistance(origins, destinations)
        const restaurantDate = item[closedRestaurant].split(':')
        const restaurantHours = restaurantDate[0] <= 0 ? restaurantDate[0] : 22
        const restaurantMinutes = restaurantDate[2]
        const totalMinuteNow = hours * 60 + minutes
        const totalMinuteRestaurant = Number(restaurantHours) * 60 + Number(restaurantMinutes)
        const closed = totalMinuteRestaurant - totalMinuteNow
        return {
            ...item.dataValues,
            deliveryPrice: await calDeliveryPrice(distance),
            googleMapDistance: distance,
            closed: { status: closed <= 30 && closed > 0, minute: closed, message: `ร้านจะปิดใน ${closed} นาที` },
        }
    })
    const data = await Promise.all(promise)

    return orderBy(data, ['googleMapDistance'], ['asc'])
}

module.exports = {
    async findAll(ctx, _next) {
        try {
            const { query } = ctx
            const { lat, lng } = query
            const { lt, like, eq, or, gt } = Op
            const branchGroupId = []
            const data = []
            let restaurantData = []
            let restaurantOutsideData = []
            let restaurantFormatData = []
            let catItem = []

            const queryOptions = getPagination(query.page, query.limit)
            const searchOptions = query.search && {
                [or]: {
                    name_thai: {
                        [like]: `%${query.search}%`,
                    },
                    name_english: {
                        [like]: `%${query.search}%`,
                    },
                    tag1: {
                        [like]: `%${query.search}%`,
                    },
                    tag2: {
                        [like]: `%${query.search}%`,
                    },
                    name_primary: {
                        [like]: `%${query.search}%`,
                    },
                },
            }
            const filterOptions = query.filter && {
                [or]: {
                    cateID: {
                        [eq]: query.filter,
                    },
                    cateID2: {
                        [eq]: query.filter,
                    },
                },
            }
            const having = !query.search &&
                !query.filter && {
                having: {
                    distance: {
                        [lt]: query.distance,
                    },
                },
            }

            const calculateDistance = `ROUND((3959 * acos (cos ( radians(${lat}) )* cos( radians( lat ) )* cos( radians( lng ) - radians(${lng}) )+ sin ( radians(${lat}) )* sin( radians( lat )))) * 1.60934,2)`

            restaurantData = await restaurant.findAll({
                ...queryOptions,
                include: [
                    { model: foodType, paranoid: false },
                    { model: categoriesRestaurant, paranoid: false },
                    { model: categoriesRestaurant2, paranoid: false },
                    { model: promotion, paranoid: false },
                ],
                attributes: {
                    include: [[calculateDistance, 'distance']],
                },
                ...having,
                where: { ...searchOptions, ...filterOptions, status: 0 },
                group: 'branch_group',
                order: [['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],

            })

            console.log(restaurantData)
            // return
            if (restaurantData.length > 0 || query.scroll) {
                restaurantData.map(item => item.branch_group && branchGroupId.push(item.branch_group))
                restaurantFormatData = await formatRestaurantData(restaurantData, lat, lng)
            } else {
                const outsideHaving = !query.search &&
                    !query.filter && {
                    having: {
                        distance: {
                            [gt]: query.distance,
                        },
                    },
                }
                restaurantOutsideData = await restaurant.findAll({
                    ...queryOptions,
                    include: [{ model: foodType, paranoid: false }],
                    attributes: {
                        include: [[calculateDistance, 'distance']],
                    },
                    ...outsideHaving,
                    where: { ...searchOptions, ...filterOptions, status: 0 },
                    group: 'branch_group',
                    order: [['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],
                })
                restaurantOutsideData.map(item => item.branch_group && branchGroupId.push(item.branch_group))

                restaurantFormatData = await formatRestaurantData(restaurantOutsideData, lat, lng)
            }
            // Push branch id

            const branchData = await restaurant.findAll({
                ...{ query },
                where: {
                    branch_group: branchGroupId,
                },

                attributes: { include: [[calculateDistance, 'distance']] },
                having: {
                    distance: {
                        [lt]: query.distance,
                    },
                },
            })
            const branchFormatData = await formatRestaurantData(branchData, lat, lng)

            restaurantFormatData.map(item =>
                data.push({
                    ...item,
                    // branch: branchFormatData.filter(branchItem => branchItem.branch_group === item.branch_group),
                })
            )

            ctx.body = {
                message: 'success',
                data: { ...query, count: data.length, items: data },
            }
        } catch (error) {
            ctx.body = error.message
        }
    },
    async restaurantDetail(ctx, _next) {
        let data = []
        let addOnItem = []
        // const { id } = ctx.request.params
        const dataId = ctx.request.params

        const getRestaurant = await restaurant.findOne({
            where: {
                restaurant_id: dataId.id,
            },
        })





        const getMenu = await restaurantMenu.findAll({
            where: {
                restaurant_id: dataId.id,
            },
        })

        ctx.body = { 'restaurant': getRestaurant, 'menu': getMenu }

        return


        const setMenusType = getMenu.map(menus => menus.food_type)

        ctx.body = setMenusType


        const filterType = await foodType.findAll({
            where: {
                id: setMenusType,
            },
        })

        console.log(setMenusType)
        const menuGroup = await restaurantMenuGroup.findAll({
            include: [
                { model: restaurantMenu, paranoid: false },
                { model: groupName, paranoid: false },
            ],
        })

        const setMenusGroup = menuGroup.map(item => item.group_name.id)

        ctx.body = { data: menuGroup, message: setMenusGroup }

        // ctx.body = { data: getRestaurant, menu: getMenu }
        // return

        const addOnMenu = await addOn.findAll({
            where: { group_id: uniq(setMenusGroup) },
        })



        menuGroup.map(item =>
            addOnItem.push({
                ...item.dataValues,
                group_name: {
                    ...item.group_name.dataValues,
                    addOn: addOnMenu.filter(addOnItem => addOnItem.group_id === item.group_id),
                },
            })
        )

        const getGroup = (addOnItem, menu_id) => {
            const filterAddons = addOnItem.filter(groups => groups.restaurant_menu_id === menu_id)
            const pushGroup = filterAddons.length > 0 ? filterAddons.map(values => values.group_name) : []
            return pushGroup
        }



        const mergeGroup = getMenu.map(types => {
            return {
                ...types.dataValues,
                group: getGroup(addOnItem, types.menu_id),
            }
        })

        filterType.map(item =>
            data.push({
                ...item.dataValues,
                menu: mergeGroup.filter(branchItem => branchItem.food_type === item.id),
            })
        )

        ctx.body = { addOnMenu, menuGroup };
    },
    async findDealAroundYou(ctx, _next) {
        try {
            const { query } = ctx
            const { lat, lng } = query
            const { lt, like, eq, or } = Op
            const branchGroupId = []
            const data = []
            const queryOptions = {}
            queryOptions.limit = query.limit
            queryOptions.offset = query.offset
            const searchOptions = query.search && {
                [or]: {
                    name_thai: {
                        [like]: `%${query.search}%`,
                    },
                    name_english: {
                        [like]: `%${query.search}%`,
                    },
                    tag1: {
                        [like]: `%${query.search}%`,
                    },
                    tag2: {
                        [like]: `%${query.search}%`,
                    },
                    name_primary: {
                        [like]: `%${query.search}%`,
                    },
                },
            }
            const filterOptions = query.filter && {
                [or]: {
                    cateID: {
                        [eq]: query.filter,
                    },
                    cateID2: {
                        [eq]: query.filter,
                    },
                },
            }
            const having = !query.search &&
                !query.filter && {
                having: {
                    distance: {
                        [lt]: 12,
                    },
                },
            }
            const calculateDistance = `ROUND((3959 * acos (cos ( radians(${lat}) )* cos( radians( lat ) )* cos( radians( lng ) - radians(${lng}) )+ sin ( radians(${lat}) )* sin( radians( lat )))) * 1.60934,2)`
            const restaurantData = await restaurant.findAll({
                ...queryOptions,
                include: [{ model: foodType, paranoid: false },
                { model: categoriesRestaurant, paranoid: false },
                { model: categoriesRestaurant2, paranoid: false },
                    // { model: categoriesRestaurant2, paranoid: false },
                ],

                attributes: {
                    include: [[calculateDistance, 'distance']],
                },
                ...having,
                where: { ...searchOptions, ...filterOptions, status: 0 },
                group: 'branch_group',
                order: [['guarantee', 'ASC'], ['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],
            })
            // Push branch id
            restaurantData.map(item => item.branch_group && branchGroupId.push(item.branch_group))

            const branchData = await restaurant.findAll({
                ...{ query },
                where: {
                    branch_group: branchGroupId,
                },
                attributes: { include: [[calculateDistance, 'distance']] },
                having: {
                    distance: {
                        [lt]: 12,
                    },
                },
                order: [['guarantee', 'ASC'], ['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],
            })
            const branchFormatData = await formatRestaurantData(branchData, lat, lng)
            const restaurantFormatData = await formatRestaurantData(restaurantData, lat, lng)

            restaurantFormatData.map(item =>
                data.push({
                    ...item,
                    branch: branchFormatData.filter(branchItem => branchItem.branch_group === item.branch_group),
                })
            )

            ctx.body = {
                message: 'success',
                data: { ...query, count: data.length, items: data },
            }
        } catch (error) {
            ctx.body = error.message
        }
    },

    async filterTopLate(ctx, _next) {
        try {
            const { query } = ctx
            const { lat, lng } = query
            const { lt, like, eq, or } = Op
            const branchGroupId = []
            const data = []
            const queryOptions = {}
            queryOptions.limit = query.limit
            queryOptions.offset = query.offset
            const searchOptions = query.search && {
                [or]: {
                    name_thai: {
                        [like]: `%${query.search}%`,
                    },
                    name_english: {
                        [like]: `%${query.search}%`,
                    },
                    tag1: {
                        [like]: `%${query.search}%`,
                    },
                    tag2: {
                        [like]: `%${query.search}%`,
                    },
                    name_primary: {
                        [like]: `%${query.search}%`,
                    },
                },
            }
            const filterOptions = query.filter && {
                [or]: {
                    cateID: {
                        [eq]: query.filter,
                    },
                    cateID2: {
                        [eq]: query.filter,
                    },
                },
            }
            const having = !query.search &&
                !query.filter && {
                having: {
                    distance: {
                        [lt]: 12,
                    },
                },
            }
            const calculateDistance = `ROUND((3959 * acos (cos ( radians(${lat}) )* cos( radians( lat ) )* cos( radians( lng ) - radians(${lng}) )+ sin ( radians(${lat}) )* sin( radians( lat )))) * 1.60934,2)`
            const restaurantData = await restaurant.findAll({
                ...queryOptions,
                include: [{ model: foodType, paranoid: false },
                { model: categoriesRestaurant, paranoid: false },
                { model: categoriesRestaurant2, paranoid: false },
                    // { model: categoriesRestaurant2, paranoid: false },
                ],
                attributes: {
                    include: [[calculateDistance, 'distance']],
                },
                ...having,
                where: { ...searchOptions, ...filterOptions, status: 0, rating: 5 },
                group: 'branch_group',
                order: [['rating', 'DESC'], ['rating', 'DESC'], [Sequelize.col('distance'), 'ASC']],
            })
            // Push branch id
            restaurantData.map(item => item.branch_group && branchGroupId.push(item.branch_group))

            const branchData = await restaurant.findAll({
                ...{ query },
                where: {
                    branch_group: branchGroupId,
                },
                attributes: { include: [[calculateDistance, 'distance']] },
                having: {
                    distance: {
                        [lt]: 12,
                    },
                },
                order: [['guarantee', 'ASC'], ['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],
            })
            const branchFormatData = await formatRestaurantData(branchData, lat, lng)
            const restaurantFormatData = await formatRestaurantData(restaurantData, lat, lng)

            restaurantFormatData.map(item =>
                data.push({
                    ...item,
                    branch: branchFormatData.filter(branchItem => branchItem.branch_group === item.branch_group),
                })
            )

            ctx.body = {
                message: 'success',
                data: { ...query, count: data.length, items: data },
            }
        } catch (error) {
            ctx.body = error.message
        }
    },


    async findOrderAgain(ctx, _next) {
        try {
            ctx.body = { data: '', message: 'failed' }
        } catch (error) {
            ctx.body = error.message
        }
    },
    async findNearByOneKm(ctx, _next) {
        try {
            const { query } = ctx
            const { lat, lng } = query
            const { lt, like, eq, or, gt, ne, notIn } = Op
            const branchGroupId = []
            const data = []
            let restaurantData = []
            let restaurantOutsideData = []
            let restaurantFormatData = []

            const queryOptions = getPagination(query.page, query.limit)
            const searchOptions = query.search && {
                [or]: {
                    name_thai: {
                        [like]: `%${query.search}%`,
                    },
                    name_english: {
                        [like]: `%${query.search}%`,
                    },
                    tag1: {
                        [like]: `%${query.search}%`,
                    },
                    tag2: {
                        [like]: `%${query.search}%`,
                    },
                    name_primary: {
                        [like]: `%${query.search}%`,
                    },
                },
            }
            const filterOptions = query.filter && {
                [or]: {
                    cateID: {
                        [eq]: query.filter,
                    },
                    cateID2: {
                        [eq]: query.filter,
                    },
                },
            }
            const having = !query.search &&
                !query.filter && {
                having: {
                    distance: {
                        [lt]: query.distance,
                    },
                },
            }

            const calculateDistance = `ROUND((3959 * acos (cos ( radians(${lat}) )* cos( radians( lat ) )* cos( radians( lng ) - radians(${lng}) )+ sin ( radians(${lat}) )* sin( radians( lat )))) * 1.60934,2)`

            restaurantData = await restaurant.findAll({
                ...queryOptions,
                include: [{ model: foodType, paranoid: false },
                { model: categoriesRestaurant, paranoid: false },
                { model: categoriesRestaurant2, paranoid: false },],
                attributes: {
                    include: [[calculateDistance, 'distance']],
                },
                ...having,
                where: { ...searchOptions, ...filterOptions, status: 0, restaurant_id: { [notIn]: query.where } },
                group: 'branch_group',
                order: [['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],
            })
            if (restaurantData.length > 0 || query.scroll) {
                restaurantData.map(item => item.branch_group && branchGroupId.push(item.branch_group))
                restaurantFormatData = await formatRestaurantData(restaurantData, lat, lng)
            } else {
                const outsideHaving = !query.search &&
                    !query.filter && {
                    having: {
                        distance: {
                            [gt]: query.distance,
                        },
                    },
                }
                restaurantOutsideData = await restaurant.findAll({
                    ...queryOptions,
                    include: [{ model: foodType, paranoid: false }],
                    attributes: {
                        include: [[calculateDistance, 'distance']],
                    },
                    ...outsideHaving,
                    where: { ...searchOptions, ...filterOptions, status: 0 },
                    group: 'branch_group',
                    order: [['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],
                })
                restaurantOutsideData.map(item => item.branch_group && branchGroupId.push(item.branch_group))
                restaurantFormatData = await formatRestaurantData(restaurantOutsideData, lat, lng)
            }
            // Push branch id

            const branchData = await restaurant.findAll({
                ...{ query },
                where: {
                    branch_group: branchGroupId,
                },
                attributes: { include: [[calculateDistance, 'distance']] },
                having: {
                    distance: {
                        [lt]: query.distance,
                    },
                },
            })
            const branchFormatData = await formatRestaurantData(branchData, lat, lng)

            restaurantFormatData.map(item =>
                data.push({
                    ...item,
                    branch: branchFormatData.filter(branchItem => branchItem.branch_group === item.branch_group),
                })
            )

            ctx.body = {
                message: 'success',
                data: { ...query, count: data.length, items: data },
            }
        } catch (error) {
            ctx.body = error.message
        }
    },
    // Elasticsearch

    async elasticsearch(ctx, _next) {
        try {
            const { query } = ctx
            const { lt, like, or } = Op
            const search = await es.search(
                { index: 'restaurants', from: query.from, size: query.size, q: query.search },
                {
                    ignore: [404],
                    maxRetries: 3,
                }
            )
            const {
                body: {
                    hits: { hits },
                },
            } = search

            let esRestaurantId = []
            let branch = []
            hits.map(({ _source }) => {
                if (_source.branch_group === '') {
                    esRestaurantId = [...esRestaurantId, _source.restaurant_id]
                } else {
                    branch = [...branch, _source.branch_group]
                }
            })
            const calculateDistance = `ROUND((3959 * acos (cos ( radians(${query.lat}) )* cos( radians( lat ) )* cos( radians( lng ) - radians(${query.lng}) )+ sin ( radians(${query.lat}) )* sin( radians( lat )))) * 1.60934,2)`

            // return
            const restaurantData = await restaurant.findAll({
                where: { [or]: { branch_group: uniq(branch), restaurant_id: esRestaurantId } },
                limit: 10,
                include: [
                    {
                        model: restaurantMenu,
                        attributes: ['menu_id', 'menu_name', 'price_exact', 'price_sale', 'largeUrl'],
                        limit: 2,
                        where: {
                            [or]: {
                                menu_name: {
                                    [like]: `%${query.search}%`,
                                },
                            },
                        },
                    },
                ],
                attributes: {
                    include: [[calculateDistance, 'distance']],
                },
                // group:['restaurant.branch_group'],
                order: [[Sequelize.col('distance'), 'ASC']],
            })
            const restaurantFormatData = await formatRestaurantData(restaurantData, query.lat, query.lng)
            ctx.body = restaurantFormatData
        } catch (error) {
            ctx.body = error.message
        }
    },


    async suggestion(ctx, _next) {
        try {
            const { query } = ctx
            const { lt, like, or } = Op
            const result = await es.search({
                index: 'restaurants',
                from: 1,
                size: 10,
                body: { name_primary: 'ข้าว' }
            }, {
                ignore: [404],
                maxRetries: 3
            })

            // console.log(result)
            return


            const search = await es.search(
                { index: 'restaurants', from: query.from, size: query.size, q: query.search },
                {
                    ignore: [404],
                    maxRetries: 3,
                }
            )
            const {
                body: {
                    hits: { hits },
                },
            } = search
            let esRestaurantId = []
            hits.map(({ _source }) => {
                esRestaurantId = [...esRestaurantId, _source.restaurant_id]
            })


            ctx.body = search

        } catch (error) {
            ctx.body = error.message
        }
    },


    async esRestaurantCreateAllBulk(ctx, _next) {
        try {
            const esIndex = 'test'
            const queryOptions = getPagination(0, 500)
            // console.log({queryOptions})
            const restaurantData = await restaurant.findAll({
                include: [{ model: foodType }, { model: restaurantMenu }],
                ...queryOptions,
            })
            const body = restaurantDTO(restaurantData).flatMap(doc => [{ index: { _index: esIndex, _id: doc.id } }, doc])

            // const createdBulk = await es.bulk({ refresh: true, body })

            ctx.body = body
        } catch (error) {
            ctx.body = error.message
        }
    },










    async findPromotion(ctx, _next) {
        try {
            const data = ctx.request.body
            console.log(data.keyword)
            const promoData = await promotion.findAll({
                // where: {
                //    promotion_name: data.keyword
                // },
            })
            console.log(promoData)
            ctx.body = promoData
        } catch (error) {
            ctx.body = error.message
        }
    },

    async findPromocode(ctx, _next) {
        try {
            const { query } = ctx
            const { lat, lng } = query
            const { lt, like, eq, or, gt } = Op
            const branchGroupId = []
            const data = []
            let restaurantData = []
            let restaurantOutsideData = []
            let restaurantFormatData = []
            let catItem = []

            const queryOptions = getPagination(query.page, query.limit)
            const searchOptions = query.search && {
                [or]: {
                    vCouponCode: {
                        [like]: `%${query.search}%`,
                    },
                },
            }
            const filterOptions = query.filter && {
                [or]: {
                    vCouponCode: {
                        [eq]: query.filter,
                    },
                },
            }
            const having = !query.search &&
                !query.filter && {
                having: {
                    distance: {
                        [lt]: query.distance,
                    },
                },
            }

            const calculateDistance = `ROUND((3959 * acos (cos ( radians(${lat}) )* cos( radians( lat ) )* cos( radians( lng ) - radians(${lng}) )+ sin ( radians(${lat}) )* sin( radians( lat )))) * 1.60934,2)`

            restaurantData = await promocode.findAll({
                ...queryOptions,
                // include: [
                //    //    { model: foodType, paranoid: false },
                //    { model: restaurant, paranoid: false },
                //    //    // { model: categoriesRestaurant2, paranoid: false },
                //    //    { model: promotion, paranoid: false },
                // ],
                // attributes: {
                //    include: [[calculateDistance, 'distance']],
                // },
                ...having,
                where: { ...searchOptions, ...filterOptions },
                // group: 'branch_group',
                // order: [['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],

            })

            console.log(restaurantData)
            // return
            if (restaurantData.length > 0 || query.scroll) {
                // restaurantData.map(item => item.branch_group && branchGroupId.push(item.branch_group))
                // restaurantFormatData = await formatRestaurantData(restaurantData, lat, lng)
            } else {
                // const outsideHaving = !query.search &&
                //    !query.filter && {
                //    having: {
                //       distance: {
                //          [gt]: query.distance,
                //       },
                //    },
                // }
                // restaurantOutsideData = await restaurant.findAll({
                //    ...queryOptions,
                //    include: [{ model: foodType, paranoid: false }],
                //    attributes: {
                //       include: [[calculateDistance, 'distance']],
                //    },
                //    ...outsideHaving,
                //    where: { ...searchOptions, ...filterOptions, status: 0 },
                //    group: 'branch_group',
                //    order: [['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],
                // })
                // restaurantOutsideData.map(item => item.branch_group && branchGroupId.push(item.branch_group))

                // restaurantFormatData = await formatRestaurantData(restaurantOutsideData, lat, lng)
            }
            // Push branch id

            // const branchData = await restaurant.findAll({
            //    ...{ query },
            //    where: {
            //       branch_group: branchGroupId,
            //    },

            //    attributes: { include: [[calculateDistance, 'distance']] },
            //    having: {
            //       distance: {
            //          [lt]: query.distance,
            //       },
            //    },
            // })
            // const branchFormatData = await formatRestaurantData(branchData, lat, lng)

            // restaurantFormatData.map(item =>
            //    data.push({
            //       ...item,
            //       // branch: branchFormatData.filter(branchItem => branchItem.branch_group === item.branch_group),
            //    })
            // )

            ctx.body = {
                message: 'success',
                data: { ...query, count: data.length, items: data },
            }
        } catch (error) {
            ctx.body = error.message
        }
    },
    async findPrice(ctx, _next) {
        try {
            const { query } = ctx
            const { lat, lng } = query
            const { lt, like, eq, or, gt } = Op
            const branchGroupId = []
            const data = []
            let restaurantData = []
            let restaurantOutsideData = []
            let restaurantFormatData = []
            let catItem = []

            const queryOptions = getPagination(query.page, query.limit)
            const searchOptions = query.search && {
                [or]: {
                    price_range: {
                        [like]: `%${query.search}%`,
                    },
                },
            }
            const filterOptions = query.filter && {
                [or]: {
                    price_range: {
                        [eq]: query.filter,
                    },
                    // cateID2: {
                    //    [eq]: query.filter,
                    // },
                },
            }
            const having = !query.search &&
                !query.filter && {
                having: {
                    distance: {
                        [lt]: query.distance,
                    },
                },
            }

            const calculateDistance = `ROUND((3959 * acos (cos ( radians(${lat}) )* cos( radians( lat ) )* cos( radians( lng ) - radians(${lng}) )+ sin ( radians(${lat}) )* sin( radians( lat )))) * 1.60934,2)`

            restaurantData = await restaurant.findAll({
                ...queryOptions,
                include: [
                    { model: foodType, paranoid: false },
                    // { model: categoriesRestaurant, paranoid: false },
                    // { model: categoriesRestaurant2, paranoid: false },
                    { model: promotion, paranoid: false },
                ],
                attributes: {
                    include: [[calculateDistance, 'distance']],
                },
                ...having,
                where: { ...searchOptions, ...filterOptions, status: 0 },
                group: 'branch_group',
                order: [['guarantee', 'ASC']],

            })

            console.log(restaurantData)
            // return
            if (restaurantData.length > 0 || query.scroll) {
                restaurantData.map(item => item.branch_group && branchGroupId.push(item.branch_group))
                restaurantFormatData = await formatRestaurantData(restaurantData, lat, lng)
            } else {
                const outsideHaving = !query.search &&
                    !query.filter && {
                    having: {
                        distance: {
                            [gt]: query.distance,
                        },
                    },
                }
                restaurantOutsideData = await restaurant.findAll({
                    ...queryOptions,
                    include: [{ model: foodType, paranoid: false }],
                    attributes: {
                        include: [[calculateDistance, 'distance']],
                    },
                    ...outsideHaving,
                    where: { ...searchOptions, ...filterOptions, status: 0 },
                    group: 'branch_group',
                    order: [['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],
                })
                restaurantOutsideData.map(item => item.branch_group && branchGroupId.push(item.branch_group))

                restaurantFormatData = await formatRestaurantData(restaurantOutsideData, lat, lng)
            }
            // Push branch id

            const branchData = await restaurant.findAll({
                ...{ query },
                where: {
                    branch_group: branchGroupId,
                },

                attributes: { include: [[calculateDistance, 'distance']] },
                having: {
                    distance: {
                        [lt]: query.distance,
                    },
                },
            })
            const branchFormatData = await formatRestaurantData(branchData, lat, lng)

            restaurantFormatData.map(item =>
                data.push({
                    ...item,
                    // branch: branchFormatData.filter(branchItem => branchItem.branch_group === item.branch_group),
                })
            )

            ctx.body = {
                message: 'success',
                data: { ...query, count: data.length, items: data },
            }
        } catch (error) {
            ctx.body = error.message
        }
    },
    async filterPromotion(ctx, _next) {
        try {
            const { query } = ctx
            const { lat, lng } = query
            const { lt, like, eq, or, gt } = Op
            const branchGroupId = []
            const data = []
            let restaurantData = []
            let restaurantOutsideData = []
            let restaurantFormatData = []
            let catItem = []

            const queryOptions = getPagination(query.page, query.limit)
            const searchOptions = query.search && {
                [or]: {
                    name_thai: {
                        [like]: `%${query.search}%`,
                    },
                    name_english: {
                        [like]: `%${query.search}%`,
                    },
                    tag1: {
                        [like]: `%${query.search}%`,
                    },
                    tag2: {
                        [like]: `%${query.search}%`,
                    },
                    name_primary: {
                        [like]: `%${query.search}%`,
                    },
                },
            }
            const filterOptions = query.filter && {
                [or]: {
                    cateID: {
                        [eq]: query.filter,
                    },
                    cateID2: {
                        [eq]: query.filter,
                    },
                },
            }
            const having = !query.search &&
                !query.filter && {
                having: {
                    distance: {
                        [lt]: query.distance,
                    },
                },
            }

            const calculateDistance = `ROUND((3959 * acos (cos ( radians(${lat}) )* cos( radians( lat ) )* cos( radians( lng ) - radians(${lng}) )+ sin ( radians(${lat}) )* sin( radians( lat )))) * 1.60934,2)`

            restaurantData = await restaurant.findAll({
                ...queryOptions,
                include: [
                    { model: foodType, paranoid: false },
                    { model: categoriesRestaurant, paranoid: false },
                    { model: categoriesRestaurant2, paranoid: false },
                    { model: promotion, paranoid: false },
                ],
                attributes: {
                    include: [[calculateDistance, 'distance']],
                },
                ...having,
                where: { ...searchOptions, ...filterOptions, status: 0 },
                group: 'branch_group',
                order: [['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],

            })

            console.log(restaurantData)
            // return
            if (restaurantData.length > 0 || query.scroll) {
                restaurantData.map(item => item.branch_group && branchGroupId.push(item.branch_group))
                restaurantFormatData = await formatRestaurantData(restaurantData, lat, lng)
            } else {
                const outsideHaving = !query.search &&
                    !query.filter && {
                    having: {
                        distance: {
                            [gt]: query.distance,
                        },
                    },
                }
                restaurantOutsideData = await restaurant.findAll({
                    ...queryOptions,
                    include: [{ model: foodType, paranoid: false }],
                    attributes: {
                        include: [[calculateDistance, 'distance']],
                    },
                    ...outsideHaving,
                    where: { ...searchOptions, ...filterOptions, status: 0 },
                    group: 'branch_group',
                    order: [['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],
                })
                restaurantOutsideData.map(item => item.branch_group && branchGroupId.push(item.branch_group))

                restaurantFormatData = await formatRestaurantData(restaurantOutsideData, lat, lng)
            }
            // Push branch id

            const branchData = await restaurant.findAll({
                ...{ query },
                where: {
                    branch_group: branchGroupId,
                },

                attributes: { include: [[calculateDistance, 'distance']] },
                having: {
                    distance: {
                        [lt]: query.distance,
                    },
                },
            })
            const branchFormatData = await formatRestaurantData(branchData, lat, lng)

            restaurantFormatData.map(item =>
                data.push({
                    ...item,
                    // branch: branchFormatData.filter(branchItem => branchItem.branch_group === item.branch_group),
                })
            )

            ctx.body = {
                message: 'success',
                data: { ...query, count: data.length, items: data },
            }
        } catch (error) {
            ctx.body = error.message
        }
    },
    async findDistance(ctx, _next) {
        try {
            const { query } = ctx
            const { lat, lng } = query
            const { lt, like, eq, or, gt } = Op
            const branchGroupId = []
            const data = []
            let restaurantData = []
            let restaurantOutsideData = []
            let restaurantFormatData = []
            let catItem = []

            const queryOptions = getPagination(query.page, query.limit)
            const searchOptions = query.search && {
                [or]: {
                    name_thai: {
                        [like]: `%${query.search}%`,
                    },
                    name_english: {
                        [like]: `%${query.search}%`,
                    },
                    tag1: {
                        [like]: `%${query.search}%`,
                    },
                    tag2: {
                        [like]: `%${query.search}%`,
                    },
                    name_primary: {
                        [like]: `%${query.search}%`,
                    },
                },
            }
            const filterOptions = query.filter && {
                [or]: {
                    cateID: {
                        [eq]: query.filter,
                    },
                    cateID2: {
                        [eq]: query.filter,
                    },
                },
            }
            const having = !query.search &&
                !query.filter && {
                having: {
                    distance: {
                        [lt]: query.distance,
                    },
                },
            }

            const calculateDistance = `ROUND((3959 * acos (cos ( radians(${lat}) )* cos( radians( lat ) )* cos( radians( lng ) - radians(${lng}) )+ sin ( radians(${lat}) )* sin( radians( lat )))) * 1.60934,2)`

            restaurantData = await restaurant.findAll({
                ...queryOptions,
                include: [
                    { model: foodType, paranoid: false },
                    { model: categoriesRestaurant, paranoid: false },
                    { model: categoriesRestaurant2, paranoid: false },
                    { model: promotion, paranoid: false },
                ],
                attributes: {
                    include: [[calculateDistance, 'distance']],
                },
                ...having,
                where: { ...searchOptions, ...filterOptions, status: 0 },
                group: 'branch_group',
                order: [['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],

            })

            console.log(restaurantData)
            // return
            if (restaurantData.length > 0 || query.scroll) {
                restaurantData.map(item => item.branch_group && branchGroupId.push(item.branch_group))
                restaurantFormatData = await formatRestaurantData(restaurantData, lat, lng)
            } else {
                const outsideHaving = !query.search &&
                    !query.filter && {
                    having: {
                        distance: {
                            [gt]: query.distance,
                        },
                    },
                }
                restaurantOutsideData = await restaurant.findAll({
                    ...queryOptions,
                    include: [{ model: foodType, paranoid: false }],
                    attributes: {
                        include: [[calculateDistance, 'distance']],
                    },
                    ...outsideHaving,
                    where: { ...searchOptions, ...filterOptions, status: 0 },
                    group: 'branch_group',
                    order: [['guarantee', 'ASC'], [Sequelize.col('distance'), 'ASC']],
                })
                restaurantOutsideData.map(item => item.branch_group && branchGroupId.push(item.branch_group))

                restaurantFormatData = await formatRestaurantData(restaurantOutsideData, lat, lng)
            }
            // Push branch id

            const branchData = await restaurant.findAll({
                ...{ query },
                where: {
                    branch_group: branchGroupId,
                },

                attributes: { include: [[calculateDistance, 'distance']] },
                having: {
                    distance: {
                        [lt]: query.distance,
                    },
                },
            })
            const branchFormatData = await formatRestaurantData(branchData, lat, lng)

            restaurantFormatData.map(item =>
                data.push({
                    ...item,
                    // branch: branchFormatData.filter(branchItem => branchItem.branch_group === item.branch_group),
                })
            )

            ctx.body = {
                message: 'success',
                data: { ...query, count: data.length, items: data },
            }
        } catch (error) {
            ctx.body = error.message
        }
    },
}
