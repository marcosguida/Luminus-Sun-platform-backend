import { z } from "zod";

const envSchema = z.object({
    MONGO_URI: z.string().min(1),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    OPENWEATHER_API_KEY: z.string().min(1),
    HOST: z.string().default("localhost"),
    PORT: z.coerce.number().default(3030),
    CORS_ORIGIN: z.string().optional(),
    JWT_SECRET: z.string().min(1),
    JWT_EXPIRES_IN: z.coerce.string().default("7d"),
})

export const env = envSchema.parse(process.env);