const { user } = require("../models");
const Sequelize = require("sequelize");
const omise = require("omise")({
    secretKey: "skey_test_5fo578i3gl14jwer5r8",
    publicKey: "pkey_test_5fo578i35dol06lr407",
    omiseVersion: "2019-05-29",
});
let result = "";
module.exports = {
    async findAll(ctx, _next) {
        try {
            const userRequest = ctx.request.body;
            var cardDetails = {
                card: {
                    name: userRequest.name,
                    number: userRequest.number,
                    expiration_month: userRequest.expiration_month,
                    expiration_year: userRequest.expiration_year,
                    security_code: userRequest.security_code,
                },
            };
            omise.tokens
                .create(cardDetails)
                .then(function (token) {
                    // console.log(token);
                    return omise.customers.create({
                        email: "john.doe@example.com",
                        description: "John Doe (id: 30)",
                        card: token.id,
                        metadata: {
                            note: "test card",
                        },
                    });
                })
                .then(async function (customer) {
                    await user.update(
                        { vOmiseCustId: customer.id },
                        {
                            where: {
                                iUserId: userRequest.userId,
                            },
                        }
                    );
                    // console.log(customer);
                    return omise.charges.create({
                        amount: 2000,
                        currency: "thb",
                        customer: customer.id,
                    });
                })
                .then(function (charge) {
                    console.log(charge)
                    return charge;
                })
                .error(function (err) {
                    console.log(err);
                })
                .done();

            ctx.body = "xxx";


        } catch (error) {
            ctx.body = error.message;
        }
    },
    async getCredit(ctx, _next) {
        try {
            // const getCard = async () => {
            const userRequest = ctx.request.params;
            console.log(userRequest);
            const userData = await user.findOne({
                where: {
                    iUserId: userRequest.userId,
                },
            });
            let customerId = userData.dataValues.vOmiseCustId;
            // console.log(customerId)
            let card = [];
            // const cardList = async (customerId) => {
            await omise.customers.retrieve(customerId, function (err, resp) {
                card.push(resp.cards.data);
                // return resp.cards.data
            });
            ctx.body = card[0];
        } catch { }
    },
    async delCredit(ctx, _next) {
        try {
            const userRequest = ctx.request.params;
            console.log(userRequest);
            const userData = await user.findOne({
                where: {
                    iUserId: userRequest.userId,
                },
            });
            let customerId = await userData.dataValues.vOmiseCustId;
            omise.customers.destroyCard(
                customerId,
                userRequest.cardId,
                function (error, card) {
                    console.log(card);
                }
            );
            ctx.body = "delete card success";
        } catch { }
    },
};
