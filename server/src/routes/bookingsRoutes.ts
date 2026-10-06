import { Router } from 'express';
import {
  createBooking,
  getUserBookings,
  getBookingById,
  checkPNR,
  cancelBooking,
} from '../controllers/bookingsController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

// Public PNR check
router.get('/pnr/:pnr', checkPNR);

// Authenticated booking endpoints
router.post('/', authenticateUser, createBooking);
router.get('/', authenticateUser, getUserBookings);
router.get('/:id', authenticateUser, getBookingById);
router.post('/:id/cancel', authenticateUser, cancelBooking);

export default router;
