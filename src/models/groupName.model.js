module.exports = (sequelize, Sequelize, config) => {
    const groupName = sequelize.define(
        'group_name',
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            group_name: {
                type: Sequelize.STRING,
            },
            selected_less: {
                type: Sequelize.INTEGER,
            },
            selected_less_description: {
                type: Sequelize.STRING,
            },
            selected_max_description: {
                type: Sequelize.STRING,
            },
            selected_max: {
                type: Sequelize.INTEGER,
            },
        },
        config,
    )
    groupName.associate = model => {
        // Relations example
        groupName.hasMany(model.restaurantMenuGroup, { foreignKey: 'group_id', targetKey: 'id', sourceKey: 'id' })
        groupName.hasMany(model.addOn, { foreignKey: 'group_id', targetKey: 'id', sourceKey: 'id' })
    }
    return groupName
}
