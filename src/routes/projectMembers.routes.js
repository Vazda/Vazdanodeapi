import { Router } from 'express';
import ProjectMembersController from '../controllers/projectMembers.controller';
import AuthService from '../services/auth.service';

const router = new Router();

router.route('/')
    .get(AuthService.authUser, ProjectMembersController.getAllProjectMembersInProject)
    .post(AuthService.authUser, ProjectMembersController.addNewProjectMember);

router.route('/owner')
    .get(AuthService.authUser, ProjectMembersController.getProjectOwner);

router.route('/:memberId/inproject/:projectId')
    .get(AuthService.authUser, ProjectMembersController.getProjectMemberById)
    .put(AuthService.authUser, ProjectMembersController.updateProjectMemberById)
    .delete(AuthService.authUser, ProjectMembersController.removeProjectMember);

router.route('/removeMyself/:memberId/inproject/:projectId')
    .delete(AuthService.authUser, ProjectMembersController.removeMyself);


export default router;
