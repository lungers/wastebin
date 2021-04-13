import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { CustomError } from './custom-error';

export const verify = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const message = errors.array()[0].msg;
        throw new CustomError(message, 400);
    }

    return next();
};
