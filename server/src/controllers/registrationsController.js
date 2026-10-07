import { query } from '../config/db.js'

function formatRegistration(row) {
  return {
    id: row.id,
    eventId: row.event_id,
    participantId: row.participant_id,
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }
}

export async function listRegistrations(req, res, next) {
  try {
    const { eventId, status } = req.query
    const conditions = []
    const params = []

    if (eventId && eventId !== '') {
      params.push(eventId)
      conditions.push(`event_id = $${params.length}`)
    }

    if (status && status !== '') {
      params.push(status)
      conditions.push(`status = $${params.length}`)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const sql = `
      SELECT id, event_id, participant_id, status, created_at
      FROM registrations
      ${whereClause}
      ORDER BY created_at DESC
    `

    const { rows } = await query(sql, params)
    return res.json(rows.map(formatRegistration))
  } catch (err) {
    next(err)
  }
}

export async function createRegistration(req, res, next) {
  try {
    const { eventId, participantId } = req.body

    if (!eventId || !participantId) {
      return res.status(400).json({ message: 'eventId et participantId sont obligatoires' })
    }

    // 1. Verify event exists and is published
    const eventRes = await query('SELECT id, status, max_participants FROM events WHERE id = $1', [eventId])
    if (eventRes.rows.length === 0) {
      return res.status(404).json({ message: 'Événement introuvable' })
    }
    const event = eventRes.rows[0]
    if (event.status !== 'published') {
      return res.status(400).json({ message: 'Les inscriptions ne sont ouvertes que pour les événements publiés' })
    }

    // 2. Verify participant exists
    const participantRes = await query('SELECT id FROM participants WHERE id = $1', [participantId])
    if (participantRes.rows.length === 0) {
      return res.status(404).json({ message: 'Participant introuvable' })
    }

    // 3. Check existing registration
    const existingRes = await query(
      'SELECT id, status FROM registrations WHERE event_id = $1 AND participant_id = $2',
      [eventId, participantId]
    )

    if (existingRes.rows.length > 0) {
      const existing = existingRes.rows[0]
      if (existing.status !== 'cancelled') {
        return res.status(400).json({ message: 'Ce participant est déjà inscrit à cet événement' })
      }

      // 4. Check capacity before reactivating cancelled registration
      const countRes = await query(
        "SELECT COUNT(*) FROM registrations WHERE event_id = $1 AND status != 'cancelled'",
        [eventId]
      )
      const currentCount = parseInt(countRes.rows[0].count, 10)
      if (currentCount >= event.max_participants) {
        return res.status(400).json({ message: "L'événement a atteint sa capacité maximale" })
      }

      const { rows } = await query(
        `UPDATE registrations
         SET status = 'confirmed', updated_at = NOW()
         WHERE id = $1
         RETURNING id, event_id, participant_id, status, created_at`,
        [existing.id]
      )
      return res.status(201).json(formatRegistration(rows[0]))
    }

    // 4. Check capacity
    const countRes = await query(
      "SELECT COUNT(*) FROM registrations WHERE event_id = $1 AND status != 'cancelled'",
      [eventId]
    )
    const currentCount = parseInt(countRes.rows[0].count, 10)
    if (currentCount >= event.max_participants) {
      return res.status(400).json({ message: "L'événement a atteint sa capacité maximale" })
    }

    // 5. Insert registration
    const { rows } = await query(
      `INSERT INTO registrations (event_id, participant_id, status)
       VALUES ($1, $2, 'confirmed')
       RETURNING id, event_id, participant_id, status, created_at`,
      [eventId, participantId]
    )

    return res.status(201).json(formatRegistration(rows[0]))
  } catch (err) {
    next(err)
  }
}

export async function updateRegistrationStatus(req, res, next) {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide (pending, confirmed, cancelled)' })
    }

    const existingRes = await query('SELECT * FROM registrations WHERE id = $1', [id])
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ message: 'Inscription introuvable' })
    }
    const registration = existingRes.rows[0]

    // If changing to confirmed, check capacity
    if (status === 'confirmed' && registration.status !== 'confirmed') {
      const eventRes = await query('SELECT max_participants FROM events WHERE id = $1', [registration.event_id])
      if (eventRes.rows.length > 0) {
        const maxParticipants = eventRes.rows[0].max_participants
        const countRes = await query(
          "SELECT COUNT(*) FROM registrations WHERE event_id = $1 AND status != 'cancelled' AND id != $2",
          [registration.event_id, id]
        )
        const currentCount = parseInt(countRes.rows[0].count, 10)
        if (currentCount >= maxParticipants) {
          return res.status(400).json({ message: "L'événement a atteint sa capacité maximale" })
        }
      }
    }

    const { rows } = await query(
      `UPDATE registrations
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, event_id, participant_id, status, created_at`,
      [status, id]
    )

    return res.json(formatRegistration(rows[0]))
  } catch (err) {
    next(err)
  }
}
