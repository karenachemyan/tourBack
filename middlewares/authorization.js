import jwt from "jsonwebtoken";
import HttpError from "http-errors";

const { JWT_SECRET } = process.env;

const EXCLUDES = [
  'POST:/users/register',
  'POST:/users/login',
  'POST:/users/activate',
  'GET:/categories/list',
  'POST:/users/send-password-recovery-code',
  'POST:/users/validate-password-recovery-code',
  'POST:/users/oauth',
  'POST:/users/password-update',
  'GET:/destinations/list',
  'GET:/toures/list'
];

export default function authorization(req, res, next) {

  try {
    const requestPath = `${req.method}:${req.path}`;

    if (EXCLUDES.includes(requestPath) || req.method === 'OPTIONS') {

      next();
      return;
    }
    if (requestPath.includes('GET:/toures/get-tour/') || requestPath.includes('GET:/toures/tours-by-destination/') || requestPath.includes('GET:/toures/toures-by-category/') || requestPath.includes('GET:/destinations/get-by-id/')) {
      next();
      return;
    }

    const { authorization } = req.headers;

    const { userId } = jwt.verify(authorization.replace('Bearer ', ''), JWT_SECRET)
    if (!userId) {
      throw HttpError(401)
    }
    req.userId = userId;
    next();
  } catch (e) {
    e.status = 401;
    next(e);
  }
}
