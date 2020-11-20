import { Router } from 'express';
import WidgetController from '../controllers/widget.controller';
import AuthService from '../services/auth.service';

const router = new Router();

router.route('/inproject/:projectId')
    .get(AuthService.authUser, WidgetController.getAllProjectWidgets)
    .post(AuthService.authUser, WidgetController.createWidgetInProject);

router.route('/:widgetId')
    .get(AuthService.authUser, WidgetController.getWidgetById)
    .put(AuthService.authUser, WidgetController.updateWidgetById)
    .delete(AuthService.authUser, WidgetController.deleteWidgetById);

export default router;