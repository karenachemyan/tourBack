import jwt from "jsonwebtoken";
import HttpError from "http-errors";

const { JWT_SECRET } = process.env;

const EXCLUDES = [
  'POST:/users/register',
  'POST:/users/login',
  'POST:/users/activate',
  'POST:/categories/create',
  'GET:/categories/list',
  'POST:/toures/create',
];

export default function authorization(req, res, next) {

  try {
    const requestPath = `${req.method}:${req.path}`;

    if (EXCLUDES.includes(requestPath) || req.method === 'OPTIONS') {

      next();
      return;
    }
    if (requestPath.includes('PATCH:/categories/update/') || requestPath.includes('DELETE:/categories/delete/')) {
      next();
      return;
    }

    const { authorization } = req.headers;

    const { userId } = jwt.verify(authorization, JWT_SECRET)
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
