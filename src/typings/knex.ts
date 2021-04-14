export interface User {
    id: number;
    email: string;
    password: string;
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
