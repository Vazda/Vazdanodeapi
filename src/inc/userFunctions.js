import { DB } from '../config/db';
import Utils from '../utils/utils';
import Sequelize from 'sequelize';


const changePasswordSecurity = async (inputPassword, user) => {
    try {
        const db = DB.getInstance();
        const users = db.User;

        const usersInfo = user.dataValues;
        const userPasswordInfo = await Utils.saltHashPassword(inputPassword);
        await users.update(
            {
                'password': userPasswordInfo.passwordHash,
                'salt': userPasswordInfo.salt,
            },
            {
                where: {
                    'id': usersInfo.id
                }
            }
        )
        return userPasswordInfo.passwordHash;
    } catch (e) {
        console.log(e);
        throw (new Error("Unable to change password for user"));
    }
}

export default {
    changePasswordSecurity
}