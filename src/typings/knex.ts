export interface User {
    id: number;
    email: string;
    password: string;
    '2fa_enabled': boolean;
    '2fa_secret': string | null;
    created_at: Date;
    updated_at: Date;
}

export interface Paste {
    id: number;
    hash: string;
    user_id: number;
    content: string;
    is_url: boolean;
    created_at: Date;
    updated_at: Date;
}
