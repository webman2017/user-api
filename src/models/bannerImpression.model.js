module.exports = (sequelize, Sequelize, config) => {
    const BannerImpression = sequelize.define(
        'banner_impression',
        {
            iBannerImpLog: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            iAdvertBannerId: {
                type: Sequelize.INTEGER,
            },
            vIP: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            eUserType: {
                type: Sequelize.ENUM('Passenger', 'Driver', 'Store'),
                allowNull: false,
            },
            iUserId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
        },
        config,
    )

    BannerImpression.associate = model => {
        // Relations example
        BannerImpression.belongsTo(model.banner, { foreignKey: 'iAdvertBannerId' })
    }

    return BannerImpression
}
