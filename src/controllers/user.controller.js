import { DB } from '../config/db';
import Sequelize from 'sequelize';
import HelperFunctions from '../services/helperFunctions';
import { createToken } from '../services/passport.service';
import jwt from 'jsonwebtoken';
import Utils from '../services/utilis';
import _ from 'lodash';
import md5 from 'md5';
import uniqid from 'uniqid';

const { op, ne, is, lte, or } = Sequelize.Op;


class UserControllerFactory {
    init = () => {
        this.db = DB.getInstance();
        this.user = this.db.User;
    }


signup = async (req, res) => {

    const newBody = _.pick(req.body, [
      'firstName',
      'lastName',
      'email',
      'password'
    ]);

    try {
      const checkEmail = await HelperFunctions.checkEmailFormat(newBody.email);
      if (!checkEmail) {
        return res.send({
          message: "Sorry. You've entered incorrect format of email address.",
        });
      }
      const userExists = await this.user.findOne({
        where: {
          email: newBody.email,
        },
      });
      if (userExists) {
        return res.status(409).send({
          message: 'Sorry! Email already exists. Please use another one.',
        });
      }

      const userPasswordInfo = Utils.saltHashPassword(newBody.password);
      let token = md5(uniqid(Math.random()));

      const user = await this.User.create({
        firstName: newBody.firstName,
        lastName: newBody.lastName,
        email: newBody.email,
        jobTitle: newBody.jobTitle,
        password: userPasswordInfo.passwordHash,
        salt: userPasswordInfo.salt,
        tokenCode: token,
        userStatus: 'N'
      });

    //   await mailgun.sendWelcomeEmail(req.body, token);

      return res.send('User registered successfully!');
    } catch (e) {
      console.log(e);
      return res.status(500).send('Registration error -> ' + e);
    }
  }

  login = async (req, res) => {
    const newBody = _.pick(req.body, [
        'email',
        'password'
    ]);

    try {
        if (!newBody.email || !newBody.password) {
            return res.status(400).send({ message: message.VALIDATION.FILL_FIELDS });
        }

        const userExists = await this.user.findOne({
            where: {
                'email': newBody.email
            }
        });
        if (!userExists) {
            return res.status(409).send({ message: message.VALIDATION.DOES_NOT_EXIST });
        }

        if (userExists.salt === '') {

            if (userExists.userPass === md5(newBody.password)) {
                const bearerToken = createToken(userExists);
                await userFunctions.changePasswordSecurity(newBody.password, userExists);
                return res.send({ bearerToken });
            } else {
                return res.status(500).send({ message: message.VALIDATION.WRONG_CREDENTIALS });
            }

        } else {
            const checkingPasswordInfo = Utils.checkPassword(userExists.salt, newBody.password);

            if (userExists.userPass != checkingPasswordInfo.passwordHash) {
                return res.status(500).send({ message: message.VALIDATION.WRONG_CREDENTIALS })
            }
            const bearerToken = createToken(userExists);
            
            return res.send({
                bearerToken: bearerToken,
            });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
}

getUserById = async (req, res) => {
    const { userId } = req.params;
    try {
        if (userId != req.user.id) {
            return res.status(403).send({ message: message.OTHER.NOT_ALLOWED_USER });
        }
        const user = await this.user.findOne({
            where: {
                id: userId
            }
        });
        return res.send(user.removeSensitiveData());
    } catch (e) {
        return res.status(500).send(e);
    }
}

aboutMe = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await this.user.findOne({
            where: {
                id: userId
            }
        });
        return res.send(user.removeSensitiveData());
    } catch (e) {
        return res.status(500).send(e);
    }
}

changePassword = async (req, res) => {
    const { userId, token } = req.query;
    const newPassword = req.body.password;
    const repeatPassword = req.body.newPassword;
    try {
        if (newPassword != repeatPassword)
            return res.status(400).send({ message: message.VALIDATION.NO_MATCH });
        
        const user = await this.user.findOne({
            where: {
                id: userId,
                tokenCode: token
            }
        });

        if (newPassword != repeatPassword)
            return res.status(400).send({ message: message.VALIDATION.NO_MATCH });
        const newBody = {
            password: await Utils.hashPasswordWithSalt(newPassword, user.salt).passwordHash,
            salt: user.salt
        }
        await user.update({ ...newBody });
        return res.send({ message: message.OTHER.PASSWORD_CHANGED });
    } catch (e) {
        return res.status(500).send(e);
    }
}

updateUserById = async (req, res) => {
    const { userId } = req.params;
    const newBody = _.pick(req.body, [
        'firstName',
        'lastName',
        'email',
        'jobTitle'
    ]);

    try {
        const updateUser = await this.User.findOne({
            where: {
                id: userId
            },
        //     attributes: {
        //       exclude: ['password', 'salt', 'confirmationToken', 'resetToken', 'resetTokenExpiration', 'facebookId', 'stripeID', 'plan_type', 'payment_method', 'isVerified', 'isSubscribed']
        //   }
        });

        if (userId != req.user.id) {
            return res.status(403).send({ message: message.OTHER.DELETE_NOT_ALLOWED });
        }

        // Update user with data from request body
        const updatedUser = await updateUser.update({ ...newBody });

        return res.send(updatedUser.removeSensitiveData());
      } catch (e) {
          console.log(e);
          return res.status(500).send(e);
      }
  }

  deleteUserById = async (req, res) => {
    const { userId } = req.params;

    try {
        if (userId != req.user.id) {
            return res.status(403).send({ message: message.OTHER.DELETE_NOT_ALLOWED });
        }
        const deletedUser = await this.user.findOne({
            where: {
                id: userId
            }
        });

        await deletedUser.destroy();
       
        return res.send({ message: message.USER.DELETED });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
}

getAllUsers = async (req, res) => {
    try {

        const allUsers = await this.user.findAll({
            attributes: ['id', 'firstName', 'lastName', 'email', 'jobTitle']
        });

        return res.send(allUsers);
    } catch (e) {
        console.log(e)
        return res.status(500).send(e);
    }
}

}

const UserController = new UserControllerFactory();

export default UserController;