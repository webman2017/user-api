module.exports = (sequelize, Sequelize, config) => {
    const foodDetails = sequelize.define(
        'trx_order_details',
        {
            order_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            menu_id: {
                type: Sequelize.INTEGER,
            },
            menu_name: {
                type: Sequelize.STRING,
            },
            request_message: {
                type: Sequelize.TEXT,
            },
            price_exact: {
                type: Sequelize.INTEGER,
            },
            price_sale: {
                type: Sequelize.INTEGER,
            },
            qty: {
                type: Sequelize.INTEGER,
            },
            price_sum: {
                type: Sequelize.INTEGER,
            }
        },
        config,
    )
    foodDetails.associate = model => {
        // Relations example
        // foodType.belongsTo(model.restaurantMenu, { foreignKey: 'id' })
    }
    return foodDetails
}
