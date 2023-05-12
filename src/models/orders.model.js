module.exports = (sequelize, Sequelize, config) => {
    const orders = sequelize.define(
        'trx_orders',
        {
            order_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,

            },
            order_sum: {
                type: Sequelize.INTEGER,
            },
            order_date: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            iCabRequestId: {
                type: Sequelize.INTEGER,
            },
            restaurant_id: {
                type: Sequelize.INTEGER,
            },
            address: {
                type: Sequelize.STRING,
            },
            address_detail: {
                type: Sequelize.STRING,
            },
            message: {
                type: Sequelize.STRING,
                allowNull: true,
            },

        },
        config,
    )
    orders.associate = model => {
        // Relations example
        orders.belongsTo(model.orderDetails, { foreignKey: 'order_id' })
        orders.belongsTo(model.restaurant, { foreignKey: 'restaurant_id', targetKey: 'restaurant_id' })
    }
    return orders
}
