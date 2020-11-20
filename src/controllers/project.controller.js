import Sequelize from 'sequelize';
import { DB } from '../config/db';
import _ from 'lodash';
import message from '../constants/messages';
import taskFunctions from '../inc/taskFunctions';
import projectFunctions from '../inc/projectFunctions';
import moment from 'moment';

const { gt, lte, ne, in: opIn, like, between, or } = Sequelize.Op;

class ProjectControllerFactory {
    init = async () => {
        this.db = DB.getInstance();
        this.project = this.db.Project;
        this.projectMembers = this.db.ProjectMembers;
        this.user = this.db.User;
        this.tasks = this.db.Task;
        this.widget = this.db.Widget;
        this.taskWidget = this.db.TaskWidget;
    }

    getAllUserProjects = async (req, res) => {
        try {
            const userProjects = await this.project.findAll({
                where: {
                    userId: req.user.id
                },
                order: [
                    ['projectName', 'ASC']
                ]
            });
            return res.send(userProjects);
        } catch (e) {
            return res.status(500).send(e);
        }
    }
    
    addNewProject = async (req, res) => {
        const newBody = _.pick(req.body, [
            'projectName',
            'description',            
        ]);

        const userId = req.user.id;
        try {
            const newProject = await this.project.create({
                userId: userId,
                ...newBody
            });

            // Add owner of created project into table 'project_members'
            const projectOwner = await this.projectMembers.create({
                projectId: newProject.id,
                userId: userId,
                role: 'owner',
                date_inserted: moment().format('YYYY-MM-DD HH:mm:ss')
            });

            // Insert default widgets in project
            const allNewProjectWidgets = await this.widget.bulkCreate([
                { projectId: newProject.id, type: 'URGENCY', name: 'Urgency', order_number: 1, edited: 0 },
                { projectId: newProject.id, type: 'COMPLETED', name: 'Completed', order_number: 2, edited: 0 },
                { projectId: newProject.id, type: 'RATING', name: 'Rating', order_number: 3, edited: 0 }
            ]);

            const defaultThreeTasks = await this.tasks.bulkCreate([
                { projectId: newProject.id, title: 'Task 1', description: null, created_by: userId, task_order: 1 },
                { projectId: newProject.id, title: 'Task 2', description: null, created_by: userId, task_order: 2 },
                { projectId: newProject.id, title: 'Task 3', description: null, created_by: userId, task_order: 3 }
            ]);

            // Insert task widgets for each task
            await Promise.all(allNewProjectWidgets.map(async eachWidget => {
                const eachWidgetType = eachWidget.dataValues.type;
                const eachWidgetId = eachWidget.dataValues.id;
                    
                await Promise.all(defaultThreeTasks.map(async eachTask => {
                    const eachTaskId = eachTask.dataValues.id;
                    await taskFunctions.insertTaskWidgetPerTask(eachWidgetType, eachTaskId, eachWidgetId);
                }));
            }));

            const newProjectInfo = {
                ...newProject.dataValues
            }

            return res.send(newProjectInfo);
        } catch (e) {
            console.log('Add New Project method error:', e);
            return res.status(500).send(e);
        }
    }

    getUserProjectById = async (req, res) => {
        const { projectId } = req.params;
        try {
            const usersProject = await this.project.findOne({
                where: {
                    id: projectId
                },
                attributes: ['id', 'userId', 'projectName', 'description'],
                include: {
                        association: 'project_owner_info',
                        attributes: ['firstName', 'lastName']
                    }
            });
            if (!usersProject) {
                return res.status(403).send({ message: message.PROJECT.USER_NOT_MEMBER })
            }
            return res.send(usersProject);
        } catch (e) {
            return res.status(500).send(e);
        }
    }

    updateUserProjectById = async (req, res) => {
        const { projectId } = req.params;
        const userId = req.user.id;
        const newBody = _.pick(req.body, [
            'projectName',
            'description',
        ]);

        try {
            const updateProject = await this.project.findOne({
                where: {
                    id: projectId
                },
                include: {
                    association: 'project_owner_info',
                    attributes: ['id', 'firstName', 'lastName']
                }
            });
            
            if (!updateProject) {
                return res.status(404).send({ message: message.PROJECT.DOES_NOT_EXIST });
            }
            if (newBody.project_name === '') {
                return res.status(404).send({ message: message.PROJECT.NO_EMPTY_NAME });
            }

            const updatedProject = await updateProject.update({ ...newBody });

            return res.status(200).send(updatedProject);

        } catch (e) {
            console.log(e);
            return res.status(500).send(e);
        }
    }

    deleteUserProjectById = async (req, res) => {
        const { projectId } = req.params;
        try {
            const deletedProject = await this.project.findOne({
                where: {
                    id: projectId
                }
            });
            if(!deletedProject) {
                return res.send({ message: message.PROJECT.DOES_NOT_EXIST });
            }

            await deletedProject.destroy();

            return res.send({
                message: message.PROJECT.DELETED,
            });
        } catch (e) {
            return res.status(500).send(e);
        }
    }

    getProjectByName = async (req, res) => {
        const title = req.query.title;

        try {
            const projectByName = await this.project.findAll({
                where: {
                    userId: req.user.id,
                    projectName: {
                        [like]: title
                    }
                }
            });
            return res.send(projectByName);
        } catch (e) {
            return res.status(500).send(e);
        }
    }
  
    duplicateProject = async (req, res) => {
        const { projectId } = req.params;
        const newBody = _.pick(req.body, [
            'projectName',
            'keepTasks',
            'keepMembers'
        ]);
        const userId = req.user.id;
        try {
            // Find project to be copied by ID
            const projectToBeCopied = await this.project.findOne({
                where: {
                    id: projectId
                }
            });

            // ############### Create new project - now old one is copied ###############
            const copiedProject = await this.project.create({
                userId: projectToBeCopied.userId,
                projectName: newBody.projectName,
                description: projectToBeCopied.description
            });
            const copiedProjectId = copiedProject.id;

            // ############### Add same widgets to copied project as those of old project ###############
            const oldProjectWidgets = await this.widget.findAll({
                where: {
                    projectId: projectId
                }
            });

            const newWidgets = await Promise.all(oldProjectWidgets.map(async eachWig => {
                // Insert same widgets to copied project
                const newWidget = await this.widget.create({
                    projectId: copiedProjectId,
                    type: eachWig.type,
                    name: eachWig.name,
                    order_number: eachWig.order_number
                });

                return { copiedWidget: newWidget, oldWidget: eachWig };
            }));

            // Check if user checked that he wants to keep tasks of that project (including subtasks and subtask_responsibles)
            if (newBody.keepTasks === 1) {
                const allTasksPerCopyingProject = await this.tasks.findAll({
                    where: {
                        projectId: projectId
                    }
                });
                const copiedTasks = await Promise.all(allTasksPerCopyingProject.map(async taskToBeCopied => {

                    const copiedTask = await this.tasks.create({
                        'projectId': copiedProjectId,
                        'title': taskToBeCopied.title,
                        'description': taskToBeCopied.description,
                        'created_by': taskToBeCopied.created_by,
                        'task_order': taskToBeCopied.task_order
                    });
                    const copiedTaskId = copiedTask.id;

                    await Promise.all(newWidgets.map(async (widget) => {

                        const oldTaskWidgets = await this.taskWidget.findAll({
                            where: {
                                taskId: taskToBeCopied.id,
                                widgetId: widget.oldWidget.id
                            }
                        });

                        await Promise.all(oldTaskWidgets.map(async eachTaskWig => {
                                await this.taskWidget.create({
                                    taskId: copiedTaskId,
                                    widgetId: widget.copiedWidget.id,
                                    urgency: eachTaskWig.urgency,
                                    completed_percentage: eachTaskWig.completed_percentage,
                                    rating: eachTaskWig.rating
                                });
                            
                        }));
                    }));

                    return {
                        old: taskToBeCopied,
                        new: copiedTask
                    };
                }));

            }

            if (newBody.keepMembers === 1) {
                // Find all project members for old project
                const oldProjectMembers = await this.projectMembers.findAll({
                    where: {
                        projectId: projectId
                    }
                });

                await Promise.all(oldProjectMembers.map(async eachMember => {
                    // Insert into 'project_members', 'subtask_sorting', 'project_view', 'default_members'
                    await projectFunctions.insertProjectMembersInfo(copiedProjectId, eachMember.userId, eachMember.role);
                }));
            } else {
                // Insert all relevant data only for owner
                await projectFunctions.insertProjectMembersInfo(copiedProjectId, copiedProject.userId, 'owner');
            }

            // Count total project tasks number
            const projectTaskNumber = await this.tasks.count({
                where: {
                    projectId: copiedProjectId
                }
            });

            const projectInfo = {
                ...copiedProject.dataValues,
                "taskNumber": projectTaskNumber,
                "project_description": projectToBeCopied.dataValues.project_description
            }

            return res.send(projectInfo);
        } catch (e) {
            console.log(e);
            return res.status(500).send(e)
        }
    }

}

const ProjectController = new ProjectControllerFactory();

export default ProjectController;
