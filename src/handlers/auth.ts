import {
    generateAuthenticationOptions,
    generateRegistrationOptions,
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
} from '@simplewebauthn/server';
import bcrypt from 'bcrypt';
import { Handler } from 'express';
import { validationResult } from 'express-validator';
import { authenticator } from 'otplib';
import { Passkeys, Pastes, Users } from '../db';
import env from '../env';
import { CustomError } from '../utils/custom-error';
import qrcode from '../utils/qrcode';

export const accountInfo: Handler = async (req, res) => {
    const [user, passkeys, pastes] = await Promise.all([
        Users().where('id', req.session.userId).first(),
        Passkeys()
            .where('user_id', req.session.userId)
            .orderBy('created_at', 'desc'),
        Pastes()
            .where('user_id', req.session.userId)
            .orderBy('created_at', 'desc')
            .limit(100),
    ]);

    const errors: Record<string, string | null> = {
        'invalid-2fa-code': user!['2fa_enabled']
            ? null
            : 'Your 2FA code is invalid, please try again.',
        'delete-passkey': 'Failed to delete passkey',
    };

    res.render('account', {
        nonce: res.locals.cspNonce,
        error:
            typeof req.query.error === 'string'
                ? errors[req.query.error] || null
                : null,
        user,
        passkeys,
        pastes,
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
            nonce: res.locals.cspNonce,
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
                nonce: res.locals.cspNonce,
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const message = errors.array()[0].msg;
        res.render('login', {
            nonce: res.locals.cspNonce,
            error: message,
            '2fa': true,
        });
        return;
    }

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
            nonce: res.locals.cspNonce,
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.redirect('/account?error=invalid-2fa-code');
        return;
    }

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

        res.redirect('/account?error=invalid-2fa-code');
    }
};

export const initPasskey: Handler = async (req, res) => {
    const user = (await Users().where('id', req.session.userId).first())!;
    const userPasskeys = await Passkeys().where('user_id', user.id);

    const options = await generateRegistrationOptions({
        rpID: env.RP_ID,
        rpName: env.RP_NAME,
        userName: user.email,
        attestationType: 'none',
        excludeCredentials: userPasskeys.map(passkey => ({
            id: passkey.id,
            transports: JSON.parse(passkey.transports || '[]'),
        })),
    });

    await Users()
        .where('id', user.id)
        .update({ passkey_challenge: JSON.stringify(options) });

    res.json(options);
};

export const verifyPasskeyInit: Handler = async (req, res) => {
    const user = (await Users().where('id', req.session.userId).first())!;
    if (!user.passkey_challenge) {
        throw new CustomError('Missing passkey challenge');
    }

    const currentOptions: PublicKeyCredentialCreationOptionsJSON = JSON.parse(
        user.passkey_challenge,
    );

    let verification;
    try {
        verification = await verifyRegistrationResponse({
            response: req.body,
            expectedChallenge: currentOptions.challenge,
            expectedOrigin: env.RP_ORIGIN,
            expectedRPID: env.RP_ID,
        });
    } catch (error: any) {
        console.error(error);
        throw new CustomError('There was an error', 400);
    }

    if (verification.verified) {
        const registrationInfo = verification.registrationInfo!;

        await Passkeys().insert({
            name: req.body.name,
            user_id: user.id,
            webauthn_user_id: currentOptions.user.id,
            id: registrationInfo.credential.id,
            public_key: Buffer.from(registrationInfo.credential.publicKey),
            counter: registrationInfo.credential.counter,
            transports: JSON.stringify(registrationInfo.credential.transports),
            device_type: registrationInfo.credentialDeviceType,
            backed_up: registrationInfo.credentialBackedUp,
        });
    }

    res.json({ verified: verification.verified });
};

export const getPasskeyOptions: Handler = async (req, res) => {
    const options: PublicKeyCredentialRequestOptionsJSON =
        await generateAuthenticationOptions({
            rpID: env.RP_ID,
            userVerification: 'preferred',
        });

    req.session.passkeyChallenge = options.challenge;
    req.session.save(error => {
        if (error) {
            throw error;
        }

        res.json(options);
    });
};

export const verifyPasskeyAuth: Handler = async (req, res) => {
    if (!req.session.passkeyChallenge) {
        throw new CustomError('Missing passkey challenge');
    }

    const passkey = await Passkeys().where('id', req.body.id).first();
    if (!passkey) {
        throw new CustomError(`Could not find passkey ${req.body.id}`);
    }

    let verification;
    try {
        verification = await verifyAuthenticationResponse({
            response: req.body,
            expectedChallenge: req.session.passkeyChallenge,
            expectedRPID: env.RP_ID,
            expectedOrigin: env.RP_ORIGIN,
            credential: {
                id: passkey.id,
                publicKey: passkey.public_key,
                counter: passkey.counter,
                transports: JSON.parse(passkey.transports),
            },
        });
    } catch (error: any) {
        console.error(error);
        throw new CustomError('There was an error', 400);
    }

    if (verification.verified) {
        await Passkeys()
            .where('id', passkey.id)
            .update('counter', verification.authenticationInfo.newCounter);

        req.session.userId = passkey.user_id;
        req.session.save(error => {
            if (error) {
                throw error;
            }

            res.json({ verified: true });
        });
    } else {
        res.json({ verified: false });
    }
};

export const deletePasskey: Handler = async (req, res) => {
    const affectedRows = await Passkeys()
        .where('id', req.params.id)
        .where('user_id', req.session.userId)
        .delete();

    if (affectedRows > 0) {
        res.redirect('/account');
    } else {
        res.redirect('/account?error=delete-passkey');
    }
};
