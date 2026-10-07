import { Router } from 'express'
import {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  updateEventStatus,
} from '../controllers/eventsController.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', listEvents)
router.get('/:id', getEvent)
router.post('/', optionalAuth, createEvent)
router.put('/:id', optionalAuth, updateEvent)
router.patch('/:id/status', optionalAuth, updateEventStatus)

export default router
