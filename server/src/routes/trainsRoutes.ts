import { Router } from 'express';
import {
  getStations,
  searchTrains,
  getTrainById,
  getTrainSchedule,
  getTrainSeats,
} from '../controllers/trainsController.js';

const router = Router();

router.get('/stations', getStations);
router.get('/search', searchTrains);
router.get('/:id', getTrainById);
router.get('/:id/schedule', getTrainSchedule);
router.get('/:id/seats', getTrainSeats);

export default router;
