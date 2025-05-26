const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log('Authorization header:', authHeader); // Debug log
  if (!authHeader) return res.status(401).json({ msg: 'No token, access denied' });

  const token = authHeader.split(' ')[1]; // Remove "Bearer"
  console.log('Extracted token:', token); // Debug log
  if (!token) return res.status(401).json({ msg: 'Invalid token format' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    console.log('JWT verification error:', err.message); // Debug log
    res.status(400).json({ msg: 'Invalid token' });
  }
};

module.exports = auth;
