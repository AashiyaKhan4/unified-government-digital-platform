const jwt = require('jsonwebtoken');
const { UserModel } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'ugdp-jwt-secret-key-medicaps-indore';

function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id || user.userId,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access Denied: Missing or invalid authorization token.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify user exists
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User associated with token no longer exists.' });
    }

    req.user = {
      userId: user._id || user.userId,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.', error: err.message });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of the following roles: [${roles.join(', ')}]. Current role: ${req.user.role}`
      });
    }
    next();
  };
}

module.exports = {
  JWT_SECRET,
  generateToken,
  authenticate,
  requireRole
};
