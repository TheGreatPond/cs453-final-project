import jwt from 'jsonwebtoken';
import { config } from '../config.js';

const jwtSecret = config.jwtSecret;

// The imports above are supplied so students can use jwt and config.jwtSecret. 
// My version is largely stolen from your example from the authorization module a few weeks ago
export function authenticateToken(req, res, next) {
  const authorization = req.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Send a Bearer token in the Authorization header."
    });
  }

  const token = authorization.slice("Bearer ".length);

  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({
      error: "Unauthorized",
      message: "The access token is missing, invalid, or expired."
    });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (allowedRoles.includes(req.user.role)){
      next()
    } else {
    res.status(403).json({
      error: "Forbidden",
      message: "This user does not have the required role to access this resource."
    });
    }
  };
}

void jwt;
void config;
