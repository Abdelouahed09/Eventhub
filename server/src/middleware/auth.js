import jwt from 'jsonwebtoken'

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing or invalid' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const secret = process.env.JWT_SECRET || 'change_this_secret_in_production'
    const decoded = jwt.verify(token, secret)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    try {
      const secret = process.env.JWT_SECRET || 'change_this_secret_in_production'
      req.user = jwt.verify(token, secret)
    } catch {
      // Ignore token verification errors for optional auth
    }
  }
  next()
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Permission denied' })
    }
    next()
  }
}
