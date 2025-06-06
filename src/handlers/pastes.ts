import * as cheerio from 'cheerio';
import { Handler, Request, Response } from 'express';
import hljs from 'highlight.js';
import { minify } from 'html-minifier';
import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import { markedHighlight } from 'marked-highlight';
import xss from 'xss';
import { Pastes } from '../db';
import generateSlug from '../utils/generate-slug';
import isUrl from '../utils/is-url';
import { languages } from '../utils/languages';
import addLineNumbers from '../utils/line-numbers';

marked.use(gfmHeadingId());
marked.use(
    markedHighlight({
        highlight(code, language) {
            return hljs.highlight(code, { language }).value;
        },
    }),
);

export const index: Handler = (req, res) => {
    res.render('index');
};

const renderPaste = (req: Request, res: Response, data: object) => {
    req.app.render('paste', data, (error, html) => {
        if (error) {
            console.error(error);
            throw error;
        }

        const minifiedHtml = minify(html, {
            collapseWhitespace: true,
        });

        res.send(minifiedHtml);
    });
};

export const get =
    (redirectUrls = true): Handler =>
    async (req, res) => {
        const [hash, ext] = req.params.hash.split('.', 2);
        const paste = await Pastes().where({ hash }).first();

        if (!paste) {
            return res.status(404).render('404');
        } else if (paste.is_url && redirectUrls) {
            return res.redirect(paste.content);
        }

        switch (ext) {
            case undefined: {
                const highlightResult = hljs.highlightAuto(
                    paste.content,
                    languages,
                );
                let redirect = `/${hash}.${highlightResult.language || 'txt'}`;

                res.redirect(redirectUrls ? redirect : `/v${redirect}`);
                break;
            }

            case 'md': {
                const sanitizedContent = xss(paste.content).replace(
                    /^&gt; /gm,
                    '> ',
                );

                res.render('paste', {
                    paste,
                    content: marked.parse(sanitizedContent),
                    markdown: true,
                });
                break;
            }

            default: {
                const highlightResult = hljs.highlight(paste.content, {
                    language: ext,
                });

                const $ = cheerio.load(highlightResult.value);
                $('body')
                    .children()
                    .each(function (_, child) {
                        const $child = $(child);
                        if (
                            $child.children().length === 0 &&
                            $child.text().includes('\n')
                        ) {
                            const text = $child.text();
                            text.split('\n').forEach((line, index, lines) => {
                                const $clone = $child.clone();
                                $clone.text(
                                    line +
                                        (index !== lines.length - 1
                                            ? '\n'
                                            : ''),
                                );
                                $clone.insertBefore($child);
                            });
                            $child.remove();
                        }
                    });

                const { content, lineNumbers } = addLineNumbers(
                    $('body').html() || highlightResult.value,
                );

                renderPaste(req, res, {
                    paste,
                    ext,
                    content,
                    lineNumbers,
                });
                break;
            }
        }
    };

export const raw: Handler = async (req, res) => {
    const [hash, ext] = req.params.hash.split('.', 2);
    const paste = await Pastes().where({ hash }).first();

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

export const renderEdit: Handler = async (req, res) => {
    const [hash, ext] = req.params.hash.split('.', 2);
    const paste = await Pastes().where('hash', hash).first();

    res.render('edit', {
        paste,
    });
};

export const edit: Handler = async (req, res) => {
    const { hash } = req.params;
    // const paste = await Pastes().where({ hash }).first();

    const is_url = isUrl(req.body.content);
    // TODO: test with a different account

    await Pastes().where({ hash }).update({
        content: req.body.content,
        is_url,
        updated_at: new Date(),
    });

    if (is_url) {
        return res.redirect(`/v/${hash}`);
    }

    res.redirect(`/${hash}`);
};

export const delete_: Handler = async (req, res) => {
    const { hash } = req.params;

    await Pastes().where({ hash }).delete();

    res.status(200).end();
};
