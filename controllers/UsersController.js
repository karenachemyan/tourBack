import sendRegistrationEmail from "../helper/sendMail";
import HttpError from "http-errors";
import JWT from "jsonwebtoken";
import { Users } from "../models";
import { OAuth2Client } from "google-auth-library";

const { JWT_SECRET } = process.env;


class UsersController {

    static async register(req, res, next) {
        try {

            const { firstName, lastName, email, password } = req.body;

            const userExists = await Users.findOne({
                where: { email },
            });

            if (userExists) {
                throw HttpError(409, {
                    errors: {
                        exists: 'Already registered'
                    }
                })
            }

            const veryfication = JWT.sign({ email: email }, JWT_SECRET);

            const newUser = await Users.create({
                firstName, lastName, email, password, veryfication: veryfication
            });

            await sendRegistrationEmail(newUser);

            res.json({
                status: "ok",
                newUser
            })
        } catch (e) {
            next(e)
        }
    }

    static async activate(req, res, next) {
        try {
            const { code } = req.body;
            let email;

            try {
                const decodedEmail = JWT.verify(code, JWT_SECRET);
                email = decodedEmail.email;
            }
            catch (jwtError) {
                throw HttpError(422, {
                    errors: {
                        code: 'Invalid Verification Code'
                    }
                });
            }

            const userExists = await Users.findOne({
                where: { veryfication: code }
            });

            if (!userExists || userExists.email !== email) {
                throw HttpError(422, {
                    errors: {
                        code: 'Invalid Veryfication Code'
                    }
                })
            }

            await Users.update(
                { status: 'active' },
                {
                    where: { email },
                })

            res.json({
                status: 'ok',
                email,
            })

        }
        catch (e) {
            next(e)
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password } = req.body;

            const user = await Users.findOne({
                where: {
                    email,
                    password: Users.passwordHash(password)
                },
                attributes: {
                    exclude: ['veryfication', 'createdAt', 'updatedAt'],
                    role:'user'
                },
            });

            if (!user) {
                throw HttpError(404, 'Invalid email or password');
            }

            else if(user.status !== 'active'){
                throw HttpError(404, "You didn't activate your account");
            }

            const token = JWT.sign({ userId: user.id }, JWT_SECRET);

            res.json({
                status: 'ok',
                user,
                token,
            });
        }
        catch (e) {
            next(e);
        }
    }

    static async oauth(req, res, next) {
        try {
            const { googleToken } = req.body;
            let token, user
            console.log(googleToken)

            if (googleToken) {

                const client = new OAuth2Client('40153693711-ajrviope1cfv0g0e9knenah2tpok0m2j.apps.googleusercontent.com');
                const ticket = await client.verifyIdToken({
                    idToken: googleToken.replace('Bearer ',''),
                    audience: '40153693711-ajrviope1cfv0g0e9knenah2tpok0m2j.apps.googleusercontent.com',
                });
                const payload = ticket.getPayload();

                console.log(payload)

                const email = payload.email;

                 user = await Users.findOne({ where: { email } });
               
                if (!user) {

                     user = await Users.create({
                        firstName: payload.given_name,
                        lastName: payload.family_name,
                        email: payload.email,
                        photo: payload.picture,
                        status:'active',
                        isOauth:true
                    })
                     token = JWT.sign({ userId: user.id }, JWT_SECRET);
                }

                else {
                    token = JWT.sign({ userId: user.id }, JWT_SECRET);
                }



                res.json({
                    status: 'ok',
                    user,
                    token,
                });
            }
        }
        catch (e) {
            next(e)
        }
    }

    static async profile(req, res, next) {
        try {

            const userId = req.userId;
            const userProfile = await Users.findByPk(userId, {
                attributes: { exclude: ['veryfication', 'createdAt', 'updatedAt'] }
            });

            res.json({
                status: 'ok',
                userProfile
            })
        }
        catch (e) {
            next(e)
        }
    }

    static async adminLogin(req,res,next){
        try {
            const { email, password } = req.body;

            const user = await Users.findOne({
                where: {
                    email,
                    password: Users.passwordHash(password)
                },
                attributes: {
                    exclude: ['veryfication', 'createdAt', 'updatedAt'],
                    role:'admin'
                },
            });

            if (!user) {
                throw HttpError(404, 'Invalid email or password');
            }           

            const token = JWT.sign({ userId: user.id }, JWT_SECRET);

            res.json({
                status: 'ok',
                user,
                token,
            });
        }
        catch (e) {
            next(e);
        }
    
    }

}

export default UsersController