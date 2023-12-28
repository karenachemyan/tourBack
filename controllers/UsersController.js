import sendRegistrationEmail from "../helper/sendRegistrationEmail.js";
import HttpError from "http-errors";
import JWT from "jsonwebtoken";
import { Favorites, UserSettings, Users } from "../models";
import { OAuth2Client } from "google-auth-library";
import path from "path";
import sharp from "sharp";
import fss from "fs"
import sequelize from "../services/sequelize";
import fs from "fs/promises";

const { JWT_SECRET, FRONT_URL } = process.env;
const { BASE_URL } = process.env;

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

            const html = `<h3>Dear ${newUser.firstName} ${newUser.lastName},</h3><p>You have been successfully registered. To activate your account please click on the link below:</p><p><a href="${FRONT_URL}/activate?code=${newUser.veryfication}"> Click Here </a></p>`;

            await sendRegistrationEmail(newUser.email, html);

            res.json({
                status: "ok",
                message: "Successfully registered"
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
            } catch (jwtError) {
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

        } catch (e) {
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
                    role: 'user'
                },
            });

            if (!user) {
                throw HttpError(404, {
                    errors: {
                        exsist: 'Invalid email or password'
                    }
                });
            } else if (user.status !== 'active') {
                throw HttpError(404, {
                    errors: {
                        actvateError: "You didn't activate your account"
                    }
                });
            }

            const token = JWT.sign({ userId: user.id }, JWT_SECRET);

            res.json({
                status: 'ok',
                user,
                token,
            });
        } catch (e) {
            next(e);
        }
    }

    static async oauth(req, res, next) {
        try {
            const { googleToken } = req.body;
            let token, user

            if (googleToken) {

                const client = new OAuth2Client('40153693711-ajrviope1cfv0g0e9knenah2tpok0m2j.apps.googleusercontent.com');
                const ticket = await client.verifyIdToken({
                    idToken: googleToken,
                    audience: '40153693711-ajrviope1cfv0g0e9knenah2tpok0m2j.apps.googleusercontent.com',
                });
                const payload = ticket.getPayload();
                const email = payload.email;

                user = await Users.findOne({ where: { email } });

                if (!user) {

                    user = await Users.create({
                        firstName: payload.given_name,
                        lastName: payload.family_name,
                        email: payload.email,
                        photo: payload.picture,
                        status: 'active',
                        isOauth: true
                    })
                    token = JWT.sign({ userId: user.id }, JWT_SECRET);
                } else {
                    token = JWT.sign({ userId: user.id }, JWT_SECRET);
                }
                res.json({
                    status: 'ok',
                    user,
                    token,
                });
            }
        } catch (e) {
            next(e)
        }
    }

    static async profile(req, res, next) {
        try {

            const userId = req.userId;
            const userProfile = await Users.findByPk(userId, {
                attributes: ['firstName', 'lastName', 'email', [sequelize.literal(`CONCAT('users/user_',Users.id,'/', photo)`), 'photo'], 'isOauth'],

                include: [
                    {
                        model: Favorites,
                        attributes: ['tourId'],
                        as: 'favorites'
                    }
                ]
            });

            const favorites = userProfile.favorites.map(f => (
                f.tourId
            ))

            const profile = {
                ...userProfile.toJSON(),
                favorites: favorites
            }

            res.json({
                status: 'ok',
                profile
            })
        } catch (e) {
            next(e)
        }
    }

    static async profileUpdate(req, res, next) {
        try {

            const { firstName, lastName, email } = req.body;
            const { file } = req;
            const userId = req.userId;

            const user = await Users.findByPk(userId);

            if (!user) {
                throw HttpError(422, {
                    errors: {
                        error: 'No User Found'
                    }
                })
            }

            if (user.email !== email) {
                const veryfication = JWT.sign({ email: email }, JWT_SECRET);
                const html = `<h3>Dear ${firstName} ${lastName},</h3><p>Youe email was changed. To activate your account please click on the link below:</p><p><a href="${FRONT_URL}/activate?code=${veryfication}"> Click Here </a></p>`;

                await sendRegistrationEmail(email, html);
                await user.update({ status: 'pending', veryfication: veryfication });
            }

            if (file) {
                const destFolder = `public/users/user_${userId}`;

                if (user.photo) {
                    await fs.unlink(path.join(destFolder, user.photo));
                }

                if (!fss.existsSync(destFolder)) {
                    fss.mkdirSync(destFolder)
                }
                await sharp(file.path)
                    .rotate()
                    .resize({ width: 100 })
                    .toFile(path.join(destFolder, file.filename));

                await user.update({ firstName, lastName, email, photo: file.filename });

            }

            else {
                await user.update({ firstName, lastName, email });
            }



            res.json({
                status: 'ok',
                message: "Profile Successfully updated"
            })

        }
        catch (e) {
            next(e)
        }
    }

    static async sendPasswordRecoveryCode(req, res, next) {
        try {

            const { email } = req.body;

            const user = await Users.findOne({
                where: { email },
                attributes: { exclude: ['veryfication', 'createdAt', 'updatedAt'] }
            });

            if (!user) {
                throw HttpError(404, {
                    errors: {
                        email: 'User With That Email Not Found'
                    }
                })
            } else if (user.status === 'pending') {
                throw HttpError(403, {
                    errors: {
                        notActive: 'Not Active User'
                    }
                })
            }

            const recoveryCode = Math.floor(100000 + Math.random() * 900000)

            await UserSettings.create({ recoveryCode, userId: user.id });

            const html = `<h3>Dear ${user.firstName} ${user.lastName},</h3><p>We got a password recovery request. Your Verification Code is <strong>${recoveryCode}</strong>.If you didnt do that you can ignore this message</p>`;

            await sendRegistrationEmail(user.email, html);

            res.json({
                status: "ok",
                message: "Verification Code was sent to your email"
            })
        } catch (e) {
            next(e)
        }
    }

    static async validatePasswordRecoveryCode(req, res, next) {
        try {

            const { email, recoveryCode } = req.body;

            const user = await Users.findOne({
                where: { email },
                attributes: {
                    exclude: ['veryfication', 'createdAt', 'updatedAt'],
                },
            });

            if (!user) {
                throw HttpError(403, {
                    errors: {
                        exists: 'No User Found'
                    }
                })
            }
            const recoveryUser = await UserSettings.findOne({
                where: {
                    userId: user.id,
                    recoveryCode: recoveryCode
                }
            })

            if (!recoveryUser) {
                throw HttpError(403, {
                    errors: {
                        recoveryCodeError: 'Invalid Recovery Code'
                    }
                })
            }

            res.json({
                status: "ok",
                message: "Recovery code verified successfully",
            })
        } catch (e) {
            next(e)
        }
    }

    static async passwordUpdate(req, res, next) {
        try {

            const { email, newPassword } = req.body;

            const user = await Users.findOne({
                where: { email },
                attributes: { exclude: ['veryfication', 'createdAt', 'updatedAt'] }
            });

            if (!user) {
                throw HttpError(404, {
                    errors: {
                        exists: 'User Not Found'
                    }
                })
            }
            await user.update({ password: newPassword });

            res.json({
                status: "ok",
                message: "Password updated successfully",
            })
        } catch (e) {
            next(e)
        }
    }

    static async changeOldPassword(req, res, next) {

        try {

            const {password, newPassword} = req.body;

            const userId = req.userId;

            const user = await Users.findOne({
               where:{
                    id:userId,
                    password:Users.passwordHash(password)
                }
            })

            if(!user){
                throw HttpError(401, {
                    errors: {
                        oldPassword: 'Old Password are Wrong'
                    }
                })
            }

            await user.update({ password: newPassword }, { where: { id: userId } })

            res.json({
                status:'ok',
                message:'Password Updated  Successfully'                
            })

        }
        catch (e) {
            next(e)
        }

    }
}
export default UsersController