import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import logger from '../../utils/logger.js';

const isAdmin = async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(403).json({ message: 'Access Denied' });
  }
  try {
    if (user.role.Admin >= 4001) {
      next();
    } else {
      return res.status(403).json({
        message: 'Access Denied you need Admin access to access this resource',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const isModerator = async (req, res, next) => {
  logger.info('isModerator check initiated');
  const user = req.user;
  if (!user) {
    return res.status(403).json({ message: 'Access Denied' });
  }
  try {
    if (user.role.Moderator >= 3001 || user.role.Admin >= 4001) {
      logger.info('isModerator check passed');
      next();
    } else {
      return res.status(403).json({
        message:
          'Access Denied you need Moderator access to access this resource',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export { isAdmin, isModerator };
