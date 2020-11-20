import Sequelize from 'sequelize';
import { DB } from '../config/db';
import _ from 'lodash';
import message from '../constants/messages';
import taskFunctions from '../inc/taskFunctions';

const { gt, lte, ne, in: opIn, like, eq, notLike, or } = Sequelize.Op;


class WidgetControllerFactory {
    init = async () => {
        this.db = DB.getInstance();
        this.widget = this.db.Widget;
        this.projectMembers = this.db.ProjectMembers;
        this.task = this.db.Task;
        this.taskWidget = this.db.TaskWidget;
        this.project = this.db.Project;
    }

    getAllProjectWidgets = async (req, res) => {
        const { projectId } = req.params;
        const userId = req.user.id;
        try {
            // First of all check if user is member of that project
            // const checkIfUserIsProjectMember = await this.projectMembers.findOne({
            //     where: {
            //         project_id: projectId,
            //         user_id: userId
            //     }
            // });
            // if (!checkIfUserIsProjectMember) {
            //     return res.status(403).send({ message: message.PROJECT.USER_NOT_MEMBER });
            // }
            // Find all created widgets in that project
            const allProjectWidgets = await this.widget.findAll({
                where: {
                    projectId: projectId
                }
            });
            if (allProjectWidgets.length == 0) {
                return res.status(403).send({ message: message.WIDGETS.NO_WIDGETS });
            }
            return res.send(allProjectWidgets);
        } catch (e) {
            return res.status(500).send(e);
        }
    }

    createWidgetInProject = async (req, res) => {
        const { projectId } = req.params;
        const userId = req.user.userID;
        const newBody = _.pick(req.body, [
            'type'
        ]);
        try {

            // // First of all check if user is member of that project
            // const checkIfUserIsProjectMember = await this.projectMembers.findOne({
            //     where: {
            //         project_id: projectId,
            //         user_id: userId
            //     }
            // });
            // if (!checkIfUserIsProjectMember) {
            //     return res.status(403).send({ message: message.PROJECT.USER_NOT_MEMBER });
            // }

            let typeWidget = newBody.type;
            let newWidgetName = '';

            // Count total number of widgets
            const totalNumberOfWidgets = await this.widget.count({
                where: {
                    projectId: projectId,
                    type: typeWidget
                }
            });

            // Count total number of widgets THAT ARE EDITED
            const totalNumberOfEditedWidgets = await this.widget.count({
                where: {
                    projectId: projectId,
                    type: typeWidget,
                    edited: 1
                }
            });

            // This if statement is fullfit if there is no edited widgets
            if(totalNumberOfEditedWidgets === 0){
                if ( totalNumberOfWidgets === 0) {
                    newWidgetName = (typeWidget.charAt(0).toUpperCase() + typeWidget.slice(1).toLowerCase());
                } else {
                    newWidgetName = (typeWidget.charAt(0).toUpperCase() + typeWidget.slice(1).toLowerCase()) + ' ' + totalNumberOfWidgets;
                }
            }
            if(totalNumberOfEditedWidgets >= 1){
                // Find last NON modified widget name of same widget type
                const lastNonEditedWidget = await this.widget.findOne({
                    where: {
                        projectId: projectId,
                        type: typeWidget,
                        edited: 0
                    },
                    order: [["id", "DESC"]],
                    limit: 1
                });
                let nonEditedWidgetName = lastNonEditedWidget.name;
                let nameArray = nonEditedWidgetName.split(' ');
                let numberInWidgetName = 1;
                if(nameArray[1]){
                    numberInWidgetName = parseInt(nameArray[1]) + 1;
                }
                newWidgetName = (typeWidget.charAt(0).toUpperCase() + typeWidget.slice(1).toLowerCase()) + ' ' + numberInWidgetName;
            }

            // Find total number of widgets in selected project which will be used for ordering,
            // which means last created widget will be last in list
            const totalWidgetsPerProject = await this.widget.count({
                where: {
                    projectId: projectId
                }
            });
           
            // Create widget in selected project
            const newWidget = await this.widget.create({
                projectId: projectId,
                ...newBody,
                name: newWidgetName,
                order_number: totalWidgetsPerProject + 1,
                edited: 0
            });
            // create taskWidget in all tasks in this project

            // Find all tasks in specific project
            const tasksInProject = await this.task.findAll({
                where: {
                    projectId: projectId
                }
            });

            await Promise.all(tasksInProject.map(async task => {
                const eachTaskId = task.dataValues.id;
                
                await taskFunctions.insertTaskWidgetPerTask(newBody.type, eachTaskId, newWidget.id);

            }));

            return res.send(newWidget);
        } catch (e) {
            console.log(e)
            return res.status(500).send(e);
        }
    }

    getWidgetById = async (req, res) => {
        const { widgetId } = req.params;
        const userId = req.user.id;
        try {
            // Find specific widget
            const widgetById = await this.widget.findOne({
                where: {
                    id: widgetId
                }
            });

            // // First of all check if user is member of that project
            // const checkIfUserIsProjectMember = await this.projectMembers.findOne({
            //     where: {
            //         project_id: widgetById.project_id,
            //         user_id: userId
            //     }
            // });
            // if (!checkIfUserIsProjectMember) {
            //     return res.status(403).send({ message: message.PROJECT.USER_NOT_MEMBER });
            // }
            // Throw error if there is no widget found by ID
            if (!widgetById) {
                return res.status(403).send({ message: message.WIDGETS.NO_SUCH_WIDGET });
            }
            return res.send(widgetById);
        } catch (e) {
            return res.status(500).send(e);
        }
    }

    updateWidgetById = async (req, res) => {
        const { widgetId } = req.params;
        const userId = req.user.id;
        const newBody = _.pick(req.body, [
            'name'
        ]);
        try {
            // Find specific widget
            const widgetById = await this.widget.findOne({
                where: {
                    id: widgetId
                }
            });

            // // First of all check if user is member of that project
            // const checkIfUserIsProjectMember = await this.projectMembers.findOne({
            //     where: {
            //         project_id: widgetById.project_id,
            //         user_id: userId
            //     }
            // });
            // if (!checkIfUserIsProjectMember) {
            //     return res.status(403).send({ message: message.PROJECT.USER_NOT_MEMBER });
            // }
            // Throw error if there is no widget found by ID
            if (!widgetById) {
                return res.status(403).send({ message: message.WIDGETS.NO_SUCH_WIDGET });
            }

            await widgetById.update({ ...newBody });

            return res.send(widgetById);
        } catch (e) {
            return res.status(500).send(e);
        }
    }

    deleteWidgetById = async (req, res) => {
        const { widgetId } = req.params;
        const userId = req.user.id;
        try {
            // Find specific widget
            const widgetById = await this.widget.findOne({
                where: {
                    id: widgetId
                }
            });
            const deletedWidgetPosition = widgetById.order_number;

            // First of all check if user is member of that project
            // const checkIfUserIsProjectMember = await this.projectMembers.findOne({
            //     where: {
            //         project_id: widgetById.project_id,
            //         user_id: userId
            //     }
            // });
            // if (!checkIfUserIsProjectMember) {
            //     return res.status(403).send({ message: message.PROJECT.USER_NOT_MEMBER });
            // }

            if (!widgetById) {
                return res.status(403).send({ message: message.WIDGETS.NO_SUCH_WIDGET });
            }

            // Find all widgets in project, and update theri positions after widget delete
            const allProjectWidgets = await this.widget.findAll({
                where: {
                    projectId: widgetById.projectId
                },
                order: [['order_number', 'ASC']]
            });

            const allWidgets = await this.project.findOne({
                where: {
                    id: widgetById.projectId
                },
                include: [{
                    association: 'project_widget_info',
                    attributes: ['type', 'name', 'id'],
                    required: true
                }]
            });

            // Loop through each widget, and if its position is less then deleted's widget, update it's position
            await Promise.all(allProjectWidgets.map(async eachWidget => {
                if(eachWidget.order_number > deletedWidgetPosition){
                    await eachWidget.update({ order_number: (eachWidget.order_number - 1) });
                }
            }));
            // Remove all taskWidgets where is this widgetId
            await Promise.all(allWidgets.dataValues.project_widget_info.map(async widget => {
                await this.taskWidget.destroy({
                    where: {
                        widgetId: widgetId
                    }
                })
            }));

            await widgetById.destroy();

            return res.send({ message: message.WIDGETS.WIDGET_DELETED });
        } catch (e) {
            return res.status(500).send(e);
        }
    }
}

const WidgetController = new WidgetControllerFactory();

export default WidgetController;
