import { Router } from 'express';
import {
  getAdminDashboardStats,
  getAdminTrains,
  createAdminTrain,
  updateAdminTrain,
  deleteAdminTrain,
  getAdminUsers,
  getAdminBookings,
  toggleSeatStatus,
} from '../controllers/adminController.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes with auth and admin role check
router.use(authenticateUser, requireAdmin);

router.get('/stats', getAdminDashboardStats);
router.get('/trains', getAdminTrains);
router.post('/trains', createAdminTrain);
router.put('/trains/:id', updateAdminTrain);
router.delete('/trains/:id', deleteAdminTrain);
router.get('/users', getAdminUsers);
router.get('/bookings', getAdminBookings);
router.post('/seats/:seatId/toggle', toggleSeatStatus);

export default router;
