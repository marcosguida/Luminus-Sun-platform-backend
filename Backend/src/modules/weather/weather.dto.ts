import { z } from "zod";
import { zodId, zodTimestamps } from "../../lib/validators/zod.helpers";

export const createWeatherRequestSchema = z
    .object({
        regionId: zodId.optional(),
        temperature: z.number({ message: "Temperatura é obrigatória." }),
        feelsLike: z.number().optional(),
        minTemp: z.number().optional(),
        maxTemp: z.number().optional(),
        humidity: z.number({ message: "Umidade é obrigatória." }),
        pressure: z.number().optional(),
        windSpeed: z.number().optional(),
        windDeg: z.number().optional(),
        clouds: z.number().optional(),
        visibility: z.number().optional(),
        rainVolume: z.number().optional(),
        solarIrradiance: z.number().optional(),
        description: z.string().optional(),
        source: z.string().optional(),
        timestamp: z.date().optional(),
    })
    .strict();

export const updateWeatherRequestSchema = createWeatherRequestSchema.partial();

export const weatherResponseSchema = z
    .object({
        _id: zodId,
        regionId: zodId.optional(),
        temperature: z.number(),
        feelsLike: z.number().optional(),
        minTemp: z.number().optional(),
        maxTemp: z.number().optional(),
        humidity: z.number(),
        pressure: z.number().optional(),
        windSpeed: z.number().optional(),
        windDeg: z.number().optional(),
        clouds: z.number().optional(),
        visibility: z.number().optional(),
        rainVolume: z.number().optional(),
        solarIrradiance: z.number().optional(),
        description: z.string().optional(),
        source: z.string().optional(),
        timestamp: z.date(),
        ...zodTimestamps.shape,
    })
    .strict();

export type CreateWeatherRequest = z.infer<typeof createWeatherRequestSchema>;
export type UpdateWeatherRequest = z.infer<typeof updateWeatherRequestSchema>;
export type WeatherResponse = z.infer<typeof weatherResponseSchema>;
