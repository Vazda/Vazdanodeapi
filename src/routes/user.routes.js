import { Router } from 'express';
import UserController from '../controllers/user.controller';
import AuthService from '../services/auth.service';

const router = new Router();

router.route('/')
    .post(UserController.signup);

router.route('/all-users')
    .get(UserController.getAllUsers);

router.route('/change-password')
    .put(UserController.changePassword);

router.route('/forgot-password')
    .post(UserController.forgotPassword);

router.route('/login')
    .post(UserController.login);

router.route('/verify')
    .get(UserController.verifyAccount);

router.route('/aboutMe')
    .get(AuthService.authUser, UserController.aboutMe);

router.route('/:userId')
    .get(AuthService.authUser, UserController.getUserById)
    .put(AuthService.authUser, UserController.updateUserById)
    .delete(AuthService.authUser, UserController.deleteUserById);

export default router;
