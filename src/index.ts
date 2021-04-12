import helmet from 'helmet';
import express from 'express';
import session from 'express-session';
import knexSessionStore from 'connect-session-knex';
import env from './env';
import db from './db';

import { auth } from './routes/api';

const app = express();
const KnexSessionStore = knexSessionStore(session);

app.set('trust proxy', env.TRUST_PROXY);

app.use(helmet());
app.use(express.json());
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

app.use(auth);

// TODO: remove this
app.get('/', (req, res) => {
    res.send('Hello world!');
});

app.listen(env.PORT, () => {
    console.log('Listening on port', env.PORT);
});
