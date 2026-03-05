import { z } from "zod";
import { zodId, zodTimestamps } from "@/lib/validators/zod.helpers";

export const createForecastEnergyRequestSchema = z.object({
    regionId: z.string().optional(),
    weatherId: z.string().optional(),
    forecastDate: z.coerce.date({ message: "Data da previsão é obrigatória." }),
    irradiance: z.number({ message: "Irradiância solar é obrigatória." })
        .positive({ message: "Irradiância deve ser um número positivo." }),
    predictedEnergy: z.number({ message: "Energia prevista é obrigatória." })
        .positive({ message: "Energia prevista deve ser um número positivo." }),
    efficiencyRate: z.number().min(0).max(100).optional(),
    savingsEstimate: z.number().min(0).optional(),
    co2Reduction: z.number().min(0).optional(),
    confidenceLevel: z.number().min(0).max(1).optional(),
    recommendation: z.string().optional(),
}).strict();

export const updateForecastEnergyRequestSchema = z
    .object({
        regionId: z.string().optional(),
        weatherId: z.string().optional(),
        forecastDate: z.coerce.date().optional(),
        irradiance: z.number().positive().optional(),
        predictedEnergy: z.number().positive().optional(),
        efficiencyRate: z.number().min(0).max(100).optional(),
        savingsEstimate: z.number().min(0).optional(),
        co2Reduction: z.number().min(0).optional(),
        confidenceLevel: z.number().min(0).max(1).optional(),
        recommendation: z.string().optional(),
    })
    .strict()
    .partial();

export const forecastEnergyResponseSchema = z
    .object({
        _id: zodId,
        regionId: z.string().optional(),
        weatherId: z.string().optional(),
        forecastDate: z.date(),
        irradiance: z.number(),
        predictedEnergy: z.number(),
        efficiencyRate: z.number().optional(),
        savingsEstimate: z.number().optional(),
        co2Reduction: z.number().optional(),
        confidenceLevel: z.number().optional(),
        recommendation: z.string().optional(),
        ...zodTimestamps.shape,
    })
    .strict();

export type CreateForecastEnergyRequest = z.infer<typeof createForecastEnergyRequestSchema>;
export type UpdateForecastEnergyRequest = z.infer<typeof updateForecastEnergyRequestSchema>;
export type ForecastEnergyResponse = z.infer<typeof forecastEnergyResponseSchema>;
