import sendRegistrationEmail from "../helper/sendMail";
import { Rates, Users } from "../models";
import HttpError from "http-errors";
import JWT from "jsonwebtoken";

const { JWT_SECRET } = process.env;


class UsersController {

    static async register(req, res, next) {
        try {

            const { firstName, lastName, email, password } = req.body;

            const userExists = await Users.findOne({
                where: { email },
                include: [{
                    model: Rates,
                    required: true,
                    attributes: []
                  }]
            });

            if (userExists) {
                throw HttpError(422, {
                    errors: {
                        email: 'Already registered'
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
                    password: Users.passwordHash(password),
                    status: 'active'
                },
                attributes: {
                    exclude: ['veryfication', 'createdAt','updatedAt']
                }
            });

            if(!user){
                throw HttpError(404, 'Invalid email or password');
            }

            const token = JWT.sign({ userId: user.id }, JWT_SECRET);

            res.json({
                status: 'ok',
                user,
                token
            })


        }
        catch (e) {
            next(e);
        }
    }

    static async profile(req,res,next){
        try{

            const userId = req.userId; 
            const userProfile = await Users.findByPk(userId, {
                attributes: { exclude: ['veryfication', 'createdAt','updatedAt'] }
            });

            res.json({
                status:'ok',
                userProfile
            })
        }
        catch(e){
            next(e)
        }
    }

}

export default UsersController