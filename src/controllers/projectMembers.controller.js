import Sequelize from 'sequelize';
import { DB } from '../config/db';
import _ from 'lodash';
import message from '../constants/messages';
import moment from 'moment';

const {gt, lte, ne, in: opIn, like} = Sequelize.Op;

class ProjectMembersControllerFactory {
    init = async() => {
        this.db = DB.getInstance();
        this.projectMembers = this.db.ProjectMembers;
        this.project = this.db.Project;
        this.user = this.db.User;
        this.task = this.db.Task;
    }

    getAllProjectMembersInProject = async (req, res) => {
        const projectId = req.query.projectId;
        let finalProjectMembers = [];

        try {
            const projectMembers = await this.projectMembers.findAll({
                where: {
                    projectId: projectId
                },
                attributes: ['userId', 'role'],
                include: [{
                    association: 'projectMembers_user',
                    attributes: ['firstName', 'lastName', 'jobTitle']
                }]
            });
            const memberExists = projectMembers.find(member => member.userId === req.user.id)
            if(!memberExists) {
                return res.status(403).send({ message: message.PROJECT.MEMBER});
            }
            
            await Promise.all(projectMembers.map( async projectMember => {
                if (projectMember.projectMembers_user != null) {
                    finalProjectMembers.push(projectMember)
                }
            }));

            return res.send(finalProjectMembers);
        } catch(e){
            console.log(e);
            return res.status(500).send(e);
        }
    }

    addNewProjectMember = async (req, res) => {
        const newBody = _.pick(req.body, [
            'project',
            'user'
        ]);

        const userId = req.user.id;
        let userExists = false;
        const projectId = newBody.project;

        try {

            const userProjectRole = await this.projectMembers.findOne({
                where: {
                    userId: userId,
                    projectId: projectId
                }
            });
            // Check if user that wants to add new project members is 'owner' or 'administrator'
            if(!userProjectRole || userProjectRole.role === 'regular') {
                return res.status(403).send({ message: message.MEMBER.ADD_MEMBER_NOT_ALLOWED });
            }

            const specificProject = await this.project.findOne({
                where: {
                    id: projectId
                },
                include: [{
                    association: 'project_member_info'
                }]
            });

            specificProject.project_member_info.forEach(member => {
                if(member.userId === newBody.user)
                    userExists = true;
            });
            if(userExists) {
                return res.status(403).send({ message: message.PROJECT.ALREADY_MEMBER });
            }

            const createdMember = await this.projectMembers.create({
                userId: newBody.user,
                projectId: newBody.project,
                role: 'regular',
                date_inserted: moment().format('YYYY-MM-DD HH:mm:ss')
            });

            return res.send({ message: message.PROJECT.USER_ADDED });
        } catch(e) {
            console.log('projectMembers.controller in addNewProjectMember method error:', e)
            return res.status(500).send(e);
        }
    }

    getProjectMemberById = async (req, res) => {
        const { memberId, projectId } = req.params;
        try {
            const projectMemberById = await this.projectMembers.findOne({
                where: {
                    userId: memberId,
                    projectId: projectId
                }
            });
            return res.send(projectMemberById);
        } catch (e) {
            return res.status(500).send(e);
        }
    }

    updateProjectMemberById = async (req,res) => {
        const { memberId, projectId } = req.params;
        const userId = req.user.id;
        const newBody = _.pick(req.body, [
            'role'
        ]);
        try {
            const userProjectRole = await this.projectMembers.findOne({
                where: {
                    userId: userId,
                    projectId: projectId
                }
            });

            // Check if user that wants to update project members is 'owner' or 'administrator'
            if(!userProjectRole || userProjectRole.role === 'regular') {
                return res.status(403).send({ message: message.MEMBER.ADD_MEMBER_NOT_ALLOWED });
            }
            if(newBody.role === 'owner'){
                return res.status(403).send({ message: message.MEMBER.CANNOT_SET_OWNER_ROLE });
            }
            if(newBody.role !== 'administrator' && newBody.role !== 'regular'){
                return res.status(406).send({ message: message.MEMBER.WRONG_ROLE_TYPE });
            }

            // Set new role type for a member
            await this.projectMembers.update( newBody, {
                where: {
                    userId: memberId,
                    projectId: projectId
                }
            });
          
            return res.send({ message: message.PROJECT.ROLE_CHANGED });
        } catch(e) {
            console.log(e);
            return res.status(500).send(e);
        }
    }

    removeProjectMember = async (req, res) => {
        const { memberId, projectId } = req.params;
        const userId = req.user.id;
        let userExists = false;
        let userOwner = false;
        try {
            const userProjectRole = await this.projectMembers.findOne({
                where: {
                    userId: userId,
                    projectId: projectId
                }
            });
            // Check if user that wants to add new project members is 'owner' or 'administrator'
            if(!userProjectRole || userProjectRole.role === 'regular') {
                return res.status(403).send({ message: message.MEMBER.REMOVE_MEMBER_NOT_ALLOWED });
            }

            const specificProject = await this.project.findOne({
                where: {
                    id: projectId
                },
                include: [{
                    association: 'project_member_info'
                }]
            });

            specificProject.project_member_info.forEach(member => {
                if(member.userId === parseInt(memberId)){
                    userExists = true;
                    if(member.role === 'owner'){
                        userOwner = true;
                    }
                }
            });
            if(!userExists) {
                return res.status(404).send({ message: message.PROJECT.USER_NOT_MEMBER });
            }
            if(userOwner){
                return res.status(403).send({ message: message.MEMBER.OWNER_RESTRICTED });
            }

            await this.projectMembers.destroy({
                where: {
                    projectId: projectId,
                    userId: memberId
                }
            });

            return res.send({ message: message.PROJECT.MEMBER_DELETED });
        } catch(e){
            console.log(e)
            return res.status(500).send(e);
        }
    }

    removeMyself = async (req, res) => {
        const { memberId, projectId } = req.params;
        const userId = req.user.id;
        let userExists = false;
        let userOwner = false;
        try {

            const userProjectRole = await this.projectMembers.findOne({
                where: {
                    userId: userId,
                    projectId: projectId
                }
            });
            // Check if user that wants to add new project members is 'owner' or 'administrator'
            if(!userProjectRole || userProjectRole.role === 'owner') {
                return res.status(403).send({ message: message.MEMBER.OWNER_RESTRICTED });
            }

            const specificProject = await this.project.findOne({
                where: {
                    id: projectId
                },
                include: [{
                    association: 'project_member_info'
                }]
            });

            specificProject.project_member_info.forEach(member => {
                if(member.userId === parseInt(memberId)){
                    userExists = true;
                    if(member.role === 'owner'){
                        userOwner = true;
                    }
                }
            });
            if(!userExists) {
                return res.status(404).send({ message: message.PROJECT.USER_NOT_MEMBER });
            }
            if(userOwner){
                return res.status(403).send({ message: message.MEMBER.OWNER_RESTRICTED });
            }

            // Find info in table 'project_members' that will be used in elasticsearch
            const removeMyselfProjectMemberInfo = await this.projectMembers.findOne({
                where: {
                    userId: memberId,
                    projectId: projectId
                }
            });

            // Remove user from this project
            await removeMyselfProjectMemberInfo.destroy();

            return res.send({ message: message.PROJECT.MEMBER_DELETED });
        } catch(e){
            console.log('projectMembers.controller in removeMyself method error: ', e);
            return res.status(500).send(e);
        }
    }

    getProjectOwner = async (req, res) => {
        const projectId = req.query.projectId;
        try{
            const projectOwner = await this.project.findOne({
                where: {
                    id: projectId
                },
                include: [{
                    association: 'project_owner_info',
                    attributes: {
                        exclude: ['userPassword', 'salt', 'tokenCode']
                    }
                }],
                attributes: []
            });
            return res.send(projectOwner);
        } catch (e) {
            return res.status(500).send(e);
        }
    }

}

const ProjectMembersController = new ProjectMembersControllerFactory();

export default ProjectMembersController;
