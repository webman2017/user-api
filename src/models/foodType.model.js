module.exports = (sequelize, Sequelize, config) => {
    const foodType = sequelize.define(
        'mst_food_type',
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            food_type_name: {
                type: Sequelize.STRING,

            },
        },
        config,
    )
    foodType.associate = model => {
        // Relations example
        foodType.belongsTo(model.restaurantMenu, { foreignKey: 'id' })
    }
    return foodType
}
