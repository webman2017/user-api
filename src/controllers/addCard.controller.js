const { user } = require('./../models')
const Sequelize = require('sequelize')
const omise = require('omise')({
    secretKey: 'skey_test_5fo578i3gl14jwer5r8',
    publicKey: 'pkey_test_5fo578i35dol06lr407',
    omiseVersion: '2019-05-29',
})
module.exports = {
    async findAll(ctx, _next) {
        try {
            const userRequest = ctx.request.body
            var cardDetails = {
                card: {
                    name: userRequest.name,
                    number: userRequest.number,
                    expiration_month: userRequest.expiration_month,
                    expiration_year: userRequest.expiration_year,
                    security_code: userRequest.security_code,
                },
            }
            const userData = await user.findOne({
                where: {
                    iUserId: userRequest.userId,
                },
            })
            // console.log(userData)
            //ไม่มีรหัสลูกค้า
            if (userData.vOmiseCustId == '' || userData.vOmiseCustId == null) {
                const omiseCreate = await omise.tokens.create(cardDetails)
                console.log(omiseCreate)
                // return
                if (!omiseCreate && !omiseCreate.id) ctx.body = { message: 'Create token failed', status: 'failed' }
                const omiseCreateCustomer = await omise.customers.create({
                    email: userData.vEmail,
                    description: userData.vName,
                    card: omiseCreate.id,
                    metadata: {
                        note: 'test card',
                    },
                })
                // return
                if (!omiseCreateCustomer && !omiseCreateCustomer.id) ctx.body = { message: 'Create omise customer failed', status: 'failed' }
                const updateUser = await user.update(
                    { vOmiseCustId: omiseCreateCustomer.id },
                    {
                        where: {
                            iUserId: userRequest.userId,
                        },
                    }
                )
                if (!updateUser) ctx.body = { message: 'Update user failed', status: 'failed' }
                const omiseCharges = await omise.charges.create({
                    amount: 2000,
                    currency: 'thb',
                    customer: omiseCreateCustomer.id,
                })
                if (!omiseCharges) ctx.body = { message: 'Omise charges failed', status: 'failed' }
                // console.log(omiseCharges.id)
                const refund = await omise.charges.createRefund(
                    omiseCharges.id,
                    { 'amount': 2000 },
                )
                // console.log(refund)
                if (!refund) ctx.body = { message: 'Omise Refund failed', status: 'failed' }
                ctx.body = { message: 'Omise created successful.', status: 'success', item: omiseCharges.card }
            } else {
                //มีรหัสลูกค้าแล้ว
                const omiseCreate = await omise.tokens.create(cardDetails)
                console.log(omiseCreate)
                if (!omiseCreate && !omiseCreate.id) ctx.body = { message: 'Create token failed', status: 'failed' }
                let dataCheck = await omise.customers.listCards(userData.vOmiseCustId)
                console.log(omiseCreate.card.fingerprint)
                const have = dataCheck.data.find(record => record.fingerprint === omiseCreate.card.fingerprint)
                console.log(have)
                if (have !== undefined) {
                    console.log('have')
                    ctx.body = { message: 'card exist.', status: 'cardexist' }

                } else {
                    console.log('nohave')
                    await omise.customers.update(
                        userData.vOmiseCustId,
                        { 'card': omiseCreate.id }
                    );

                    console.log(omiseCreate.card.id)
                    const omiseCharges = await omise.charges.create({
                        'amount': '2000',
                        'currency': 'thb',
                        'customer': userData.vOmiseCustId,
                        'card': omiseCreate.card.id
                    });

                    if (!omiseCharges) ctx.body = { message: 'Omise charges failed', status: 'failed' }
                    console.log(omiseCharges.id)
                    const refund = await omise.charges.createRefund(
                        omiseCharges.id,
                        { 'amount': 2000 },
                    )
                    console.log(refund)
                    if (!refund) ctx.body = { message: 'Omise Refund failed', status: 'failed' }

                    ctx.body = { message: 'Omise created successful.', status: 'success', item: omiseCharges.card }
                }
            }
        } catch (error) {
            ctx.body = error.message
            if (error.message == 'brand not supported (american express)') {
                ctx.body = {
                    "message": error.message,
                    "status": "notSupport"
                }
            } else if (error.message == 'expiration date cannot be in the past' || error.message == 'expiration date cannot be in the past and brand not supported(american express)') {
                ctx.body = {
                    "message": error.message,
                    "status": "expired"
                }
            } else if (error.message == "number is invalid") {
                ctx.body = {
                    "message": error.message,
                    "status": "invalid"
                }
            } else if (error.message == 'expiration date cannot be in the past and number is invalid')
                ctx.body = {
                    "message": error.message,
                    "status": "invalid"
                }
        }
    },
    // ctx.status = 400

    async getCredit(ctx, _next) {
        try {
            // const getCard = async () => {
            const userRequest = ctx.request.params
            // console.log(userRequest);
            const userData = await user.findOne({
                where: {
                    iUserId: userRequest.userId,
                },
            })
            console.log(userData)

            // return
            if (userData) {
                let customerId = userData.dataValues.vOmiseCustId
                // console.log(customerId)
                // return
                let card = []
                if (customerId == null || customerId == "") {
                    card.push({ message: 'no card' })
                } else {
                    await omise.customers.retrieve(customerId, function (err, resp) {
                        // console.log(resp.cards.data);
                        card.push(resp.cards.data)
                    })
                }
                ctx.body = card[0]
            } else {
                ctx.body = "ไม่มี user"
            }
        } catch (error) {
            ctx.body = error.message
        }
    },
    async delCredit(ctx, _next) {
        try {
            const userRequest = ctx.request.params

            console.log(userRequest)
            const userData = await user.findOne({
                where: {
                    iUserId: userRequest.userId,
                },
            })
            let customerId = await userData.dataValues.vOmiseCustId
            omise.customers.destroyCard(customerId, userRequest.cardId, function (error, card) {
                console.log(card)
            })
            ctx.body = 'delete card success'
        } catch (error) {
            ctx.body = error.message
        }
    },
    async creditCharge(ctx, _next) {
        try {
            const data = ctx.request.body

            console.log(data)
            const userData = await user.findOne({
                where: {
                    iUserId: data.userId,
                },
            })

            let customerId = await userData.dataValues.vOmiseCustId

            // omise.customers.destroyCard(customerId, userRequest.cardId, function (error, card) {
            //     console.log(card)
            // })
            const charge = await omise.charges.create({
                'amount': data.amount,
                'currency': 'thb',
                'customer': customerId,
                'card': data.cardId
            }, function (error, charge) {
                /* Response. */
            });
            ctx.body = 'charge success'
        } catch (error) {
            ctx.body = error.message
        }
    },
    async internetBanking(ctx, _next) {
        try {
            const { query } = ctx
            const bank = query.bank
            // console.log(bank)
            let bankType = ''
            if (bank == "Krungsri Online") {
                bankType = "internet_banking_bay"
            } else if (bank == "Bualuang iBanking") {
                bankType = "internet_banking_bbl"
            } else if (bank == "KTB Netbank") {
                bankType = "internet_banking_ktb"
            } else if (bank == "SCB Easy Net") {
                bankType = "internet_banking_scb"
            }

            // console.log(bankType)
            // return
            var amount = query.amount;
            var currency = 'thb';
            var source = {
                'type': bankType,
                'amount': query.amount,
                'currency': 'thb',
            };

            const result = await omise.sources.create(source).then(function (resSource) {
                return omise.charges.create({
                    'amount': amount,
                    'source': resSource.id,
                    'currency': currency,
                    'return_uri': 'https://omise.co',
                });
            }).then(function (charge) {
                console.log(charge);
                return charge
            }).catch(function (err) {
                console.log(err);
            });
            ctx.body = result
        } catch (error) {

        }
    }

}
