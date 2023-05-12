module.exports = (sequelize, Sequelize, config) => {
    const runningNumber = sequelize.define(
        "trx_runningNumber",
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            type: {
                type: Sequelize.STRING,
            },
            date: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            runningNumber: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
        },
        config
    );

    runningNumber.associate = (model) => {
        // Relations example
        // Restaurant.belongsTo(model.modelXXX, { foreignKey: 'xxx_id' })
    };
    return runningNumber;
};
