import knex from 'knex';
import knexfile from './knexfile';

const db = knex(knexfile);

export const Users = () => db('users');

export default db;
