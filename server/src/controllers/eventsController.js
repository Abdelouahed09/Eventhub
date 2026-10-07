import { query } from '../config/db.js'

function formatEvent(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    location: row.location,
    eventDate: row.event_date instanceof Date ? row.event_date.toISOString() : row.event_date,
    maxParticipants: Number(row.max_participants),
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }
}

export async function listEvents(req, res, next) {
  try {
    const { status, date } = req.query
    const conditions = []
    const params = []

    if (status && status !== '') {
      params.push(status)
      conditions.push(`status = $${params.length}`)
    }

    if (date && date !== '') {
      params.push(date)
      conditions.push(`event_date::date = $${params.length}::date`)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const sql = `
      SELECT 
        id, 
        title, 
        description, 
        location, 
        event_date, 
        max_participants, 
        status, 
        created_by, 
        created_at
      FROM events
      ${whereClause}
      ORDER BY event_date ASC
    `

    const { rows } = await query(sql, params)
    return res.json(rows.map(formatEvent))
  } catch (err) {
    next(err)
  }
}

export async function getEvent(req, res, next) {
  try {
    const { id } = req.params
    const { rows } = await query(
      `SELECT 
        id, 
        title, 
        description, 
        location, 
        event_date, 
        max_participants, 
        status, 
        created_by, 
        created_at
      FROM events 
      WHERE id = $1`,
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Événement introuvable' })
    }

    return res.json(formatEvent(rows[0]))
  } catch (err) {
    next(err)
  }
}

export async function createEvent(req, res, next) {
  try {
    const { title, description = '', location, eventDate, maxParticipants, createdBy } = req.body

    if (!title || !location || !eventDate || !maxParticipants) {
      return res.status(400).json({ message: 'Champs obligatoires manquants (title, location, eventDate, maxParticipants)' })
    }

    let creatorId = createdBy || req.user?.id

    // Fallback if no creator id is present
    if (!creatorId) {
      const userRes = await query('SELECT id FROM users LIMIT 1')
      creatorId = userRes.rows[0]?.id
    }

    const { rows } = await query(
      `INSERT INTO events (title, description, location, event_date, max_participants, status, created_by)
       VALUES ($1, $2, $3, $4, $5, 'draft', $6)
       RETURNING id, title, description, location, event_date, max_participants, status, created_by, created_at`,
      [title.trim(), description.trim(), location.trim(), new Date(eventDate), Number(maxParticipants), creatorId]
    )

    return res.status(201).json(formatEvent(rows[0]))
  } catch (err) {
    next(err)
  }
}

export async function updateEvent(req, res, next) {
  try {
    const { id } = req.params
    const { title, description, location, eventDate, maxParticipants, status } = req.body

    const existing = await query('SELECT * FROM events WHERE id = $1', [id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Événement introuvable' })
    }

    const current = existing.rows[0]
    const updatedTitle = title !== undefined ? title.trim() : current.title
    const updatedDesc = description !== undefined ? description.trim() : current.description
    const updatedLoc = location !== undefined ? location.trim() : current.location
    const updatedDate = eventDate !== undefined ? new Date(eventDate) : current.event_date
    const updatedMax = maxParticipants !== undefined ? Number(maxParticipants) : current.max_participants
    const updatedStatus = status !== undefined ? status : current.status

    const { rows } = await query(
      `UPDATE events
       SET title = $1, description = $2, location = $3, event_date = $4, max_participants = $5, status = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING id, title, description, location, event_date, max_participants, status, created_by, created_at`,
      [updatedTitle, updatedDesc, updatedLoc, updatedDate, updatedMax, updatedStatus, id]
    )

    return res.json(formatEvent(rows[0]))
  } catch (err) {
    next(err)
  }
}

export async function updateEventStatus(req, res, next) {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['draft', 'published', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide (draft, published, cancelled)' })
    }

    const { rows } = await query(
      `UPDATE events
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, title, description, location, event_date, max_participants, status, created_by, created_at`,
      [status, id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Événement introuvable' })
    }

    return res.json(formatEvent(rows[0]))
  } catch (err) {
    next(err)
  }
}
