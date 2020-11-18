import { authJwt } from './passport.service';

class AuthServiceFactory {
   
    authUser = async (req, res, next) => authJwt(req, res, next);

}

const AuthService = new AuthServiceFactory();

export default AuthService;