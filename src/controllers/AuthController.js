import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../model/userSchema.js';
import passport from 'passport';
import logger from '../../utils/logger.js';

dotenv.config();

const saltround = 10;

const frontendURL =
  process.env.NODE_ENV === 'production'
    ? process.env.PROD_FRONTEND_URL
    : 'http://localhost:5173';

//I don't know why the fuck i create this controll will get back to it// I think i created this t
// o check when trying to register to check for the usernamr and email if alredy used or not fucking awfull
// const checkUserExists = async (req, res) => {
//   const { username, email } = req.query;

//   if (username) query.usename = username;
//   if (email) query.email = email;
//   try {
//     const userexists = await User.findOne(query);
//     if (userexists) res.status(400).json({ message: 'User already exists' });
//   } catch (e) {
//     res.status(500).json({ message: 'Error checking for user' });
//   }
// };

const getMe = async (req, res) => {
  try {
    logger.log(req.user);
    res.status(200).json(req.user);
  } catch (err) {
    res.status(500).json({ message: 'error getting user ' });
  }
};

const users = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: 'Error getting users' });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, firstname, lastname, email, phone, address, password } =
      req.body;
    logger.log(req.body);

    // Check if the user already exists
    const userExists = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password - AWAIT IT HERE
    const hashedPassword = await bcrypt.hash(password, saltround);

    // Create a new user in the database
    const user = await User.create({
      username: username, // This was missing in your original code
      firstname: firstname,
      lastname: lastname || '',
      email: email,
      phone: phone,
      address: address,
      password: hashedPassword, // Use the awaited hashed password
    });

    logger.log('User created ', user.toJSON());
    res.status(201).json({ message: 'User created successfully', user });
  } catch (e) {
    logger.log('Error creating user ', e);
    res.status(500).json({ message: 'Error creating user' });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    logger.log(req.body);

    // Validate reqbody

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: 'Missing identifier or password' });
    }

    // Check if the user exists
    const userExists = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!userExists) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    // Compare the hashed password
    const passwordMatch = await bcrypt.compare(password, userExists.password);
    if (!passwordMatch) {
      console.log("password isn't matching");
      return res.status(400).json({ message: 'Password does not match' });
    }

    // Check for JWT secrets
    if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
      logger.error('❌ Missing JWT secrets in environment variables!');
      return res
        .status(500)
        .json({ message: 'Server misconfiguration: Missing JWT secrets' });
    }

    // check  if freezed account

    const isFreezed = userExists.freez === true;
    if (isFreezed) {
      return res.status(403).json({
        message: 'Account freezed',
      });
    }

    // Generate JWT token
    const payload = {
      id: userExists.id,
      username: userExists.username,
      email: userExists.email,
      role: userExists.role,
      firstname: userExists.firstname,
      lastname: userExists.lastname,
      phone: userExists.phone,
      address: userExists.address,
    };

    // Generate JWT tokens
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1d',
    });

    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '7d',
    });

    // Update user with refresh token
    userExists.refreshToken = refreshToken;
    await userExists.save();

    // Set refresh token as HTTP-only cookie
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    // Send final response with access token
    console.log('Access Token:', accessToken);
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: userExists.id,
        username: userExists.username,
        email: userExists.email,
        role: userExists.role,
      },
      token: accessToken,
    });
  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

const logout = async (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
  });
  res.json({ message: 'Logout successful' });
};

const escalateUser = async (req, res) => {
  const { torole } = req.body;
  const { id } = req.params;
  logger.log(id);

  if (!['admin', 'moderator'].includes(torole.toLowerCase())) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }
    if (torole.toLowerCase() === 'admin') {
      user.role.Admin = Number(4001);
    } else if (torole.toLowerCase() === 'moderator') {
      user.role.Moderator = Number(3001);
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }
    await user.save();
    res.status(200).json({ message: 'User role updated successfully', user });
  } catch (e) {
    res.status(500).json({ message: 'Error updating', e });
  }
};

//Google Login Strategy

const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user) => {
    if (err) {
      logger.error('Google auth error:', err);
      return res.redirect(`${frontendURL}/login?error=google_auth_failed`);
    }

    if (!user) {
      return res.redirect(`${frontendURL}/login?error=no_user`);
    }

    const isFreezed = user.freez === true;
    if (isFreezed) {
      return res.redirect(`${frontendURL}/login?error=account_freezed`);
    }

    try {
      //Payload for JWT tokens
      const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstname: user.firstname,
        lastname: user.lastname,
        photo: user.photo,
      };

      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m',
      });

      const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
      });

      // Update user with refresh token
      user.refreshToken = refreshToken;
      await user.save();

      // Set refresh token as HTTP-only cookie
      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });

      //Will Adjuste this after Frontend
      res.redirect(`${frontendURL}/auth-success?token=${accessToken}`);
    } catch (error) {
      logger.error('Error during Google auth callback:', error);
      res.redirect(`${frontendURL}/login?error=server_error`);
    }
  })(req, res, next);
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    const deleteUser = await User.findOneAndDelete({ _id: id });

    return res.status(200).json({
      message: 'User deleted successfully',
      user: deleteUser,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const freezUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    const freezuser = await User.findByIdAndUpdate(id, { freez: true });

    return res.status(200).json({
      message: 'User freezed successfully ',
      user: freezuser,
    });
  } catch (error) {
    console.error('Error freazing user', error);
    return res.status(500).json({ message: 'server errror ' });
  }
};

const unfreezUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    const freezuser = await User.findByIdAndUpdate(id, { freez: false });

    return res.status(200).json({
      message: 'User restore access successfully ',
      user: freezuser,
    });
  } catch (error) {
    console.error('Error restor user', error);
    return res.status(500).json({ message: 'server errror ' });
  }
};

// Export the new methods
export default {
  getMe,
  users,
  createUser,
  login,
  logout,
  escalateUser,
  deleteUser,
  freezUser,
  unfreezUser,
  googleAuth,
  googleCallback,
};
