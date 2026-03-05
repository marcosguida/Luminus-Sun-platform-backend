import Elysia from "elysia";
import { ibgeGeocodingService } from "./ibgeGeocoding.service";
import z from "zod";

export const ibgeGeocodingRoutes = new Elysia({ name: 'externalServices:routes:ibge-geocoding', prefix: '/ibge-geocoding' })
    .get("/states", async () => {
        const states = await ibgeGeocodingService.getAllStates();
        return states;
    })
    .get("/states/:uf/cities", async ({ params }) => {
        const { uf } = params;
        const cities = await ibgeGeocodingService.getAllCitiesByState(uf);
        return cities;
    }, {
        params: z.object({
            uf: z.string().min(1),
        })
    });