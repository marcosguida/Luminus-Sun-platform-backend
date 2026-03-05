import Elysia from "elysia";
import { regionStationService } from "./regionStation.service";
import { createRegionStationRequestSchema, updateRegionStationRequestSchema } from "./regionStation.dto";
import { zodIdParams } from "@/lib/validators/zod.helpers";
import { isAuthorized } from "@/middlewares/isAuthorized";
import { UserRoles } from "../user/user.model";
import z from "zod";

export const regionStationRoutes = new Elysia({ name: "routes:regionStations", prefix: "/regionStations" })
    .use(isAuthorized)
    .get("/", async () => {
        const regionStations = await regionStationService.Query.findAllRegionStations();
        return regionStations;
    }, {
        // isAuthorized: [UserRoles.ADMIN],
    })
    .get("/:id", async ({ params }) => {
        const { id } = params;

        const regionStation = await regionStationService.Query.findRegionStationById(id);
        return regionStation;
    }, {
        params: zodIdParams.shape.params,
        isAuthorized: [UserRoles.ADMIN],
    })
    .get("/uf/:uf", async ({ params }) => {
        const { uf } = params;

        const regionStations = await regionStationService.Query.findRegionStationsByUf(uf);
        return regionStations;
    }, {
        params: z.object({
            uf: z.string().length(2, { message: "UF deve ter 2 caracteres." }),
        }),
        // isAuthorized: [UserRoles.ADMIN],
    })
    .get("/name/:name", async ({ params }) => {
        const { name } = params;

        const regionStations = await regionStationService.Query.findRegionStationsByName(name);
        return regionStations;
    }, {
        params: z.object({
            name: z.string().min(1, { message: "Nome da região é obrigatório." }),
        }),
        // isAuthorized: [UserRoles.ADMIN],
    })
    .post("/", async ({ body }) => {
        const { name, uf, latitude, longitude } = body;

        const newRegionStation = await regionStationService.Mutation.createRegionStation({
            name,
            uf,
            latitude,
            longitude,
        });

        return newRegionStation;
    }, {
        body: createRegionStationRequestSchema,
        isAuthorized: [UserRoles.ADMIN],
    })
    .put("/:id", async ({ params, body }) => {
        const { id } = params;
        const { name, uf, latitude, longitude } = body;

        const updatedRegionStation = await regionStationService.Mutation.updateRegionStation(id, {
            name,
            uf,
            latitude,
            longitude,
        });

        return updatedRegionStation;
    }, {
        params: zodIdParams.shape.params,
        body: updateRegionStationRequestSchema,
        // isAuthorized: [UserRoles.ADMIN],
    })
    .delete("/:id", async ({ params }) => {
        const { id } = params;

        const deleted = await regionStationService.Mutation.deleteRegionStation(id);
        return deleted;
    }, {
        params: zodIdParams.shape.params,
        // isAuthorized: [UserRoles.ADMIN],
    });
