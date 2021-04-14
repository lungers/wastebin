import { Handler } from 'express';

const ensureLoggedIn = (loggedIn: boolean, redirect: string): Handler => (
    req,
    res,
    next,
) => {
    if (
        (loggedIn && req.session.userId) ||
        (!loggedIn && !req.session.userId)
    ) {
        return next();
    }

    res.redirect(redirect);
};

export default ensureLoggedIn;
