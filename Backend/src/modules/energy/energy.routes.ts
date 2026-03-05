import Elysia from "elysia";
import z from "zod";
import { energyService } from "./energy.service";
import { CreateEnergyRequest, createEnergyRequestSchema, UpdateEnergyRequest, updateEnergyRequestSchema } from "./energy.dto";
import { BrazilianRegion, EnergyType } from "./energy.model";
import { zodIdParams } from "@/lib/validators/zod.helpers";
import { UserRoles } from "../user/user.model";
import { isAuthorized } from "@/middlewares/isAuthorized";
import { energyAnalysisService } from "./energyAnalysis.service";

export const energyRoutes = new Elysia({ name: "routes:energy", prefix: "/energy" })
    .use(isAuthorized)

    .get("/", async () => {
        return await energyService.Query.findAllEnergies();
    }, {
        // isAuthorized: [UserRoles.ADMIN],
    })

    .get("/:id", async ({ params }) => {
        const { id } = params;
        return await energyService.Query.findEnergyById(id);
    }, {
        params: zodIdParams.shape.params,
        // isAuthorized: [UserRoles.ADMIN],
    })

    .get("/region/:region", async ({ params }) => {
        const schema = z.object({
            region: z.nativeEnum(BrazilianRegion),
        });
        const { region } = schema.parse(params);

        return await energyService.Query.findEnergiesByRegion(region);
    })

    .get("/type/:energyType", async ({ params }) => {
        const schema = z.object({
            energyType: z.nativeEnum(EnergyType),
        });
        const { energyType } = schema.parse(params);

        return await energyService.Query.findEnergiesByType(energyType);
    })
    
    .get("/date/:date", async ({ params }) => {
        const schema = z.object({
            date: z.string().refine((val) => !isNaN(Date.parse(val)), {
                message: "Data inválida. Use o formato ISO (YYYY-MM-DD).",
            }),
        });
        const { date } = schema.parse(params);

        return await energyService.Query.findEnergiesByDate(new Date(date));
    })

    .post("/sync/ons", async () => {
        return await energyService.Mutation.syncONS();
    }, {
        // isAuthorized: [UserRoles.ADMIN],
    })

    .get("/report/:region", async ({ params, query }) => {
        const { region } = params;

        const hours = query.hours ? Number(query.hours) : 6;

        return await energyAnalysisService.getPerformanceReport(region, hours);
    }, {
        params: z.object({
            region: z.enum(BrazilianRegion),
        }),
        query: z.object({
            hours: z.string().optional(),
        }),
        // isAuthorized: [UserRoles.ADMIN, UserRoles.USER],
    });
