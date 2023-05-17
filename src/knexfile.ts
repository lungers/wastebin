if (process.argv[1].endsWith('/node_modules/.bin/knex')) {
    require('dotenv').config({ path: '../.env' });
}

import { Knex } from 'knex';
import env from './env';

const knexConfig: Knex.Config = {
    client: 'mysql',
    connection: {
        host: env.DB_HOST,
        user: env.DB_USER,
        database: env.DB_DATABASE,
        password: env.DB_PASSWORD,
        port: env.DB_PORT,
        charset: 'utf8mb4',
    },
    migrations: {
        directory: '../migrations',
    },
};

export default knexConfig;
