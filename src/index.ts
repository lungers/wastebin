import knexSessionStore from 'connect-session-knex';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import passport from 'passport';
import path from 'path';
import db from './db';
import env from './env';
import { CustomError } from './utils/custom-error';

import './passport';
import routes from './routes';

const app = express();
const KnexSessionStore = knexSessionStore(session);

app.set('trust proxy', env.TRUST_PROXY);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(helmet());
app.use('/s', express.static(path.join(__dirname, 'static')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(
    session({
        secret: env.SESSION_SECRET,
        cookie: {
            httpOnly: true,
            maxAge: 604_800_000, // 7 days in milliseconds
            secure: env.isProd,
        },
        resave: false,
        saveUninitialized: false,
        store: new KnexSessionStore({ knex: db }),
    }),
);

app.use(routes);

app.use((error: Error | CustomError, req: any, res: any, next: any) => {
    if (!('statusCode' in error) || error.statusCode >= 500) {
        console.error(error);
    }

    res.status('statusCode' in error ? error.statusCode : 500).end(
        error.message,
    );
});

app.listen(env.PORT, () => {
    console.log('Listening on port', env.PORT);
});
