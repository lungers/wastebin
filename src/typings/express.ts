import { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server';
import { User as IUser } from './knex';

declare global {
    namespace Express {
        interface User extends IUser {}

        interface Locals {
            cspNonce: string;
        }
    }
}

declare module 'express-session' {
    interface SessionData {
        pendingUserId: number;
        userId: number;
        passkeyChallenge: PublicKeyCredentialRequestOptionsJSON['challenge'];
    }
}
