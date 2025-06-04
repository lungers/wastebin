import { body } from 'express-validator';
import { Users } from '../db';

export const loginValidators = [
    body('email', 'Invalid email.')
        .exists({ checkFalsy: true, checkNull: true })
        .trim()
        .isEmail()
        .isLength({ min: 0, max: 255 })
        .withMessage('Email length must be max 255.')
        .custom(async (email, { req }) => {
            const user = await Users().where({ email }).first();

            if (!user) {
                return Promise.reject();
            }

            req.user = user;
        })
        .withMessage('Email or password is incorrect.'),
    body('password', 'Invalid password.')
        .exists({ checkFalsy: true, checkNull: true })
        .isLength({ min: 8, max: 128 })
        .withMessage('Password length must be between 8 and 128.'),
];

export const login2FAValidators = [
    body('token', 'Invalid 2FA code')
        .exists({ checkFalsy: true, checkNull: true })
        .isNumeric({ no_symbols: true }),
];

export const registerValidators = [
    body('email', 'Invalid email.')
        .exists({ checkFalsy: true, checkNull: true })
        .trim()
        .isEmail()
        .isLength({ min: 0, max: 255 })
        .withMessage('Email length must be max 255.')
        .custom(async email => {
            const user = await Users().where({ email }).first();

            if (user) {
                return Promise.reject();
            }
        })
        .withMessage('This email already exists.'),
    body('password', 'Invalid password.')
        .exists({ checkFalsy: true, checkNull: true })
        .isLength({ min: 8, max: 128 })
        .withMessage('Password length must be between 8 and 128.'),
];

export const confirm2FAValidators = [
    body('token', 'Invalid 2FA code')
        .exists({ checkFalsy: true, checkNull: true })
        .isNumeric({ no_symbols: true }),
];
