import Sequelize from 'sequelize';
import User from '../models/user.model';
 
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
 
    this.models.User.hasMany(this.models.Project, { foreignKey: 'user_id', as: 'project_owner', onDelete: 'cascade', hooks: true });
    this.models.User.hasMany(this.models.Task, { foreignKey: 'created_by', as: 'user_created', onDelete: 'cascade', hooks: true })

    this.models.Project.belongsTo(this.models.User, { foreignKey: 'user_id', as: 'project_owner_info' });
    this.models.Project.hasMany(this.models.Task, { foreignKey: 'project_id', onDelete: 'cascade', as: 'project_task_info', hooks: true })
   
    this.models.Task.belongsTo(this.models.User, { foreignKey: 'created_by', as: 'user_created' });
    this.models.Task.belongsTo(this.models.Project, { foreignKey: 'project_id', as: 'task_project' });
    
    await this.sequelize.sync({ alter: false });
    console.log('Database Ready');
    
    return Promise.resolve();
  }
  
  getInstance = () => (this.models);
}
 
const DB = new DBFactory();
 
export { DB };
 

