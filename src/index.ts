import helmet from 'helmet';
import express from 'express';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import knexSessionStore from 'connect-session-knex';
import env from './env';
import db from './db';

import './passport';
import routes from './routes';

const app = express();
const KnexSessionStore = knexSessionStore(session);

app.set('trust proxy', env.TRUST_PROXY);

app.use(helmet());
// TODO: don't add cors for all routes
app.use(cors());
app.use(express.json());
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

app.listen(env.PORT, () => {
    console.log('Listening on port', env.PORT);
});
