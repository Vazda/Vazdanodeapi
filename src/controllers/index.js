import ProjectController from './project.controller';
import TaskController from './task.controller';
import UserController from './user.controller';
import WidgetController from './widget.controller';
import ProjectMembersController from './projectMembers.controller';

const INIT_FUNCTIONS = [
    UserController.init,
    ProjectController.init,
    TaskController.init,
    WidgetController.init,
    ProjectMembersController.init
];

const reinit = () => {
    INIT_FUNCTIONS.forEach(init => init())
}

export default reinit;
