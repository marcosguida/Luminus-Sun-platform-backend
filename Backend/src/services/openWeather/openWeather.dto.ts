import z from "zod";

export const openWeatherCoordsQuerySchema = z.object({
    lat: z.coerce.number().min(-90).max(90, { message: "Latitude inválida." }),
    lon: z.coerce.number().min(-180).max(180, { message: "Longitude inválida." }),
}).strict();

export const openWeatherByCityQuerySchema = z.object({
    city: z.string().min(1, { message: "Cidade é obrigatória." }),
    state: z.string().min(2).max(2, { message: "UF deve conter 2 caracteres." }).optional(),
    country: z.string().default("BR").optional(),
}).strict();

export type OpenWeatherCoordsQuery = z.infer<typeof openWeatherCoordsQuerySchema>;
export type OpenWeatherByCityQuery = z.infer<typeof openWeatherByCityQuerySchema>;