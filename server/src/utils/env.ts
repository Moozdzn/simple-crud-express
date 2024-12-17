import dotenv from 'dotenv';

dotenv.config();

const env = {
    RATE_LIMIT_WINDOW_MS: Number(process.env.COMMON_RATE_LIMIT_WINDOW_MS ?? 1000),
    RATE_LIMIT_MAX_REQUESTS: Number(process.env.COMMON_RATE_LIMIT_MAX_REQUESTS ?? 100),
    PORT: Number(process.env.PORT ?? 3000),
}

export default env