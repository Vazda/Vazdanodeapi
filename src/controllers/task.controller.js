import Sequelize from 'sequelize';
import { DB } from '../config/db';
import _ from 'lodash';
import Functions from '../inc/functions';
import taskFunctions from '../inc/taskFunctions';
import message from '../constants/messages';


const { gt, gte, lte, ne, in: opIn, like, eq, notLike, or, notIn } = Sequelize.Op;

class TaskControllerFactory {
    init = async () => {
        this.db = DB.getInstance();
        this.task = this.db.Task;
        this.user = this.db.User;
        this.taskWidget = this.db.TaskWidget;
        this.project = this.db.Project;
        this.widget = this.db.Widget;
    }

    getallTasksPerProject = async (req, res) => {
        const { projectId } = req.params;
        const userId = req.user.id;
        try {

            // Find all tasks in specific project
            const tasksInProject = await this.task.findAll({
                where: {
                    projectId: projectId,
                },
                include: {
                    association: 'task_taskWidget_info',
                }
            });

            return res.send(tasksInProject);
        } catch (e) {
            return res.status(500).send(e)
        }
    }

    addNewTask = async (req, res) => {
        const newBody = _.pick(req.body, [
            'projectId',
            'title',
            'description'
        ]);
        const userId = req.user.id;
        try {
            
            let task_order = 1;
            let widgetsInfo;
            const allWidgetsInfo = [];

            const allWidgets = await this.project.findOne({
                where: {
                    id: newBody.projectId
                },
                include: [
                    {
                        association: 'project_widget_info',
                        attributes: ['type', 'name', 'id'],
                    }
                ]
            });
            
            const numberOfTasksInProject = await this.task.count({
                where: {
                    projectId: newBody.projectId
                }
            });

            if (numberOfTasksInProject) {
                task_order = numberOfTasksInProject + 1;
            }

            const newTask = await this.task.create({
                projectId: newBody.projectId,
                title: newBody.title,
                description: newBody.description,
                created_by: userId,
                task_order: task_order
            });

            await Promise.all(allWidgets.dataValues.project_widget_info.map(async widget => {
                const eachWidgetType = widget.dataValues.type;
                const eachWidgetId = widget.dataValues.id;
                
                // Call function which will insert task widget for each task
                widgetsInfo = await taskFunctions.insertTaskWidgetPerTask(eachWidgetType, newTask.id, eachWidgetId);
                
                allWidgetsInfo.push({
                    ...widgetsInfo
                });
            })); 
            
            const newTaskInfo = {
                ...newTask.dataValues,
                "task_taskWidget_info": allWidgetsInfo
            };

            return res.send(newTaskInfo);
        } catch (e) {
            console.log('Add New Task method error: ', e);
            return res.status(500).send(e);
        }
    }

    updateTaskById = async (req, res) => {
        const { taskId } = req.params;
        const userId = req.user.id;
        const newBody = _.pick(req.body, [
            'title',
            'description'
        ]);

        try {
            const taskById = await this.task.findOne({
                where: {
                    id: taskId
                },
                include: {
                    association: 'task_project',
                    required: true,
                    attributes: ['projectName', 'description'],
                }
            });

            if (!taskById) {
                return res.status(403).send({ message: message.TASK.NOT_FOUND });
            }
                        
            const updatedTask = await taskById.update({
                ...newBody
            });

            return res.send(updatedTask);
        } catch (e) {
            console.log('Update Task By Id method error: ', e);
            return res.status(500).send(e);
        }
    }

    getTaskById = async (req, res) => {
        const { taskId } = req.params;
        const userId = req.user.id;
        try {
            const taskById = await this.task.findOne({
                where: {
                    id: taskId
                },
                include: {
                    association: 'task_taskWidget_info',
                }
            });

            if (!taskById) {
                return res.status(403).send({ message: message.TASK.NOT_FOUND });
            }

            return res.send(taskById);
        } catch (e) {
            return res.status(500).send(e);
        }
    }

    deleteTaskById = async (req, res) => {
        const { taskId } = req.params;
        try {
            const taskById = await this.task.findOne({
                where: {
                    id: taskId
                },
                include: {
                    association: 'task_project',
                    required: true,
                    attributes: [],
                }
            });
            
            if (!taskById) {
                return res.status(403).send({ message: message.TASK.NOT_FOUND });
            }

            await taskById.destroy();

            return res.send({ message: message.TASK.DELETED });
        } catch (e) {
            console.log(e);
            return res.status(500).send(e);
        }
    }

    getTaskByName = async (req, res) => {
        const { projectId } = req.params;
        const title = req.query.title;
        try {
            
            const taskByName = await this.task.findAll({
                where: {
                    projectId: projectId,
                    title: {
                        [like]: title
                    }
                }
            });
            return res.send(taskByName);
        } catch (e) {
            return res.status(500).send(e);
        }
    }

    deleteTaskWidgetById = async (req, res) => {
        const { taskWidgetId } = req.params;
        try {
            const taskWidgetById = await this.taskWidget.findOne({
                where: {
                    id: taskWidgetId
                }
            });

            if (!taskWidgetById) {
                return res.status(403).send({ message: message.WIDGETS.NO_SUCH_WIDGET });
            }

            await taskWidgetById.destroy();

            return res.send({ message: message.WIDGETS.DELETED });
        } catch (e) {
            return res.status(500).send(e);
        }
    }

    updateTaskWidgetByIdNew = async (req, res) => {
        const { taskId, widgetId } = req.params;
        const userId = req.user.id;
        const newBody = _.pick(req.body, [
            'urgency',
            'completed_percentage',
            'rating',
        ]);
        
        try {

            const taskWidgetById = await this.taskWidget.findOne({
                where: {
                    taskId: taskId,
                    widgetId: widgetId
                }
            });

            if (!taskWidgetById) {
                return res.status(403).send({ message: message.WIDGETS.NO_SUCH_WIDGET });
            }

            if (newBody.urgency) {
                let oldUrgency = Functions.urgencyName(taskWidgetById.dataValues.urgency);
                let newUrgency = Functions.urgencyName(newBody.urgency);
            }                
            if (newBody.rating) {
                let oldRating = Functions.ratingName(taskWidgetById.dataValues.rating);
                let newRating = Functions.ratingName(newBody.rating);
            }

            const updatedTaskWidget = await taskWidgetById.update(
                {
                    ...newBody
                }
            );

            return res.send(updatedTaskWidget); 

        } catch (e) {
            console.log(e);
            return res.status(500).send(e);
        }
    }

}

const TaskController = new TaskControllerFactory();

export default TaskController;
