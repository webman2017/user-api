module.exports = (sequelize, Sequelize, config) => {
    const categoriesRestaurant2 = sequelize.define(
        'categories_restaurant2',
        {
            cat_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            cat_name: {
                type: Sequelize.INTEGER,
            },
            emoji: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            internationalName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            iconFullUrl: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            iconUrl: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            eStatus: {
                type: Sequelize.STRING,
                allowNull: false,
            }
        },
        config,
    )
    categoriesRestaurant2.associate = model => {
        // Relations example
        categoriesRestaurant2.belongsTo(model.restaurant, { foreignKey: 'cat_id', sourceKey: 'CatID2', })

        // categoriesRestaurant2.belongsTo(model.restaurant, { foreignKey: 'cat_id', sourceKey: 'CatID2' })
        // Restaurant.belongsTo(model.modelXXX, { foreignKey: 'xxx_id' })
    }
    return categoriesRestaurant2
}
