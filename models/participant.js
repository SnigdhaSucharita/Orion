module.exports = (sequelize, DataTypes) => {
    const participant = sequelize.define(
        "participant", 
        {
            meetingId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            userId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false
            },
            join_time: {
                type: DataTypes.STRING
            },
            leave_time: {
                type: DataTypes.STRING
            }
    },
    {
        timestamps: true
    }
);

    return participant;
};