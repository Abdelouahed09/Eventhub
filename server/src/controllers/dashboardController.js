import { query } from '../config/db.js'

export async function getDashboard(req, res, next) {
  try {
    const totalEventsRes = await query('SELECT COUNT(*) FROM events')
    const totalEvents = parseInt(totalEventsRes.rows[0].count, 10)

    const publishedRes = await query("SELECT COUNT(*) FROM events WHERE status = 'published'")
    const publishedEvents = parseInt(publishedRes.rows[0].count, 10)

    const todayRes = await query(
      "SELECT COUNT(*) FROM registrations WHERE created_at >= CURRENT_DATE"
    )
    const registrationsToday = parseInt(todayRes.rows[0].count, 10)

    const topEventsRes = await query(`
      SELECT 
        e.id,
        e.title,
        e.max_participants,
        COUNT(r.id) FILTER (WHERE r.status != 'cancelled') AS filled
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.status = 'published'
      GROUP BY e.id, e.title, e.max_participants
      ORDER BY filled DESC, e.event_date ASC
      LIMIT 5
    `)

    const topEvents = topEventsRes.rows.map((row) => {
      const maxParticipants = Number(row.max_participants)
      const filled = Number(row.filled)
      const occupancy = maxParticipants > 0 ? Math.round((filled / maxParticipants) * 100) : 0
      return {
        id: row.id,
        title: row.title,
        filled,
        maxParticipants,
        occupancy,
      }
    })

    return res.json({
      totalEvents,
      publishedEvents,
      registrationsToday,
      topEvents,
    })
  } catch (err) {
    next(err)
  }
}
