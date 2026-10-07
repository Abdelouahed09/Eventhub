import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { query } from '../config/db.js'

function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'change_this_secret_in_production'
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d'
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    },
    secret,
    { expiresIn }
  )
}

function formatUser(row) {
  return {
    id: row.id,
    fullName: row.full_name || row.email.split('@')[0],
    email: row.email,
    role: row.role,
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const { rows } = await query(
      'SELECT id, full_name, email, password_hash, role FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    )

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Identifiants invalides' })
    }

    const user = rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ message: 'Identifiants invalides' })
    }

    const token = generateToken(user)
    return res.json({
      token,
      user: formatUser(user),
    })
  } catch (err) {
    next(err)
  }
}

export async function register(req, res, next) {
  try {
    const { email, password, fullName, role = 'staff' } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    if (!['admin', 'staff'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either admin or staff' })
    }

    const existing = await query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    )

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const { rows } = await query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role`,
      [email.trim().toLowerCase(), passwordHash, (fullName || '').trim() || email.split('@')[0], role]
    )

    const newUser = rows[0]
    const token = generateToken(newUser)

    return res.status(201).json({
      token,
      user: formatUser(newUser),
    })
  } catch (err) {
    next(err)
  }
}

export async function getMe(req, res, next) {
  try {
    const { rows } = await query(
      'SELECT id, full_name, email, role FROM users WHERE id = $1',
      [req.user.id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur introuvable' })
    }

    return res.json(formatUser(rows[0]))
  } catch (err) {
    next(err)
  }
}
