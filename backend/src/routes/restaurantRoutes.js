import express from 'express';
import { getRestaurants, getRestaurantDetails } from '../controllers/restaurantController.js';
import { getRatings, submitRating } from '../controllers/ratingController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getRestaurants);
router.get('/:id', getRestaurantDetails);
router.get('/:id/ratings', getRatings);
router.post('/:id/ratings', authenticate, submitRating);

export default router;
