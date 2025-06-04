import knex from 'knex';
import knexfile from './knexfile';
import { Passkey, Paste, User } from './typings/knex';

const db = knex(knexfile);

export const Users = () => db<User>('users');
export const Pastes = () => db<Paste>('pastes');
export const Passkeys = () => db<Passkey>('passkeys');

export default db;
