import { Router } from 'express';
import ProjectController from '../controllers/project.controller';
import AuthService from '../services/auth.service';

const router = new Router();

router.route('/')
    .get(AuthService.authUser, ProjectController.getAllUserProjects)
    .post(AuthService.authUser, ProjectController.addNewProject);

router.route('/filter')
    .get(AuthService.authUser, ProjectController.getProjectByName);

router.route('/duplicate-project/:projectId')
    .post(AuthService.authUser, ProjectController.duplicateProject);

router.route('/:projectId')
    .get(AuthService.authUser, ProjectController.getUserProjectById)
    .put(AuthService.authUser, ProjectController.updateUserProjectById)
    .delete(AuthService.authUser, ProjectController.deleteUserProjectById);

export default router;