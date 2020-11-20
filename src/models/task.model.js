import Sequelize from 'sequelize';
module.exports = function (sequelize, DataTypes = Sequelize) {
  const Task = sequelize.define('tasks', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    projectId: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    created_by: {
        type: DataTypes.INTEGER(11),
        allowNull: false
    },
    task_order: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    timestamps: true
  });

  
  return Task;
};
