module.exports = (sequelize, Sequelize, config) => {
    const rating = sequelize.define(
        "trx_ratings",
        {
            iRatingId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            vRating: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            ratingFor: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            vMessage: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            fromUserType: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            percent: {
                type: Sequelize.FLOAT,
                allowNull: true,
            },
            IsRateComplete: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            driverId: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            restaurantId: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            transactionId: {
                type: Sequelize.STRING,
                allowNull: true,
            },
        },
        config
    );
    rating.associate = (model) => {
    };
    return rating;
};
