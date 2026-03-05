import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { env } from './config/env';
import cors from "@elysiajs/cors";
import jwt from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";
import z from "zod";
import { onError } from "./middlewares/onError";
import { userRoutes } from "./modules/user/user.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { connectDatabase } from "./config/db";
import { inmetRoutes } from "./services/inmet/inmet.routes";
import { regionStationRoutes } from "./modules/region/regionStation.routes";
import { weatherRoutes } from "./modules/weather/weather.routes";
import { ibgeGeocodingRoutes } from "./services/ibgeGeocoding/ibgeGeocoding.routes";
import { openWeatherRoutes } from "./services/openWeather/openWeather.routes";
import { weatherJob } from "./jobs/weatherJob";
import { forecastEnergyJob } from "./jobs/forecastJob";
import { forecastEnergyRoutes } from "./modules/forecast/forecastEnergy.routes";
import { onsEnergyJob } from "./jobs/energyJob";

await connectDatabase(env.MONGO_URI);

const apiRoutes = new Elysia({ prefix: "/api" })
    .use(authRoutes)
    .use(userRoutes)
    .use(regionStationRoutes)
    .use(weatherRoutes)
    .use(forecastEnergyRoutes)
    .use(inmetRoutes)
    .use(ibgeGeocodingRoutes)
    .use(openWeatherRoutes);

const app = new Elysia()
    .use(cors({
        origin: env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
    }))
    .use(jwt({
        name: 'jwt',
        secret: env.JWT_SECRET,
        exp: env.JWT_EXPIRES_IN,
    }))
    .use(cookie())
    .use(openapi({
        path: "/docs",
        specPath: "/docs.json",
        mapJsonSchema: {
            zod: z.toJSONSchema
        },
        documentation: {
            info: {
                title: 'API ',
                version: '1.0.0',
                description: 'API Configuração',
            },
        }
    }))
    .use(onError)
    .use(apiRoutes)
    .use(weatherJob)
    .use(forecastEnergyJob)
    .use(onsEnergyJob)
    .listen(env.PORT);

console.log(
    `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
