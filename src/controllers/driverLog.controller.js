const { driverLogReport, activities, trips } = require("./../models");
const Sequelize = require("sequelize");
const { number } = require("joi");
var moment = require('moment'); // require
const { Op } = require('sequelize');
currentdate = new Date();
const oneJan = new Date(currentdate.getFullYear(), 0, 1);
const numberOfDays = Math.floor((currentdate - oneJan) / (24 * 60 * 60 * 1000));
const result = Math.ceil((currentdate.getDay() + 1 + numberOfDays) / 7);
// console.log(result(${currentdate}))
console.log(`สัปดาห์ที่ ${result}`);
var curr = new Date;
var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
var last = first + 6; // last day is the first day + 6
console.log(moment(curr.setDate(first)).format("YYYY-MM-DD HH:mm:ss"));
console.log(moment(curr.setDate(last)).format("YYYY-MM-DD HH:mm:ss"));

const startedDate = new Date("2019-06-08 16:15:35");
const endDate = new Date("2019-06-15 17:00:00");

module.exports = {
    async DriverLog(ctx, _next) {
        try {


            // let countTime = 0
            const data = driverLogReport.findAll({
                attributes: [
                    'iDriverId',
                    'dLoginDateTime',
                    'dLogoutDateTime',
                    [Sequelize.fn('timediff', Sequelize.col('dLoginDateTime'), Sequelize.col('dLogoutDateTime')), 'timeTotal'],
                    // [Sequelize.fn('addtime', Sequelize.col('timeTotal')), 'timeTotal'],
                ],
                where: {
                    // "dLoginDateTime": { [Op.between]: [startedDate, endDate] },
                    iDriverId: 1
                }
            }).then(function (res) {
                // console.log(res)

                let datas
                res.map(async (data) => {
                    //     countTime += data.dataValues.timeTotal
                    // console.log(data.dataValues.timeTotal)
                    console.log(data.dataValues.timeTotal)

                    // console.log(datas)
                })
                // console.log(countTime)
            })

            const totalJob = await activities.findAll({
                attributes: [
                    'iDriverId',
                    'eStatus',
                    'dAddedDate',
                    [Sequelize.fn('sum', Sequelize.col('eStatus')), 'totalJob'],
                    // [Sequelize.fn('sec_to_time', Sequelize.col('eStatus')), 'totalJob'],
                ],
                // group: ['iDriverId'],
                where: {
                    // "dAddedDate": { [Op.between]: [startedDate, endDate] },
                    iDriverId: 5
                }
            });

            const fare = await trips.findAll({
                attributes: [
                    'iFare',
                    [Sequelize.fn('sum', Sequelize.col('iFare')), 'iFare'],
                ],
                // group: ['iDriverId'],
                where: {
                    // "tStartDate": { [Op.between]: [startedDate, endDate] },
                    iDriverId: 5
                }
            })

            // console.log()

            // console.log(totalJob[0].dataValues)
            ctx.body = [{ fare: fare[0].dataValues.iFare, 'totaljob': totalJob[0].dataValues.totalJob, 'totalOnline ': 'zzz' }]
        } catch (error) {
            ctx.body = error.message;
        }
    },
};
