import { cleanEnv, str, port, bool } from 'envalid';
import dotenv from 'dotenv';

dotenv.config();

export default cleanEnv(process.env, {
    PORT: port({ default: 5294 }),
    TRUST_PROXY: bool({ default: false }),
    SESSION_SECRET: str(),

    DB_HOST: str(),
    DB_USER: str(),
    DB_DATABASE: str(),
    DB_PASSWORD: str(),
});
