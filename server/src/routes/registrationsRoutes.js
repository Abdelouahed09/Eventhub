import { Router } from 'express'
import {
  listRegistrations,
  createRegistration,
  updateRegistrationStatus,
} from '../controllers/registrationsController.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', listRegistrations)
router.post('/', optionalAuth, createRegistration)
router.patch('/:id/status', optionalAuth, updateRegistrationStatus)

export default router
