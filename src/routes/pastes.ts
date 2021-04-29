import asyncHandler from 'express-async-handler';
import { Router } from 'express';
import cors from 'cors';

import * as pastes from '../handlers/pastes';
import ensureLoggedIn from '../utils/ensure-logged-in';
import { newPastesValidator, editPasteValidator } from '../validators/pastes';

const router = Router();

router.get('/', ensureLoggedIn(true, '/login'), asyncHandler(pastes.index));
router.get('/:hash', asyncHandler(pastes.get()));
router.get('/v/:hash', asyncHandler(pastes.get(false)));
router.get('/raw/:hash', cors(), asyncHandler(pastes.raw));
router.post(
    '/new',
    ensureLoggedIn(true, '/login'),
    newPastesValidator,
    asyncHandler(pastes.new_),
);

router.get(
    '/e/:hash',
    ensureLoggedIn(true, '/login'),
    editPasteValidator,
    asyncHandler(pastes.renderEdit),
);
router.post(
    '/edit/:hash',
    ensureLoggedIn(true, '/login'),
    editPasteValidator,
    asyncHandler(pastes.edit),
);

export default router;
