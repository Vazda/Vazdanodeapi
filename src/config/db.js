import Sequelize from 'sequelize';
import User from '../models/user.model';
import Project from '../models/project.model';
import Task from '../models/task.model';
import Widget from '../models/widget.model.js';
import TaskWidget from '../models/taskWidget.model.js';
import ProjectMembers from '../models/projectMembers.model';
 
class DBFactory {
  constructor() {
    console.log("AA:", process.env.DB_URL)
    this.sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_URL,
      port: process.env.DB_PORT,
      dialect: 'mysql',
      pool: {
        max: 5,
        min: 2,
        acquire: 1200000,
        idle: 1000000,
      },
      logging: false
    });
  
    this.models = {};
    this.queue = [];
  }
  
  addToQueue = (fun) => {
    this.queue.push(fun);
  }
  
  init = async () => {

    this.models.User = User(this.sequelize);
    this.models.Project = Project(this.sequelize);
    this.models.Task = Task(this.sequelize);
    this.models.Widget = Widget(this.sequelize);
    this.models.TaskWidget = TaskWidget(this.sequelize);
    this.models.ProjectMembers = ProjectMembers(this.sequelize);
 
    this.models.User.hasMany(this.models.Project, { foreignKey: 'userId', as: 'project_owner', onDelete: 'cascade', hooks: true });
    this.models.User.hasMany(this.models.Task, { foreignKey: 'created_by', as: 'user_created', onDelete: 'cascade', hooks: true });
    this.models.User.hasMany(this.models.ProjectMembers, { foreignKey: 'userId', as: 'user_info2', onDelete: 'cascade', hooks: true });

    this.models.Project.belongsTo(this.models.User, { foreignKey: 'userId', as: 'project_owner_info' });
    this.models.Project.hasMany(this.models.Task, { foreignKey: 'projectId', onDelete: 'cascade', as: 'project_task_info', hooks: true });
    this.models.Project.hasMany(this.models.Widget, { foreignKey: 'projectId', as: 'project_widget_info', onDelete: 'cascade', hooks: true });
    this.models.Project.hasMany(this.models.ProjectMembers, { foreignKey: 'projectId', as: 'project_member_info', onDelete: 'cascade', hooks: true });
   
    this.models.ProjectMembers.belongsTo(this.models.Project, { foreignKey: 'projectId', as: 'project_projectMembers' });
    this.models.ProjectMembers.belongsTo(this.models.User, { foreignKey: 'userId', as: 'projectMembers_user' });

    this.models.Task.belongsTo(this.models.User, { foreignKey: 'created_by', as: 'user_created' });
    this.models.Task.belongsTo(this.models.Project, { foreignKey: 'projectId', as: 'task_project' });
    this.models.Task.hasMany(this.models.TaskWidget, { foreignKey: 'taskId', as: 'task_taskWidget_info', onDelete:'cascade', hooks: true });

    this.models.TaskWidget.belongsTo(this.models.Widget, { foreignKey: 'widgetId', as: 'taskWidget_widget_info' });
    this.models.TaskWidget.belongsTo(this.models.Task, { foreignKey: 'taskId', as: 'taskWidget_task_info' });

    await this.sequelize.sync({ alter: false });
    console.log('Database Ready');
    
    return Promise.resolve();
  }
  
  getInstance = () => (this.models);
}
 
const DB = new DBFactory();
 
export { DB };
 

