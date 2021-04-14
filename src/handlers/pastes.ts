import { Handler } from 'express';
import { Pastes } from '../db';
import generateSlug from '../utils/generate-slug';
import isUrl from '../utils/is-url';

export const index: Handler = (req, res) => {
    res.render('index');
};

export const get = (redirectUrls = true): Handler => async (req, res) => {
    const [hash, ext] = req.params.hash.split('.', 2);
    const paste = await Pastes().where({ hash }).first();

    if (!paste) {
        return res.status(404).render('404');
    } else if (paste.is_url && redirectUrls) {
        return res.redirect(paste.content);
    }

    res.render('paste', { paste });
};

export const raw: Handler = async (req, res) => {
    const paste = await Pastes().where('hash', req.params.hash).first();

    if (!paste) {
        res.status(404).send('404 Not Found');
        return;
    }

    res.contentType('text/plain').send(paste.content);
};

export const new_: Handler = async (req, res) => {
    const hash = generateSlug(10);
    const is_url = isUrl(req.body.content);

    await Pastes().insert({
        hash,
        user_id: req.session.userId,
        content: req.body.content,
        is_url,
        created_at: new Date(),
        updated_at: new Date(),
    });

    if (is_url) {
        return res.redirect(`/v/${hash}`);
    }

    res.redirect(`/${hash}`);
};
