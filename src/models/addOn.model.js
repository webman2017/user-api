module.exports = (sequelize, Sequelize, config) => {
    const addOn = sequelize.define(
        'mst_addon',
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            group_id: {
                type: Sequelize.INTEGER,
            },
            optional_name: {
                type: Sequelize.STRING,
            },
            price: {
                type: Sequelize.STRING,
            },
        },
        config,
    )
    addOn.associate = model => {
        // Relations example
        addOn.belongsTo(model.groupName, { foreignKey: 'group_id' })
        addOn.belongsTo(model.restaurantMenuGroup, { foreignKey: 'group_id', targetKey: 'group_id', sourceKey: 'group_id' })
        addOn.belongsTo(model.restaurantMenu, { foreignKey: 'menu_id', targetKey: 'menu_id', sourceKey: 'group_id' })
    }
    return addOn
}
