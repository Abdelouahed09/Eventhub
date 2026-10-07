import { query } from '../config/db.js'

function formatParticipant(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone || null,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }
}

export async function listParticipants(req, res, next) {
  try {
    const { search } = req.query
    let sql = 'SELECT id, full_name, email, phone, created_at FROM participants'
    const params = []

    if (search && search.trim() !== '') {
      params.push(`%${search.trim()}%`)
      sql += ' WHERE full_name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1'
    }

    sql += ' ORDER BY created_at DESC'

    const { rows } = await query(sql, params)
    return res.json(rows.map(formatParticipant))
  } catch (err) {
    next(err)
  }
}

export async function createParticipant(req, res, next) {
  try {
    const { fullName, email, phone } = req.body

    if (!fullName || !email) {
      return res.status(400).json({ message: 'Nom complet et email obligatoires' })
    }

    const existing = await query('SELECT id FROM participants WHERE LOWER(email) = LOWER($1)', [email.trim()])
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Un participant avec cet email existe déjà' })
    }

    const { rows } = await query(
      `INSERT INTO participants (full_name, email, phone)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, email, phone, created_at`,
      [fullName.trim(), email.trim().toLowerCase(), phone ? phone.trim() : null]
    )

    return res.status(201).json(formatParticipant(rows[0]))
  } catch (err) {
    next(err)
  }
}

export async function updateParticipant(req, res, next) {
  try {
    const { id } = req.params
    const { fullName, email, phone } = req.body

    const existing = await query('SELECT * FROM participants WHERE id = $1', [id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Participant introuvable' })
    }

    const current = existing.rows[0]
    const updatedName = fullName !== undefined ? fullName.trim() : current.full_name
    const updatedEmail = email !== undefined ? email.trim().toLowerCase() : current.email
    const updatedPhone = phone !== undefined ? (phone ? phone.trim() : null) : current.phone

    // If email is changing, ensure uniqueness
    if (updatedEmail !== current.email) {
      const emailCheck = await query(
        'SELECT id FROM participants WHERE LOWER(email) = LOWER($1) AND id != $2',
        [updatedEmail, id]
      )
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ message: 'Cet email est déjà attribué à un autre participant' })
      }
    }

    const { rows } = await query(
      `UPDATE participants
       SET full_name = $1, email = $2, phone = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, full_name, email, phone, created_at`,
      [updatedName, updatedEmail, updatedPhone, id]
    )

    return res.json(formatParticipant(rows[0]))
  } catch (err) {
    next(err)
  }
}
