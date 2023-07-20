import { User as IUser } from './knex';

declare global {
    namespace Express {
        interface User extends IUser {}
    }
}

declare module 'express-session' {
    interface SessionData {
        pendingUserId: number;
        userId: number;
    }
}
