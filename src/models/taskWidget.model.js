import Sequelize from 'sequelize';
module.exports = function (sequelize, DataTypes = Sequelize) {
  const TaskWidget = sequelize.define('task_widgets', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    taskId: {
        type: DataTypes.INTEGER(11),
        allowNull: true
    },
    widgetId: {
        type: DataTypes.INTEGER(11),
        allowNull: true
    },
    urgency: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
        defaultValue: null
    },
    completed_percentage: {
        type: DataTypes.INTEGER(3),
        allowNull: true,
        defaultValue: null
    },
    rating: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
        defaultValue: null
      }
  }, {
    timestamps: true
  });

  
  return TaskWidget;
};
