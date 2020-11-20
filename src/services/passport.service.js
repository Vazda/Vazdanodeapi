import { DB } from '../config/db';
import jwt from "jsonwebtoken";
import passport from "passport";
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";

const db = DB.getInstance();

const SECRET_OR_KEY = 'Nermin2020';

const jwtOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET_OR_KEY,
    algorithms: ["HS256"]
};

const jwtStrategy = new JWTStrategy(
    jwtOpts,
    async (payload, done) => {
        try {
            const user = await db.User.findOne({
                where: {
                    id: payload.id
                }
            });
            if (!user) {
                return done(null, false);
            }
            return done(null, user);
        } catch (e) {
            return done(e, false);
        }
    }
);

export const createToken = (user) => jwt.sign({
    id: user.id
}, SECRET_OR_KEY,
    { expiresIn: '18h' }
);
export const idFromToken = (token) => jwt.verify(token, SECRET_OR_KEY);

export const passportInit = () => {
    // serialize and deserialize
    passport.serializeUser(function (user, done) {
        if (!user) {
            return done(message.AUTH.serialize_failed)
        }
        return done(null, user);
    });
    passport.deserializeUser(async function (id, done) {
        const user = await this.user.findOne({
            where: {
                id: id
            }
        })
        if (!user) {
            return done(message.AUTH.deserialize_failed);
        }
        return done(null, user);
    });

    passport.use(jwtStrategy);
};

export const authJwt = passport.authenticate("jwt", { session: false });

