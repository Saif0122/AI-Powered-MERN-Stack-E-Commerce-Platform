import express from 'express';
import {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
} from '../controllers/addressController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/').get(getAddresses).post(createAddress);

router.route('/:id')
    .put(updateAddress)
    .delete(deleteAddress);

router.patch('/:id/default', setDefaultAddress);

export default router;
