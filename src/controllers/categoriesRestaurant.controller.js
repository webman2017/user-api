const { categoriesRestaurant, restaurant } = require("./../models");
const Sequelize = require("sequelize");
const fs = require("fs")
let rawdata = fs.readFileSync('./emojis.json')
const Op = Sequelize.Op
let users = JSON.parse(rawdata)

const es = require('./../configs/es')

const countBranch = async (branch) => {
    let count = await restaurant.count({
        where: {
            [Op.or]: [{ cateID: branch }, { cateID2: branch }]
        }
    });
    return count
}

module.exports = {
    async category(ctx, _next) {
        try {

            const dataFinal = await es.search({
                index: 'category',
                body: {
                    "query": {
                        "match_all": {}
                    }
                }
            })
            // console.log(dataFinal.body.hits.hits)
            const dataFinally = []
            const d = dataFinal.body.hits.hits
            d.map(item => {
                dataFinally.push(item._source)
            })

            // return
            ctx.body = dataFinally;
            return


            const { body } = ctx.request;
            const categoryData = await categoriesRestaurant.findAll({});

            // const dataFinal = []

            categoryData.map(item => {
                const countResult = countBranch(item.dataValues.cat_id);

                const obj = users.emojis.find(element => {
                    let elementArr = element.html.replace(';', ';|')
                    const elementArrSpit = elementArr.split('|');
                    var term = item.dataValues.emoji; // search term (regex pattern)
                    var search = new RegExp(term, 'i'); // prepare a regex object
                    let b = elementArrSpit.filter(item => search.test(item));
                    if (b.length > 0) {
                        return element
                    } else {
                        return null
                    }
                });
                let s = countResult.then((values) => {
                    return values
                });

                dataFinal.push({
                    "cat_id": item.dataValues.cat_id,
                    "cat_name": item.dataValues.cat_name,
                    "emoji": item.dataValues.emoji,
                    "internationalName": item.dataValues.internationalName,
                    "iconFullUrl": item.dataValues.iconFullUrl,
                    "iconUrl": item.dataValues.iconUrl,
                    "eStatus": item.dataValues.eStatus,
                    'emoji': obj,
                    'branch': s
                })

            })
            // return

            // ctx.body = categoryData;
            // const { body } = ctx.request;
            // const categoryData = categoriesRestaurant.findAll({
            // });
            // ctx.body = categoryData;
            // console.log("xx");
            // ctx.body = "บันทึกเรียบร้อย";
        } catch (error) {
            ctx.body = error.message;
        }
    },
};
