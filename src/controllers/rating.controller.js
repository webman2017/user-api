const { rating } = require("./../models");
module.exports = {
    async saveRating(ctx, _next) {
        try {
            const data = ctx.request.body
            const ratingData = data.data.ratings
            const result = await ratingData.map(item => {
                if (item.type == 'restaurant') {
                    rating.create({
                        vRating: item.rating,
                        IsRateComplete: data.data.isRateComplete,
                        ratingFor: item.type,
                        restaurantId: item.userID,
                        transactionId: data.data.orderId,
                        vMessage: item.message,
                        fromUserType: 'user'
                    })
                } else {
                    rating.create({
                        vRating: item.rating,
                        IsRateComplete: data.data.isRateComplete,
                        ratingFor: item.type,
                        driverId: item.userID,
                        transactionId: data.data.orderId,
                        vMessage: item.message,
                        fromUserType: 'user'
                    })
                }
            });
            if (result) {
                ctx.body = {
                    status: 200,
                    message: 'success'
                }
            } else {
                ctx.body = {
                    status: 500,
                    message: fail
                }
            }
        } catch (err) {
            ctx.err;
        }
    },
};
