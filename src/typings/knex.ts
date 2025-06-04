import { Base64URLString, CredentialDeviceType } from '@simplewebauthn/server';

export interface User {
    id: number;
    email: string;
    password: string;
    '2fa_enabled': boolean;
    '2fa_secret': string | null;
    passkey_challenge: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface Paste {
    id: number;
    hash: string;
    user_id: User['id'];
    content: string;
    is_url: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface Passkey {
    id: Base64URLString;
    name: string;
    user_id: User['id'];
    public_key: Buffer;
    counter: number;
    device_type: CredentialDeviceType;
    backed_up: boolean;
    webauthn_user_id: Base64URLString;
    transports: string; // AuthenticatorTransportFuture[]
    created_at: Date;
    updated_at: Date;
}
