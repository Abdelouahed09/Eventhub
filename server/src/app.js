import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import eventsRoutes from './routes/eventsRoutes.js'
import participantsRoutes from './routes/participantsRoutes.js'
import registrationsRoutes from './routes/registrationsRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/participants', participantsRoutes)
app.use('/api/registrations', registrationsRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` })
})

app.use((err, _req, res, _next) => {
  console.error(err)
  const status = err.status || 500
  res.status(status).json({
    message: err.message || 'Internal server error',
  })
})

export default app
