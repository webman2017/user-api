module.exports = (sequelize, Sequelize, config) => {
    const review = sequelize.define(
        'ratings_user_driver',
        {
            iRatingId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            iOrderId: {
                type: Sequelize.INTEGER,
            },
            iTripId: {
                type: Sequelize.INTEGER,
            },
            vRating1: {
                type: Sequelize.FLOAT,
            },
            tDate: {
                type: Sequelize.DATE,
            },
            eDateType: {
                type: Sequelize.STRING,
            },
            eFromUserType: {
                type: Sequelize.STRING,
            },
            eToUserType: {
                type: Sequelize.STRING,
            },

        },
        config,
    )
    review.associate = model => {
        // Relations example
    }


    return review
}
