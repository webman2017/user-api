module.exports = (sequelize, Sequelize, config) => {
    const restaurantMenuGroup = sequelize.define(
        'restaurant_menu_group',
        {
            related_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            group_id: {
                type: Sequelize.INTEGER,
            },
            restaurant_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            restaurant_menu_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
        },
        config,
    )
    restaurantMenuGroup.associate = model => {
        // Relations example

        restaurantMenuGroup.belongsTo(model.groupName, { foreignKey: 'group_id', targetKey: 'id', sourceKey: 'id' })
        // restaurantMenuGroup.belongsTo(model.restaurantMenu, { foreignKey: 'restaurant_menu_id' })
        restaurantMenuGroup.hasMany(model.restaurantMenu, { foreignKey: 'menu_id', targetKey: 'restaurant_menu_id', sourceKey: 'restaurant_menu_id' })
        restaurantMenuGroup.belongsTo(model.addOn, { foreignKey: 'group_id', targetKey: 'group_id', sourceKey: 'group_id' })

    }
    return restaurantMenuGroup
}
