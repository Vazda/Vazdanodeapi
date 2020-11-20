import { DB } from '../config/db';
import Sequelize from 'sequelize';
import Functions from '../inc/functions';
import { createToken } from '../services/passport.service';
import Utils from '../utils/utils';
import _ from 'lodash';
import md5 from 'md5';
import uniqid from 'uniqid';
import message from '../constants/messages';
import mailer from '../helpers/transporter.options';

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
      'jobTitle',
      'password'
    ]);

    try {
      const checkEmail = await Functions.checkEmailFormat(newBody.email);
      if (!checkEmail) {
        return res.send({ message: message.VALIDATION.EMAIL_INC });
      }
      const userExists = await this.user.findOne({
        where: {
          userEmail: newBody.email,
        },
      });
      if (userExists) {
        return res.status(409).send({ message: message.VALIDATION.DOES_NOT_EXIST });
      }

      const userPasswordInfo = Utils.saltHashPassword(newBody.password);
      let token = md5(uniqid(Math.random()));

      const user = await this.user.create({
        firstName: newBody.firstName,
        lastName: newBody.lastName,
        jobTitle: newBody.jobTitle,
        userEmail: newBody.email,
        userPassword: userPasswordInfo.passwordHash,
        salt: userPasswordInfo.salt,
        tokenCode: token,
        userStatus: 'N'
      });

      await mailer.sendMail({
        from: "Nermin",
        to: newBody.email,
        subject: "Confirm your email!",
        text: "Email confirmation",
        html: `
        <head>
              <title>Email confirmation</title>
          </head>
              Dear ${user.firstName} ${user.lastName}, to activate your account simply click on the following link<br/><br><br>
        <body style="background-color:#f3f4f9;font-family: Tahoma, Geneva, sans-serif; ">
              <br><br>
        <div style="margin-left: auto; margin-right:auto;text-align:center;">
            <a href="http://localhost:3000/api/v1/users/verify?id=${user.id}&codex=${user.tokenCode}" style="font-size:18px;text-align:center;padding:15px; text-decoration:none; background-color:#ff5722;color:#fff;border-radius:40px;">Click here to activate your account on Easynote!</a>
        </div>
        <br><br>
        </body>`,
      });

      return res.send({ message: message.ACCOUNT.CREATED });
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
                userEmail: newBody.email
            }
        });

        if (!userExists) {
            return res.status(409).send({ message: message.VALIDATION.DOES_NOT_EXIST });
        }

        if (userExists.salt === '') {
            if (userExists.userPassword === md5(newBody.password)) {
                const bearerToken = createToken(userExists);
                await userFunctions.changePasswordSecurity(newBody.password, userExists);
                return res.send({ bearerToken });
            } else {
                return res.status(500).send({ message: message.VALIDATION.WRONG_CREDENTIALS });
            }

        } else {
            const checkingPasswordInfo = Utils.checkPassword(userExists.salt, newBody.password);

            if (userExists.userPassword != checkingPasswordInfo.passwordHash) {
                return res.status(500).send({ message: message.VALIDATION.WRONG_CREDENTIALS })
            }
            const bearerToken = createToken(userExists);
            
            return res.send({
                bearerToken: bearerToken,
                userId: userExists.id
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

verifyAccount = async (req, res) => {
    const { id, codex } = req.query;
    try {
        const userId = id;
        const verifyUser = await this.user.findOne({
            where: {
                id: userId,
                tokenCode: codex
            }
        });
        if (!verifyUser) {
            return res.status(404).send({ message: message.ACCOUNT.NO_ACC })
        }
        if (verifyUser.userStatus === 'Y') {
            return res.status(409).send({ message: message.ACCOUNT.ALREADY_ACTIVE });
        }

        // Update verified user
        await verifyUser.update({
            userStatus: 'Y'
        });
        const keyId = verifyUser.id;
        const bearerToken = createToken(verifyUser);

        // We should redirect to frontend page for finishing registration and send token with redirect
        // return res.redirect(
        //     `http://localhost:3000/api/v1/users/login/?bearerToken=${bearerToken}&user_id=${keyId}`
        // );
        return res.send({ message: message.ACCOUNT.ACTIVATED });
    } catch (e) {
        console.log(e);
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
            userPassword: await Utils.hashPasswordWithSalt(newPassword, user.salt).passwordHash,
            salt: user.salt
        }
        await user.update({ ...newBody });
        return res.send({ message: message.OTHER.PASSWORD_CHANGED });
    } catch (e) {
        return res.status(500).send(e);
    }
}

forgotPassword = async (req, res) => {
    const userEmail = req.body.email;
    try {
        const findUser = await this.user.findOne({
            where: {
                userEmail: userEmail
            }
        });
        if (!findUser) {
            return res.status(400).send({ message: message.VALIDATION.DOES_NOT_EXIST })
        }
        await mailer.sendMail({
            from: "Nermin",
            to: userEmail,
            subject: "Forgot password!",
            text: "Forgot password",
            html: `
            <head>
                  <title>Forgot password</title>
              </head>
                  To change your password simply click on the following link<br/><br><br>
            <body style="background-color:#f3f4f9;font-family: Tahoma, Geneva, sans-serif; ">
                  <br><br>
            <div style="margin-left: auto; margin-right:auto;text-align:center;">
                <a href="http://localhost:3000/api/v1/users/change-password?userId=${findUser.id}&token=${findUser.tokenCode}" style="font-size:18px;text-align:center;padding:15px; text-decoration:none; background-color:#ff5722;color:#fff;border-radius:40px;">Click here to activate your account on Easynote!</a>
            </div>
            <br><br>
            </body>`,
          });
          // Link in this email wont lead anywhere for now, due to authorization(Bearer token) postman to change password
        return res.send({message: message.ACCOUNT.FORGOT_PASSWORD});
    }
    catch (e) {
        return res.status(500).send(e);
    }
}

updateUserById = async (req, res) => {
    const { userId } = req.params;
    const newBody = _.pick(req.body, [
        'firstName',
        'lastName',
        'userEmail',
        'jobTitle'
    ]);

    try {
        const updateUser = await this.user.findOne({
            where: {
                id: userId
            }
        });

        if (userId != req.user.id) {
            return res.status(403).send({ message: message.OTHER.DELETE_NOT_ALLOWED });
        }

        const updatedUser = await updateUser.update({
            ...newBody
         });

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
            attributes: ['id', 'firstName', 'lastName', 'userEmail', 'jobTitle']
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