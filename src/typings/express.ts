import { SessionData } from 'express-session';
import { User as IUser, Paste } from './knex';

declare global {
    namespace Express {
        interface User extends IUser {}
    }
}

declare module 'express-session' {
    interface SessionData {
        userId: number;
    }
}
