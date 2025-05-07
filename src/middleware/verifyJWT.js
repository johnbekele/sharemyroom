import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import logger from '../../utils/logger.js';

dotenv.config();

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Missing or invalid token', authHeader });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Check if decoded contains the expected user data
    if (!decoded || !decoded.id) {
      logger.error('Invalid token payload:', decoded);
      return res.status(403).json({ error: 'Invalid token structure' });
    }

    // Set the user object directly from decoded data
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
      firstname: decoded.firstname,
      lastname: decoded.lastname,
      phone: decoded.phone,
      address: decoded.address,
      photo: decoded.photo,
    };

    logger.log('Verified user:', req.user, token); // Debug log
    next();
  } catch (err) {
    logger.error('JWT Verification failed:', err.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export default verifyJWT;
