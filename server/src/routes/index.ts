import { Router } from 'express';
import authRoutes from './authRoutes.js';
import trainsRoutes from './trainsRoutes.js';
import bookingsRoutes from './bookingsRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/trains', trainsRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/admin', adminRoutes);

// Convenience alias for direct /api/pnr/:pnr requested in prompt
router.get('/pnr/:pnr', (req, res, next) => {
  req.url = `/pnr/${req.params.pnr}`;
  bookingsRoutes(req, res, next);
});

// Profile alias for /api/users/profile requested in prompt
router.use('/users', authRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'RailEase Railway Engine',
    timestamp: new Date().toISOString(),
  });
});

export default router;
