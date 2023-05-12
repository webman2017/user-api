const { countWalk } = require("./../models");
const Sequelize = require("sequelize");
module.exports = {
    async findAll(ctx, _next) {
        try {
            const userId = ctx.request.params
            console.log(userId.id)
            const countWalkData = await countWalk.findAll({
                where: {
                    user_id: userId.id,
                },
            });
            ctx.body = countWalkData
        } catch {

        }
    },
    async saveCountWalk(ctx, _next) {
        try {
            const countWalkData = ctx.request.body
            console.log(countWalkData)
            const saveData = await countWalk.create({

                user_id: countWalkData.userId,
                cal: countWalkData.cal,
                step: countWalkData.step,
                distance: countWalkData.distance,
                // created_at: Date.now()
            })
            ctx.body = "save success"

        } catch (err) {
            ctx.body = err.message;
        }
    }
}