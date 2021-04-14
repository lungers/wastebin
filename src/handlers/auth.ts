import { Handler } from 'express';
import { Users } from '../db';
import bcrypt from 'bcrypt';
import { CustomError } from '../utils/custom-error';

export const login: Handler = async (req, res) => {
    if (!req.user) {
        console.error('`req.user` is `undefined`');
        throw new CustomError('Internal server error.');
    }

    const passwordsMatch = await bcrypt.compare(
        req.body.password,
        req.user.password,
    );

    if (!passwordsMatch) {
        return res.render('login', {
            error: 'Email or password is incorrect',
        });
    }

    req.session.userId = req.user.id;
    req.session.save(error => {
        if (error) {
            throw error;
        }

        res.redirect('/');
    });
};

export const register: Handler = async (req, res) => {
    const salt = await bcrypt.genSalt(12);
    const password = await bcrypt.hash(req.body.password, salt);

    const [newUserId] = await Users().insert({
        email: req.body.email,
        password,
        created_at: new Date(),
        updated_at: new Date(),
    });

    req.session.userId = newUserId;
    req.session.save(error => {
        if (error) {
            throw error;
        }

        res.redirect('/');
    });
};
