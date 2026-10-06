import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  addSavedPassenger,
  deleteSavedPassenger,
} from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/profile', authenticateUser, getProfile);
router.put('/profile', authenticateUser, updateProfile);
router.post('/passengers', authenticateUser, addSavedPassenger);
router.delete('/passengers/:id', authenticateUser, deleteSavedPassenger);

export default router;
