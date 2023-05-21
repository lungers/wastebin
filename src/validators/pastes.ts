import { body, param } from 'express-validator';
import { Pastes } from '../db';

export const newPastesValidator = [
    body('content', 'Content is required').isLength({ min: 1 }),
];

export const editPasteValidator = [
    param('hash', 'Hash is required')
        .custom(async (hash, { req }) => {
            const [realHash, ext] = hash.split('.', 2);
            const paste = await Pastes().where('hash', realHash).first();

            if (
                !paste ||
                !req.session ||
                paste.user_id !== req.session.userId
            ) {
                return Promise.reject();
            }
        })
        .withMessage("This isn't for you"),
];

export const deletePasteValidator = [
    param('hash', 'Hash is required')
        .custom(async (hash, { req }) => {
            const [realHash, ext] = hash.split('.', 2);
            const paste = await Pastes().where('hash', realHash).first();

            if (
                !paste ||
                !req.session ||
                paste.user_id !== req.session.userId
            ) {
                return Promise.reject();
            }
        })
        .withMessage("This isn't for you"),
];
