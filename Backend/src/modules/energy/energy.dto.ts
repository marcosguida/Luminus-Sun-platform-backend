import { z } from "zod";
import { zodId, zodTimestamps } from "../../lib/validators/zod.helpers";
import { EnergyType, BrazilianRegion } from "./energy.model";


export const createEnergyRequestSchema = z.object({
    regionName: z.nativeEnum(BrazilianRegion).optional(),
    energyType: z.nativeEnum(EnergyType),
    generationMW: z.number().min(0, { message: "Geração (MW) deve ser um valor positivo." }),
    loadMW: z.number().min(0, { message: "Carga (MW) deve ser um valor positivo." }).optional(),
    source: z.string().optional(),
    timestamp: z.coerce.date().optional(),
}).strict();


export const updateEnergyRequestSchema = z.object({
    regionName: z.nativeEnum(BrazilianRegion).optional(),
    energyType: z.nativeEnum(EnergyType).optional(),
    generationMW: z.number().min(0, { message: "Geração (MW) deve ser um valor positivo." }).optional(),
    loadMW: z.number().min(0, { message: "Carga (MW) deve ser um valor positivo." }).optional(),
    source: z.string().optional(),
    timestamp: z.coerce.date().optional(),
}).strict().partial();


export const energyResponseSchema = z.object({
    _id: zodId,
    regionName: z.nativeEnum(BrazilianRegion).optional(),
    energyType: z.nativeEnum(EnergyType),
    generationMW: z.number(),
    loadMW: z.number().optional(),
    source: z.string().optional(),
    timestamp: z.string().datetime(),
    ...zodTimestamps.shape,
}).strict();


export type CreateEnergyRequest = z.infer<typeof createEnergyRequestSchema>;
export type UpdateEnergyRequest = z.infer<typeof updateEnergyRequestSchema>;
export type EnergyResponse = z.infer<typeof energyResponseSchema>;
