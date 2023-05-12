module.exports = (sequelize, Sequelize, config) => {
    const RegisterDriver = sequelize.define(
        "mst_driver",
        {
            iDriverId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                // defaultValue: Sequelize.INTEGER,
                autoIncrement: true,
            },
            vName: {
                type: Sequelize.STRING,
            },
            vLastName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            vPhone: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            vImage: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            vAvgRating: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            driverId: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        config
    );
    RegisterDriver.associate = (model) => {
        // RegisterDriver.hasMany(model.activities, { foreignKey: 'iDriverId', targetKey: 'iDriverId' })
        // Relations example
        // RegisterDriver.belongsTo(model.activities, { foreignKey: 'iDriverId' })
    };
    return RegisterDriver;
};
