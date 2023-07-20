import cors from 'cors';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import * as pastes from '../handlers/pastes';
import ensureLoggedIn from '../utils/ensure-logged-in';
import { verify } from '../utils/verify';
import {
    deletePasteValidator,
    editPasteValidator,
    newPastesValidator,
} from '../validators/pastes';

const router = Router();

router.get('/', ensureLoggedIn(true, '/login'), asyncHandler(pastes.index));
router.get('/:hash', asyncHandler(pastes.get()));
router.get('/v/:hash', asyncHandler(pastes.get(false)));
router.get('/raw/:hash', cors(), asyncHandler(pastes.raw));
router.post(
    '/new',
    ensureLoggedIn(true, '/login'),
    newPastesValidator,
    asyncHandler(verify),
    asyncHandler(pastes.new_),
);

router.get(
    '/e/:hash',
    ensureLoggedIn(true, '/login'),
    editPasteValidator,
    asyncHandler(verify),
    asyncHandler(pastes.renderEdit),
);
router.post(
    '/edit/:hash',
    ensureLoggedIn(true, '/login'),
    editPasteValidator,
    asyncHandler(verify),
    asyncHandler(pastes.edit),
);

router.delete(
    '/delete/:hash',
    ensureLoggedIn(true, '/login'),
    deletePasteValidator,
    asyncHandler(verify),
    asyncHandler(pastes.delete_),
);

export default router;
