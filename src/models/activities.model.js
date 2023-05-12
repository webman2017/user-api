module.exports = (sequelize, Sequelize, config) => {
    const activities = sequelize.define(
        'cab_request_now',
        {
            iCabRequestId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            iUserId: {
                type: Sequelize.BIGINT,
                allowNull: true,
            },
            iDriverId: {
                type: Sequelize.INTEGER,
            },
            iCabBookingId: {
                type: Sequelize.STRING,
            },
            iDriverId: {
                type: Sequelize.STRING,
            },
            vSourceLatitude: {
                type: Sequelize.STRING,
            },
            vSourceLongitude: {
                type: Sequelize.STRING,
            },
            tSourceAddress: {
                type: Sequelize.STRING,
            },
            vDestLatitude: {
                type: Sequelize.STRING,
            },
            vDestLongitude: {
                type: Sequelize.STRING,
            },
            tDestAddress: {
                type: Sequelize.STRING,
            },
            vSenderName: {
                type: Sequelize.STRING,
            },
            vSenderMobile: {
                type: Sequelize.STRING,
            },
            eType: {
                type: Sequelize.INTEGER,
            },
            fAirportPickupSurge: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            fAirportPickupSurge: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            eStatus: {

                type: Sequelize.STRING,
                allowNull: true,

            },
            fAirportDropoffSurge: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            deliveryFee: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            ordersStatus: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            ePayType: {
                type: Sequelize.ENUM('Cash', 'Card', 'Paypal', 'Organization'),
                allowNull: true,
            },
            orderSum: {
                type: Sequelize.FLOAT,
                allowNull: true,
            },
            transactionId: {
                type: Sequelize.STRING,
                allowNull: true,
            },
        },
        config,
    )
    activities.associate = model => {
        // Relations example
        activities.hasOne(model.driver, { foreignKey: 'iDriverId', sourceKey: 'iDriverId', targetKey: 'iDriverId' })
        activities.hasMany(model.orders, { foreignKey: 'iCabRequestId', targetKey: 'iCabRequestId' })
        activities.belongsTo(model.deliverySave, { foreignKey: 'iCabRequestId', targetKey: 'iCabRequestId' })
        activities.belongsTo(model.deliverySaveDetail, {
            foreignKey: 'iCabRequestId', targetKey: 'iCabRequestId'
        })
    }
    return activities
}
