import UserController from './user.controller';

const INIT_FUNCTIONS = [UserController.init];

const reinit = () => {
    INIT_FUNCTIONS.forEach(init => init())
}

export default reinit;
