const { faqs } = require("./../models");
const Sequelize = require("sequelize");
module.exports = {
    async findAll(ctx, _next) {
        try {
            const faqsData = await faqs.findAll({
                where: {
                    eStatus: "Active",
                },
            });
            ctx.body = faqsData
        } catch {

        }
    }
}