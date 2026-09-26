import express from 'express';
import { getRestaurants, getRestaurantDetails } from '../controllers/restaurantController.js';

const router = express.Router();

router.get('/', getRestaurants);
router.get('/:id', getRestaurantDetails);

export default router;
