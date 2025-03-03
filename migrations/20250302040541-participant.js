"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("participants", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      meetingId: { type: Sequelize.STRING, allowNull: false },
      userId: { type: Sequelize.STRING, allowNull: false },
      username: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false },
      join_time: { type: Sequelize.STRING },
      leave_time: { type: Sequelize.STRING },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("participants");
  },
};
