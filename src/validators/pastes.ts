import { param } from 'express-validator';
import { Pastes } from '../db';

export const newPastesValidator = [];

export const editPasteValidator = [
    param('hash', 'Hash is required')
        .custom(async (hash, { req }) => {
            const [realHash, ext] = hash.split('.', 2);
            const paste = await Pastes().where('hash', realHash).first();

            if (!paste || paste.user_id !== req.user?.userId) {
                return Promise.reject();
            }
        })
        .withMessage('This isn\'t for you'),
];
