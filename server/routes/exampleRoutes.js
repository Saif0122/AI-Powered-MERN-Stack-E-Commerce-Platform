import { Router } from 'express';
import {
    getAll,
    getOne,
    createOne,
    updateOne,
    deleteOne,
} from '../controllers/exampleController.js';

const router = Router();

// GET  /api/v1/examples        → list all
// POST /api/v1/examples        → create one
router.route('/').get(getAll).post(createOne);

// GET    /api/v1/examples/:id  → get one
// PATCH  /api/v1/examples/:id  → update one
// DELETE /api/v1/examples/:id  → delete one
router.route('/:id').get(getOne).patch(updateOne).delete(deleteOne);

export default router;
