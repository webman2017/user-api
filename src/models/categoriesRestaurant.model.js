module.exports = (sequelize, Sequelize, config) => {
    const categoriesRestaurant = sequelize.define(
        'categories_restaurant',
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
    categoriesRestaurant.associate = model => {
        // Relations example
        categoriesRestaurant.belongsTo(model.restaurant, { foreignKey: 'cat_id', sourceKey: 'CatID' })

        // Restaurant.belongsTo(model.modelXXX, { foreignKey: 'xxx_id' })
    }


    return categoriesRestaurant
}
