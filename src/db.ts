import knex from 'knex';
import knexfile from './knexfile';
import { User } from './typings/knex';

const db = knex(knexfile);

export const Users = () => db<User>('users');

export default db;
