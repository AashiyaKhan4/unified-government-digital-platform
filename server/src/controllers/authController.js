const bcrypt = require('bcryptjs');
const { UserModel, ProfileModel, AuditLogModel } = require('../models');
const { generateToken } = require('../middleware/auth');

class AuthController {
  static async register(req, res) {
    try {
      const { name, email, password, role = 'citizen' } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      }

      const existing = await UserModel.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists. Please login.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await UserModel.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: ['citizen', 'official', 'admin'].includes(role) ? role : 'citizen'
      });

      // If citizen, create initial unified profile
      if (user.role === 'citizen') {
        await ProfileModel.create({
          userId: user._id,
          fullName: name,
          dateOfBirth: '2004-06-15',
          address: 'Flat 402, Green Park, Andheri East, Mumbai, Maharashtra - 400069',
          contact: {
            phone: '+91 98201 12345',
            email: email.toLowerCase()
          },
          education: {
            course: 'B.Tech in Computer Science & Engineering',
            institution: 'Government College of Engineering, Mumbai',
            year: 2026,
            score: 88.5
          },
          verifiedFields: []
        });
      }

      await AuditLogModel.create({
        actor: user._id,
        action: 'USER_REGISTER',
        resource: `/users/${user._id}`,
        outcome: 'Success',
        timestamp: new Date().toISOString(),
        details: { email: user.email, role: user.role }
      });

      const token = generateToken(user);
      res.status(201).json({
        success: true,
        message: 'Registration successful.',
        token,
        user: {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error during registration.', error: err.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }

      const user = await UserModel.findOne({ email: email.toLowerCase() });
      if (!user) {
        await AuditLogModel.create({
          actor: 'ANONYMOUS',
          action: 'LOGIN_FAILED',
          resource: '/auth/login',
          outcome: 'Failure',
          timestamp: new Date().toISOString(),
          details: { email: email.toLowerCase(), reason: 'User not found' }
        });
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        await AuditLogModel.create({
          actor: user._id,
          action: 'LOGIN_FAILED',
          resource: '/auth/login',
          outcome: 'Failure',
          timestamp: new Date().toISOString(),
          details: { email: user.email, reason: 'Password mismatch' }
        });
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const token = generateToken(user);

      await AuditLogModel.create({
        actor: user._id,
        action: 'USER_LOGIN',
        resource: '/auth/login',
        outcome: 'Success',
        timestamp: new Date().toISOString(),
        details: { role: user.role }
      });

      res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error during login.', error: err.message });
    }
  }

  static async demoLogin(req, res) {
    try {
      const { role } = req.body;
      const targetRole = ['citizen', 'official', 'admin'].includes(role) ? role : 'citizen';
      const user = await UserModel.findOne({ role: targetRole });
      if (!user) {
        return res.status(404).json({ success: false, message: `Demo user for role ${targetRole} not found.` });
      }

      const token = generateToken(user);
      res.json({
        success: true,
        message: `Logged in as demo ${targetRole}.`,
        token,
        user: {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async me(req, res) {
    try {
      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      res.json({
        success: true,
        user: {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = AuthController;
