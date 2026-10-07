import { Router } from 'express'
import {
  listParticipants,
  createParticipant,
  updateParticipant,
} from '../controllers/participantsController.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', listParticipants)
router.post('/', optionalAuth, createParticipant)
router.put('/:id', optionalAuth, updateParticipant)

export default router
