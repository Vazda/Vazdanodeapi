import { Router } from 'express';
import TaskController from '../controllers/task.controller';
import AuthService from '../services/auth.service';

const router = new Router();

router.route('/forproject/:projectId')
    .get(AuthService.authUser, TaskController.getallTasksPerProject);

router.route('/')
    .post(AuthService.authUser, TaskController.addNewTask);

router.route('/:taskId')
    .get(AuthService.authUser, TaskController.getTaskById)
    .put(AuthService.authUser, TaskController.updateTaskById)
    .delete(AuthService.authUser, TaskController.deleteTaskById);

router.route('/filter/:projectId')
    .get(AuthService.authUser, TaskController.getTaskByName);

router.route('/taskWidget/:taskWidgetId')
    .delete(AuthService.authUser, TaskController.deleteTaskWidgetById);

router.route('/task/:taskId/widget/:widgetId')
    .put(AuthService.authUser, TaskController.updateTaskWidgetByIdNew);


export default router;