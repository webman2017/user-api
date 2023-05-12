module.exports = (sequelize, Sequelize, config) => {
    const deliverySaveDetail = sequelize.define(
        'trx_delivery_detail',
        {
            delivery_detail_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            title: {
                type: Sequelize.STRING,
            },
            name: {
                type: Sequelize.STRING,
            },
            addressName: {
                type: Sequelize.STRING,
            },
            addressDetail: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            lat: {
                type: Sequelize.STRING,
            },
            long: {
                type: Sequelize.STRING,
            },
            delivery_id: {
                type: Sequelize.INTEGER,
            },
            tel: {
                type: Sequelize.STRING,
            },
            typeItem: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            deliveryInstruction: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            iCabRequestId: {
                type: Sequelize.STRING,
                allowNull: true,
            },
        },
        config,
    )
    deliverySaveDetail.associate = model => {
        deliverySaveDetail.belongsTo(model.activities, { foreignKey: 'iCabRequestId', targetKey: 'iCabRequestId' })
        // Relations example
        // foodType.belongsTo(model.restaurantMenu, { foreignKey: 'id' })
    }
    return deliverySaveDetail
}