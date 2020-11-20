import { DB } from '../config/db';
import { authJwt } from './passport.service';

class AuthServiceFactory {
  constructor() {
    this.db = DB.getInstance();
  }

  init = async () => {
    this.db = DB.getInstance();
  };

  authUser = async (req, res, next) => authJwt(req, res, next);
}

const AuthService = new AuthServiceFactory();

export default AuthService;
