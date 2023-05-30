import { Handler } from 'express';
import { Pastes, Users } from '../db';
import bcrypt from 'bcrypt';
import { CustomError } from '../utils/custom-error';
import { authenticator } from 'otplib';
import qrcode from '../utils/qrcode';

export const accountInfo: Handler = async (req, res) => {
    res.render('account', {
        user: await Users().where('id', req.session.userId).first(),
        pastes: await Pastes()
            .where('user_id', req.session.userId)
            .orderBy('created_at', 'desc')
            .limit(100),
    });
};

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

    if (req.user['2fa_enabled']) {
        req.session.pendingUserId = req.user.id;
        req.session.save(error => {
            if (error) {
                throw error;
            }

            res.render('login', {
                '2fa': true,
            });
        });
    } else {
        req.session.userId = req.user.id;
        req.session.save(error => {
            if (error) {
                throw error;
            }

            res.redirect('/');
        });
    }
};

export const login2FA: Handler = async (req, res) => {
    if (!req.session.pendingUserId) {
        res.status(401).end();
        return;
    }

    const user = await Users().where('id', req.session.pendingUserId).first();

    if (!user) {
        throw new CustomError('User not found.');
    }

    if (!user['2fa_secret']) {
        res.status(400).end();
        return;
    }

    if (authenticator.check(req.body.token, user['2fa_secret'])) {
        req.session.pendingUserId = undefined;
        req.session.userId = user.id;
        req.session.save(error => {
            if (error) {
                throw error;
            }

            res.redirect('/');
        });
    } else {
        res.render('login', {
            error: 'Invalid 2FA code',
            '2fa': true,
        });
    }
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

export const init2FA: Handler = async (req, res) => {
    const user = await Users().where('id', req.session.userId).first();

    if (!user) {
        throw new CustomError('User not found.');
    }

    const secret = authenticator.generateSecret();

    await Users().where('id', user.id).update({
        '2fa_secret': secret,
    });

    res.json({
        ok: true,
        result: {
            secret,
            qr_code: {
                svg: qrcode(
                    authenticator.keyuri(user.email, 'wastebin', secret),
                ),
            },
        },
    });
};

export const confirm2FA: Handler = async (req, res) => {
    const user = await Users().where('id', req.session.userId).first();

    if (!user) {
        throw new CustomError('User not found.');
    }

    if (!user['2fa_secret']) {
        res.status(400).end();
        return;
    }

    if (authenticator.check(req.body.token, user['2fa_secret'])) {
        await Users().where('id', user.id).update({
            '2fa_enabled': true,
        });

        res.redirect('/account');
    } else {
        await Users().where('id', user.id).update({
            '2fa_secret': null,
        });

        res.redirect('/account');
    }
};
