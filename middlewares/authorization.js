import jwt from "jsonwebtoken";
import HttpError from "http-errors";

const { JWT_SECRET } = process.env;

const EXCLUDES = [
  'POST:/users/register',
  'POST:/users/login',
  'POST:/users/adminLogin',
  'POST:/users/activate',
  'POST:/users/oauth',  
  'GET:/categories/list',    
  'GET:/destinations/list',
];

export default function authorization(req, res, next) {

  try {
    const requestPath = `${req.method}:${req.path}`;

    if (EXCLUDES.includes(requestPath) || req.method === 'OPTIONS') {

      next();
      return;
    }
    if (requestPath.includes('GET:/toures/getTour/')|| requestPath.includes('GET:/destinations/getById/')|| requestPath.includes('GET:/toures/toursByDestination/') || requestPath.includes('GET:/toures/getTouresByCategory/')) {
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
