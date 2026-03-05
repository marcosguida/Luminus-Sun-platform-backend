import { z } from "zod";
import { zodId, zodTimestamps } from "../../lib/validators/zod.helpers";

export const createRegionStationRequestSchema = z.object({
    name: z.string().min(1, { message: "Nome da região é obrigatório." }),
    uf: z.string().min(2, { message: "UF inválida." }).max(2, { message: "UF deve conter 2 caracteres." }),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    altitude: z.number().optional(),
    stationCode: z.string().optional(),
    stationType: z.string().optional(),
    status: z.string().optional(),
}).strict();

export const updateRegionStationRequestSchema = z.object({
    name: z.string().min(1, { message: "Nome da região é obrigatório." }).optional(),
    uf: z.string().min(2, { message: "UF inválida." }).max(2, { message: "UF deve conter 2 caracteres." }).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    altitude: z.number().optional(),
    stationCode: z.string().optional(),
    stationType: z.string().optional(),
    status: z.string().optional(),
}).strict().partial();

export const regionStationResponseSchema = z.object({
    _id: zodId,
    name: z.string(),
    uf: z.string().length(2),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    location: z.object({
        type: z.literal("Point"),
        coordinates: z.tuple([z.number(), z.number()]),
    }).optional(),
    altitude: z.number().optional(),
    stationCode: z.string().optional(),
    stationType: z.string().optional(),
    status: z.string().optional(),
    ...zodTimestamps.shape,
}).strict();

export type CreateRegionStationRequest = z.infer<typeof createRegionStationRequestSchema>;
export type UpdateRegionStationRequest = z.infer<typeof updateRegionStationRequestSchema>;
export type RegionStationResponse = z.infer<typeof regionStationResponseSchema>;