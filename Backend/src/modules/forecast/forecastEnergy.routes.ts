import Elysia from "elysia";
import z from "zod";
import { forecastEnergyService } from "./forecastEnergy.service";
import { zodIdParams } from "@/lib/validators/zod.helpers";
import { UserRoles } from "../user/user.model";
import { isAuthorized } from "@/middlewares/isAuthorized";

export const forecastEnergyRoutes = new Elysia({
    name: "routes:forecastEnergy",
    prefix: "/forecast-energy",
})
    .use(isAuthorized)
    .get("/", async () => {
        const forecasts = await forecastEnergyService.Query.getAllForecasts();
        return forecasts;
    }, {
        // isAuthorized: [UserRoles.ADMIN],
    })

    .get("/region/:regionId", async ({ params }) => {
        const { regionId } = params;
        const forecasts = await forecastEnergyService.Query.getForecastsByRegion(regionId);
        return forecasts;
    }, {
        params: z.object({
            regionId: z.string().min(1, { message: "ID da região é obrigatório." }),
        }),
        // isAuthorized: [UserRoles.ADMIN, UserRoles.USER],
    })

    .get("/region/:regionId/next5days", async ({ params }) => {
        const { regionId } = params;
        const forecasts = await forecastEnergyService.Query.getForecastByRegionAndDate(regionId);
        return forecasts;
    }, {
        params: z.object({
            regionId: z.string().min(1, { message: "ID da região é obrigatório." }),
        }),
        // isAuthorized: [UserRoles.ADMIN, UserRoles.USER],
    })

    .post("/generate/:regionId", async ({ params }) => {
        const { regionId } = params;
        const result = await forecastEnergyService.Mutation.generateForecastForRegion(regionId);
        return {
            message: "Previsões energéticas geradas com sucesso.",
            ...result,
        };
    }, {
        params: z.object({
            regionId: z.string().min(1, { message: "ID da região é obrigatório." }),
        }),
        // isAuthorized: [UserRoles.ADMIN, UserRoles.USER],
    })

    .post("/generate-all", async () => {
        const result = await forecastEnergyService.Mutation.generateForecastsForAllRegions();
        return {
            message: "Previsões energéticas geradas para todas as regiões.",
            ...result,
        };
    }, {
        // isAuthorized: [UserRoles.ADMIN],
    });