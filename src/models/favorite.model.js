module.exports = (sequelize, Sequelize, config) => {
    const favorite = sequelize.define(
        'trx_favorite_restaurant',
        {
            fave_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            user_id: {
                allowNull: true,
                type: Sequelize.INTEGER,

            },
            restaurant_id: {
                allowNull: true,
                type: Sequelize.JSON,

            },
            created_at: {
                allowNull: true,
                type: Sequelize.STRING,

            },

        },
        config,
    )
    favorite.associate = model => {
    }
    return favorite
}
